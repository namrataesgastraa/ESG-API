const {
  CaseStudy,
  Category,
  CaseStudyDownload,
  WhitePaper,
  WhitePaperCategory,
  WhitePaperDownload,
  Blog,
  BlogTab,
  BlogTabBullet,
  BlogReference,
  BlogDownload,
} = require("../models");
const { generatePublicToken } = require("../utils/publicToken");

// Pulls the blog id out of a related-card link.
// Handles "https://site.com/insights/blogs/4", "/insights/blogs/4"
// and future slug form "/insights/blogs/my-slug-4".
const extractBlogIdFromLink = (link) => {
  if (!link) return null;
  let path = String(link).trim();
  try {
    path = new URL(path).pathname;
  } catch {
    /* not an absolute URL — use the raw value */
  }
  const lastSegment = path.split("/").filter(Boolean).pop() || "";
  const tail = lastSegment.split("-").pop() || "";
  return /^\d+$/.test(tail) ? Number(tail) : null;
};

// Auto-fills each related card's image (and blank title/category) from the
// linked blog's stored S3 cover, so editors don't repeat image URLs in Excel.
// An explicit Excel Image URL still wins as an override.
const enrichRelatedBlogs = async (relatedBlogs) => {
  if (!Array.isArray(relatedBlogs) || relatedBlogs.length === 0) {
    return relatedBlogs || [];
  }

  const idByCard = new Map();
  relatedBlogs.forEach((card) => {
    const id = extractBlogIdFromLink(card?.link);
    if (id) idByCard.set(card, id);
  });

  const ids = [...new Set([...idByCard.values()])];
  if (ids.length === 0) return relatedBlogs;

  const linked = await Blog.findAll({
    where: { id: ids, is_delete: false, is_active: true },
    attributes: ["id", "cover_image", "main_title", "eyebrow", "industry_tag"],
  });
  const byId = new Map(linked.map((b) => [b.id, b.toJSON()]));

  return relatedBlogs.map((card) => {
    const source = byId.get(idByCard.get(card));
    if (!source) return card;
    return {
      ...card,
      image_url: card.image_url || source.cover_image || "",
      title: card.title || source.main_title || "",
      category_tag:
        card.category_tag || source.eyebrow || source.industry_tag || "",
    };
  });
};

exports.getPublicToken = (req, res) => {
  try {
    const token = generatePublicToken();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Token generated",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

const resolveUploadUrl = (value, baseUrl, folder) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}/uploads/case-study/${folder}/${value}`;
};

const enrichRelatedCaseStudies = async (related) => {
  if (!Array.isArray(related) || related.length === 0) return related || [];

  const idByCard = new Map();
  related.forEach((card) => {
    const id = extractBlogIdFromLink(card?.link);
    if (id) idByCard.set(card, id);
  });

  const ids = [...new Set([...idByCard.values()])];
  if (ids.length === 0) return related;

  const linked = await CaseStudy.findAll({
    where: { id: ids, is_delete: false, is_active: true },
    attributes: ["id", "cover_image", "image", "title", "eyebrow", "industry_tag"],
  });
  const byId = new Map(linked.map((c) => [c.id, c.toJSON()]));

  return related.map((card) => {
    const source = byId.get(idByCard.get(card));
    if (!source) return card;
    return {
      ...card,
      image_url: card.image_url || source.cover_image || source.image || "",
      title: card.title || source.title || "",
      category_tag: card.category_tag || source.eyebrow || source.industry_tag || "",
    };
  });
};

exports.getPublicCaseStudies = async (req, res) => {
  try {
    const { id } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (id) {
      const caseStudy = await CaseStudy.findOne({
        where: { id, is_delete: false, is_active: true },
        include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      });

      if (!caseStudy) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: "Case study not found",
        });
      }

      const obj = caseStudy.toJSON();
      obj.cover_image = resolveUploadUrl(obj.cover_image || obj.image, baseUrl, "image");
      obj.image_url = obj.cover_image;
      obj.pdf_url = resolveUploadUrl(obj.pdf_file, baseUrl, "pdf");
      obj.key_insights = Array.isArray(obj.key_insights) ? obj.key_insights : [];
      obj.category_tags = Array.isArray(obj.category_tags) ? obj.category_tags : [];
      obj.related_case_studies = await enrichRelatedCaseStudies(obj.related_case_studies);

      return res.status(200).json({
        status: true,
        responseCode: 200,
        message: "Case study fetched",
        data: obj,
      });
    }

    const data = await CaseStudy.findAll({
      where: { is_delete: false, is_active: true },
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      attributes: [
        "id", "title", "slug", "subtitle", "description", "eyebrow",
        "industry_tag", "pdf_file", "image", "cover_image", "createdAt",
      ],
      order: [["id", "DESC"]],
    });

    const finalData = data.map((item) => {
      const obj = item.toJSON();
      obj.image_url = resolveUploadUrl(obj.cover_image || obj.image, baseUrl, "image");
      obj.cover_image = obj.image_url;
      obj.pdf_url = resolveUploadUrl(obj.pdf_file, baseUrl, "pdf");
      return obj;
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Case studies fetched",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadCaseStudy = async (req, res) => {
  try {
    const { case_study_id, email, mobile, ip_address } = req.body;

    if (!case_study_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const caseStudy = await CaseStudy.findOne({
      where: {
        id: case_study_id,
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (!caseStudy) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Case study not found",
      });
    }

    await CaseStudyDownload.create({
      email,
      mobile,
      case_study_id,
      title: caseStudy.title,
      category_name: caseStudy.category?.name || null,
      ip_address,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = resolveUploadUrl(caseStudy.pdf_file, baseUrl, "pdf");

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

const resolveWhitePaperUrl = (value, baseUrl, folder) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}/uploads/white-paper/${folder}/${value}`;
};

