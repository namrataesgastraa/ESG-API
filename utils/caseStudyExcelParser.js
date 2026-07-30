const XLSX = require("xlsx");

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalize = (value) =>
  clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");

const toBoolean = (value) => {
  const text = clean(value).toLowerCase();
  return text === "true" || text === "yes" || text === "1";
};

const toList = (value) =>
  clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getSheetRows = (workbook, sheetName) => {
  const actualName = workbook.SheetNames.find(
    (name) => normalize(name) === normalize(sheetName)
  );

  if (!actualName) return [];

  return XLSX.utils.sheet_to_json(workbook.Sheets[actualName], {
    defval: "",
    range: 1,
  });
};

const parseBasicInfo = (rows) => {
  const info = {};

  rows.forEach((row) => {
    const field = clean(row.Field);
    const value = clean(row.Value);
    if (field) info[field] = value;
  });

  return info;
};

const parseSummary = (rows) => {
  const titleRow = rows.find(
    (row) => clean(row.Type).toLowerCase() === "section-title"
  );

  const heading = clean(titleRow?.Content) || "Summary";
  const paragraphs = [];
  const bullets = [];

  const paragraphsByParentId = new Map();
  rows.forEach((row) => {
    if (clean(row.Type).toLowerCase() !== "paragraph") return;
    const parentId = Number(row.ParentId);
    if (!paragraphsByParentId.has(parentId)) paragraphsByParentId.set(parentId, []);
    const content = clean(row.Content);
    if (content) paragraphsByParentId.get(parentId).push(content);
  });

  rows.forEach((row) => {
    const type = clean(row.Type).toLowerCase();
    const content = clean(row.Content);
    const rowId = Number(row.RowId);
    const parentId = Number(row.ParentId);

    if (!content || type === "section-title" || type === "sub-heading") return;

    if (type === "paragraph" && (!parentId || parentId === Number(titleRow?.RowId))) {
      paragraphs.push(content);
    }

    if (type === "bullet") {
      const childParagraphs = paragraphsByParentId.get(rowId) || [];

      bullets.push({
        lead: content,
        body: childParagraphs.join("\n\n"),
      });
    }
  });

  return { heading, paragraphs, bullets };
};

const parseKeyInsights = (rows) => {
  return rows
    .filter((row) => clean(row.Type).toLowerCase() === "bullet")
    .map((row) => clean(row.Content || row.Text || row.Value))
    .filter(Boolean);
};

const parseRelatedCaseStudies = (rows) => {
  return rows
    .map((row) => ({
      card_number:
        Number(clean(row.CardNumber) || clean(row["Card Number"])) || null,
      image_url: clean(row["Image URL"]) || clean(row.ImageUrl),
      image_alt: clean(row["Image Alt"]) || clean(row.ImageAlt),
      category_tag: clean(row["Category Tag"]) || clean(row.CategoryTag),
      title: clean(row.Title),
      description: clean(row.Description),
      link:
        clean(row["Link URL (Slug)"]) ||
        clean(row["Link URL"]) ||
        clean(row.Link) ||
        clean(row.Slug),
    }))
    .filter((card) => card.title || card.image_url || card.link)
    .sort((a, b) => (a.card_number ?? 0) - (b.card_number ?? 0));
};

exports.parseCaseStudyExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const basicRows = getSheetRows(workbook, "Basic Info");

  if (!basicRows.length) {
    throw new Error(
      `Basic Info sheet not found. Available sheets: ${workbook.SheetNames.join(", ")}`
    );
  }

  const info = parseBasicInfo(basicRows);

  const summary_content = parseSummary(getSheetRows(workbook, "Summary"));
  const key_insights = parseKeyInsights(getSheetRows(workbook, "Key Insights"));
  const related_case_studies = parseRelatedCaseStudies(
    getSheetRows(workbook, "Related Case Studies")
  );

  const industryTag = clean(info["Industry Tag"]) || "Case Study";

  return {
    title: clean(info["Title"]) || "Untitled Case Study",
    slug:
      clean(info["Slug"]) ||
      clean(info["URL Slug"]) ||
      clean(info["SEO Slug"]) ||
      clean(info["Permalink"]) ||
      "",
    subtitle: clean(info["Subtitle"]),
    eyebrow: industryTag,
    industry_tag: industryTag,
    category_tags: toList(info["Category Tags"]),
    published_date: clean(info["Date"]),
    read_time: clean(info["Read Time"]),
    author_name: clean(info["Client"]) || clean(info["Author"]),
    cover_alt: clean(info["Cover Image Alt"]) || clean(info["Title"]),
    cover_caption: clean(info["Image Caption"]),
    cover_image_url: clean(info["Cover Image URL"]),
    pdf_url: clean(info["PDF URL"]),
    published: toBoolean(info["Published"]),
    featured: toBoolean(info["Featured"]),

    summary_content,
    key_insights,
    related_case_studies,
  };
};
