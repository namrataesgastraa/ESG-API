const XLSX = require("xlsx");

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalize = (value) =>
  clean(value).toLowerCase().replace(/[^a-z0-9]/g, "");

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

const parseKeyTakeaways = (rows) => {
  return rows
    .filter((row) => clean(row.Type).toLowerCase() === "bullet")
    .map((row) =>
      clean(
        row.Content ||
          row.content ||
          row.Text ||
          row.text ||
          row.Takeaway ||
          row.takeaway ||
          row.Value ||
          row.value
      )
    )
    .filter(Boolean);
};

const parseSectionSheet = (rows, orderFallback, fallbackHeading) => {
  const titleRow = rows.find(
    (row) => clean(row.Type).toLowerCase() === "section-title"
  );

  const heading = clean(titleRow?.Content) || fallbackHeading;
  const bullets = [];
  const paragraphs = [];

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

  return {
    tab_order: orderFallback,
    heading,
    content: {
      paragraphs,
      bullets,
    },
  };
};

const parseFAQSheet = (rows, orderFallback) => {
  const titleRow = rows.find(
    (row) => clean(row.Type).toLowerCase() === "section-title"
  );

  const heading = clean(titleRow?.Content) || "Frequently Asked Questions";
  const bullets = [];

  rows.forEach((row) => {
    const type = clean(row.Type).toLowerCase();
    const question = clean(row.Content);
    const rowId = Number(row.RowId);

    if (type !== "question" || !question) return;

    const answerRow = rows.find(
      (child) =>
        Number(child.ParentId) === rowId &&
        clean(child.Type).toLowerCase() === "answer"
    );

    bullets.push({
      lead: question,
      body: clean(answerRow?.Content),
    });
  });

  return {
    tab_order: orderFallback,
    heading,
    content: {
      paragraphs: [],
      bullets,
      is_faq: true,
    },
  };
};

const parseRelatedBlogs = (rows) => {
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

exports.parseBlogExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const basicRows = getSheetRows(workbook, "Basic Info");

  if (!basicRows.length) {
    throw new Error(
      `Basic Info sheet not found. Available sheets: ${workbook.SheetNames.join(", ")}`
    );
  }

  const info = parseBasicInfo(basicRows);

  const keyTakeawayRows = getSheetRows(workbook, "Key Takeaways");
  const key_takeaways = parseKeyTakeaways(keyTakeawayRows);

  const tabs = [];

  const sectionSheetNames = [
    "Intro",
    "Section 2",
    "Section 3",
    "Section 4",
    "Conclusion",
  ];

  sectionSheetNames.forEach((sheetName) => {
    const rows = getSheetRows(workbook, sheetName);
    if (!rows.length) return;

    tabs.push(parseSectionSheet(rows, tabs.length + 1, sheetName));
  });

  const faqRows = getSheetRows(workbook, "FAQ");
  if (faqRows.length) {
    tabs.push(parseFAQSheet(faqRows, tabs.length + 1));
  }

  const relatedRows = getSheetRows(workbook, "Related Blogs");
  const related_blogs = parseRelatedBlogs(relatedRows);

  return {
    blog_name: clean(info["Author"]) || "ESG Astraa Admin",

    main_title: clean(info["Title"]) || "Untitled Blog",
    sub_title: clean(info["Subtitle"]),

    slug:
      clean(info["Slug"]) ||
      clean(info["URL Slug"]) ||
      clean(info["Url Slug"]) ||
      clean(info["SEO Slug"]) ||
      clean(info["Permalink"]) ||
      "",

    eyebrow: clean(info["Industry Tag"]) || "All Industries",
    industry_tag: clean(info["Industry Tag"]) || "All Industries",

    published_date: clean(info["Date"]) || "",
    read_time: clean(info["Read Time"]) || "",
    author_name: clean(info["Author"]) || "ESG Astraa Admin",
    summary: clean(info["Summary"]) || "",
    cover_alt: clean(info["Cover Image Alt"]) || clean(info["Title"]) || "",

    intro_paragraph_1: "",
    intro_paragraph_2: "",

    cta_text: clean(info["CTA Text"]) || "Talk to our team",
    cover_caption: clean(info["Image Caption"]),

    key_takeaways,
    related_blogs,

    tabs,
    references: [],
  };
};