const enrichRelatedWhitepapers = async (related) => {
  if (!Array.isArray(related) || related.length === 0) return related || [];

  const idByCard = new Map();
  related.forEach((card) => {
    const id = extractBlogIdFromLink(card?.link);
    if (id) idByCard.set(card, id);
  });

  const ids = [...new Set([...idByCard.values()])];
  if (ids.length === 0) return related;

  const linked = await WhitePaper.findAll({
    where: { id: ids, is_delete: false, is_active: true },
    attributes: ["id", "cover_image", "image", "title", "eyebrow", "industry_tag"],
  });
  const byId = new Map(linked.map((w) => [w.id, w.toJSON()]));

  return related.map((card) => {
    const source = byId.get(idByCard.get(card));
    if (!source) return card;
    return {
      ...card,
      image_url: card.image_url || source.cover_image || source.image || "",
      title: card.title || source.title || "",
      category_tag: card.category_tag || source.eyebrow || source.industry_tag || "",
    };
  });
};

exports.getPublicWhitePaper = async (req, res) => {
  try {
    const { id } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    if (id) {
      const whitePaper = await WhitePaper.findOne({
        where: { id, is_delete: false, is_active: true },
        include: [{ model: WhitePaperCategory, as: "category", attributes: ["id", "name"] }],
      });

      if (!whitePaper) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: "Whitepaper not found",
        });
      }

      const obj = whitePaper.toJSON();
      obj.cover_image = resolveWhitePaperUrl(obj.cover_image || obj.image, baseUrl, "image");
      obj.image_url = obj.cover_image;
      obj.pdf_url = resolveWhitePaperUrl(obj.pdf_file, baseUrl, "pdf");
      obj.key_insights = Array.isArray(obj.key_insights) ? obj.key_insights : [];
      obj.category_tags = Array.isArray(obj.category_tags) ? obj.category_tags : [];
      obj.frameworks_covered = Array.isArray(obj.frameworks_covered) ? obj.frameworks_covered : [];
      obj.graphs = Array.isArray(obj.graphs) ? obj.graphs : [];
      obj.related_whitepapers = await enrichRelatedWhitepapers(obj.related_whitepapers);

      return res.status(200).json({
        status: true,
        responseCode: 200,
        message: "Whitepaper fetched",
        data: obj,
      });
    }

    const data = await WhitePaper.findAll({
      where: { is_delete: false, is_active: true },
      include: [{ model: WhitePaperCategory, as: "category", attributes: ["id", "name"] }],
      attributes: [
        "id", "title", "slug", "subtitle", "description", "eyebrow",
        "industry_tag", "pdf_file", "image", "cover_image", "createdAt",
      ],
      order: [["id", "DESC"]],
    });

    const finalData = data.map((item) => {
      const obj = item.toJSON();
      obj.image_url = resolveWhitePaperUrl(obj.cover_image || obj.image, baseUrl, "image");
      obj.cover_image = obj.image_url;
      obj.pdf_url = resolveWhitePaperUrl(obj.pdf_file, baseUrl, "pdf");
      return obj;
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White papers fetched",
      data: finalData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadWhitePaper = async (req, res) => {
  try {
    const { white_paper_id, email, mobile, ip_address } = req.body;

    if (!white_paper_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const whitePaper = await WhitePaper.findOne({
      where: {
        id: white_paper_id,
        is_delete: false,
        is_active: true,
      },
      include: [
        {
          model: WhitePaperCategory,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (!whitePaper) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White paper not found",
      });
    }

    await WhitePaperDownload.create({
      email,
      mobile,
      white_paper_id,
      title: whitePaper.title,
      category_name: whitePaper.category?.name || null,
      ip_address,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = resolveWhitePaperUrl(whitePaper.pdf_file, baseUrl, "pdf");

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicBlogs = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const blog = await Blog.findOne({
        where: { id, is_delete: false, is_active: true },
        include: [
          {
            model: BlogTab,
            as: "tabs",
            include: [{ model: BlogTabBullet, as: "bullets" }],
          },
          { model: BlogReference, as: "references" },
        ],
        order: [
          [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
          [{ model: BlogTab, as: "tabs" }, { model: BlogTabBullet, as: "bullets" }, "bullet_order", "ASC"],
          [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
        ],
      });

      if (!blog) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: "Blog not found",
        });
      }

      const blogData = blog.toJSON();

      blogData.related_blogs = await enrichRelatedBlogs(blogData.related_blogs);

console.log("BLOG DATA BEFORE RETURN:");
console.log(blogData);
console.log("KEY TAKEAWAYS FIELD:", blogData.key_takeaways);

      return res.status(200).json({
        status: true,
        responseCode: 200,
        message: "Blog fetched",
        data: {
          ...blogData,
          key_takeaways: blogData.key_takeaways || [],
        },
      });
    }

    const data = await Blog.findAll({
      where: { is_delete: false, is_active: true },
      include: [
        {
          model: BlogTab,
          as: "tabs",
          include: [{ model: BlogTabBullet, as: "bullets" }],
        },
        { model: BlogReference, as: "references" },
      ],
      order: [
        ["id", "DESC"],
        [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
        [{ model: BlogTab, as: "tabs" }, { model: BlogTabBullet, as: "bullets" }, "bullet_order", "ASC"],
        [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
      ],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blogs fetched",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.downloadBlog = async (req, res) => {
  try {
    const { blog_id, email, mobile, ip_address } = req.body;

    if (!blog_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    const blog = await Blog.findOne({
      where: {
        id: blog_id,
        is_delete: false,
        is_active: true,
      },
    });

    if (!blog) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    await BlogDownload.create({
      email,
      mobile,
      blog_id,
      title: blog.main_title,
      ip_address,
    });

    if (!blog.pdf_file) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "No downloadable PDF for this blog",
      });
    }
console.log("BLOG FROM DB:", blog.toJSON());
    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Download ready",
      url: blog.pdf_file,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
exports.getPublicBlogDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      where: { id, is_delete: false, is_active: true },
      include: [
        {
          model: BlogTab,
          as: "tabs",
          include: [{ model: BlogTabBullet, as: "bullets" }],
        },
        { model: BlogReference, as: "references" },
      ],
      order: [
        [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
        [{ model: BlogTab, as: "tabs" }, { model: BlogTabBullet, as: "bullets" }, "bullet_order", "ASC"],
        [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
      ],
    });

    if (!blog) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    const blogData = blog.toJSON();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blog fetched",
      data: {
        ...blogData,
        key_takeaways: blogData.key_takeaways || [],
        industry_tag: blogData.industry_tag || null,
        published_date: blogData.published_date || null,
        read_time: blogData.read_time || null,
        author_name: blogData.author_name || null,
        summary: blogData.summary || null,
        cover_alt: blogData.cover_alt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};