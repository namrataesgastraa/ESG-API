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
  Announcement,
  HomeFaq,
  FeaturedInsight,
  Podcast,
  JobOpening,
  JobApplication,
} = require("../models");
const { generatePublicToken } = require("../utils/publicToken");
const Validator = require("../utils/validator");
const { uploadToS3 } = require("../utils/s3.helper");
const { sendEmail } = require("../utils/email.helper");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || null;
};

const slugifyForUrl = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Resolves each featured slot into a uniform card, whatever its source type.
exports.getPublicFeaturedInsights = async (req, res) => {
  try {
    const slots = await FeaturedInsight.findAll({
      where: { is_active: true },
      order: [["sort_order", "ASC"], ["id", "ASC"]],
      attributes: ["id", "insight_type", "insight_id", "sort_order"],
    });

    if (!slots.length) {
      return res.status(200).json({
        status: true,
        responseCode: 200,
        message: "Featured insights fetched",
        data: [],
      });
    }

    const idsByType = { blog: [], "case-study": [], whitepaper: [] };
    slots.forEach((slot) => {
      if (idsByType[slot.insight_type]) idsByType[slot.insight_type].push(slot.insight_id);
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const [blogs, caseStudies, whitePapers] = await Promise.all([
      idsByType.blog.length
        ? Blog.findAll({
            where: { id: idsByType.blog, is_delete: false, is_active: true },
            attributes: ["id", "main_title", "sub_title", "slug", "cover_image", "eyebrow", "industry_tag", "read_time"],
          })
        : [],
      idsByType["case-study"].length
        ? CaseStudy.findAll({
            where: { id: idsByType["case-study"], is_delete: false, is_active: true },
            attributes: ["id", "title", "subtitle", "description", "slug", "cover_image", "image", "eyebrow", "industry_tag", "read_time"],
          })
        : [],
      idsByType.whitepaper.length
        ? WhitePaper.findAll({
            where: { id: idsByType.whitepaper, is_delete: false, is_active: true },
            attributes: ["id", "title", "subtitle", "description", "slug", "cover_image", "image", "eyebrow", "industry_tag", "read_time"],
          })
        : [],
    ]);

    const blogById = new Map(blogs.map((b) => [b.id, b.toJSON()]));
    const caseById = new Map(caseStudies.map((c) => [c.id, c.toJSON()]));
    const paperById = new Map(whitePapers.map((w) => [w.id, w.toJSON()]));

    const resolveImage = (value, folder) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return `${baseUrl}/uploads/${folder}/image/${value}`;
    };

    const cards = slots
      .map((slot) => {
        const type = slot.insight_type;

        if (type === "blog") {
          const item = blogById.get(slot.insight_id);
          if (!item) return null;
          const slugPart = slugifyForUrl(item.slug || item.main_title);
          return {
            type: "blog",
            type_label: "Blog",
            id: item.id,
            title: item.main_title || "",
            subtitle: item.sub_title || "",
            tag: item.industry_tag || item.eyebrow || "",
            read_time: item.read_time || "",
            image: item.cover_image || null,
            href: `/insights/blogs/${slugPart ? `${slugPart}-${item.id}` : item.id}`,
          };
        }

        if (type === "case-study") {
          const item = caseById.get(slot.insight_id);
          if (!item) return null;
          const slugPart = slugifyForUrl(item.slug || item.title);
          return {
            type: "case-study",
            type_label: "Case Study",
            id: item.id,
            title: item.title || "",
            subtitle: item.subtitle || item.description || "",
            tag: item.industry_tag || item.eyebrow || "",
            read_time: item.read_time || "",
            image: resolveImage(item.cover_image || item.image, "case-study"),
            href: `/insights/case-studies/${slugPart ? `${slugPart}-${item.id}` : item.id}`,
          };
        }

        const item = paperById.get(slot.insight_id);
        if (!item) return null;
        const slugPart = slugifyForUrl(item.slug || item.title);
        return {
          type: "whitepaper",
          type_label: "Whitepaper",
          id: item.id,
          title: item.title || "",
          subtitle: item.subtitle || item.description || "",
          tag: item.industry_tag || item.eyebrow || "",
          read_time: item.read_time || "",
          image: resolveImage(item.cover_image || item.image, "white-paper"),
          href: `/insights/whitepapers/${slugPart ? `${slugPart}-${item.id}` : item.id}`,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Featured insights fetched",
      data: cards,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicAnnouncement = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { is_active: true },
      order: [["sort_order", "ASC"], ["id", "ASC"]],
      attributes: ["id", "message", "link_label", "link_url"],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Announcement fetched",
      data: announcements,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getPublicFaqs = async (req, res) => {
  try {
    const faqs = await HomeFaq.findAll({
      where: { is_active: true },
      order: [["sort_order", "ASC"], ["id", "ASC"]],
      attributes: ["id", "question", "answer"],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "FAQs fetched",
      data: faqs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

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

exports.getPublicPodcasts = async (req, res) => {
  try {
    const data = await Podcast.findAll({
      where: { is_delete: false, is_active: true },
      attributes: ["id", "title", "description", "podcast_link", "thumbnail", "createdAt"],
      order: [
        ["sort_order", "ASC"],
        ["id", "DESC"],
      ],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Podcasts fetched",
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

exports.downloadCaseStudy = async (req, res) => {
  try {
    const { case_study_id, name, email, mobile } = req.body;

    if (!case_study_id || !name || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    if (!Validator.isEmail(email) || !Validator.isIndianMobile(mobile)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid email or mobile number",
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

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = resolveUploadUrl(caseStudy.pdf_file, baseUrl, "pdf");

    if (!fileUrl) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "No downloadable PDF for this case study",
      });
    }

    await CaseStudyDownload.create({
      name,
      email,
      mobile,
      case_study_id,
      title: caseStudy.title,
      category_name: caseStudy.category?.name || null,
      ip_address: getClientIp(req),
    });

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
    const { white_paper_id, name, email, mobile } = req.body;

    if (!white_paper_id || !name || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    if (!Validator.isEmail(email) || !Validator.isIndianMobile(mobile)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid email or mobile number",
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

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = resolveWhitePaperUrl(whitePaper.pdf_file, baseUrl, "pdf");

    if (!fileUrl) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "No downloadable PDF for this white paper",
      });
    }

    await WhitePaperDownload.create({
      name,
      email,
      mobile,
      white_paper_id,
      title: whitePaper.title,
      category_name: whitePaper.category?.name || null,
      ip_address: getClientIp(req),
    });

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
    const { blog_id, email, mobile } = req.body;

    if (!blog_id || !email || !mobile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    if (!Validator.isEmail(email) || !Validator.isIndianMobile(mobile)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid email or mobile number",
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

    if (!blog.pdf_file) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "No downloadable PDF for this blog",
      });
    }

    await BlogDownload.create({
      email,
      mobile,
      blog_id,
      title: blog.main_title,
      ip_address: getClientIp(req),
    });

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

const experienceLabel = (min, max) => {
  if (max >= 15) return `${min}+ years`;
  return `${min} to ${max} years`;
};

const buildApplicantConfirmationHtml = (fullName, jobTitle) => `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
    <div style="background:#1a1a2e;padding:20px 24px">
      <h2 style="color:#ffffff;margin:0;font-size:18px">ESG Astraa</h2>
    </div>
    <div style="padding:32px 24px">
      <h3 style="margin:0 0 12px;font-size:20px;color:#1a1a2e">Thank you for applying, ${fullName}!</h3>
      <p style="color:#444;line-height:1.6;font-size:15px">
        We have received your application for <strong>${jobTitle}</strong>. Our team will review your details
        and reach out if there is a fit.
      </p>
      <p style="color:#444;line-height:1.6;font-size:15px;margin-top:24px">Best regards,<br><strong>ESG Astraa Team</strong></p>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;border-top:1px solid #e0e0e0;font-size:12px;color:#888">
      support@esgastraa.com
    </div>
  </div>`;

const buildApplicationAdminHtml = (application) => {
  const rows = [
    ["Job Title", application.job_title],
    ["Department", application.department],
    ["Full Name", application.full_name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Current Location", application.current_location],
    ["Total Experience", `${application.total_experience} years`],
    ["Current Organisation", application.current_organisation],
    ["Current Designation", application.current_designation],
    ["Notice Period", application.notice_period],
    ["Qualification", application.qualification],
    ["Institution", application.institution],
    ["Graduation Year", application.graduation_year],
    ["PAN Number", application.pan_number],
    ["Certifications", application.certifications],
    ["LinkedIn", application.linkedin_url],
    ["Resume", application.resume_url],
    ["Cover Note", application.cover_note],
  ]
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600;background:#f9f9f9;white-space:nowrap">${label}</td>
          <td style="padding:10px 14px;border:1px solid #e0e0e0">${value || "-"}</td>
        </tr>`,
    )
    .join("");

  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
    <div style="background:#1a1a2e;padding:20px 24px">
      <h2 style="color:#ffffff;margin:0;font-size:18px">New Job Application</h2>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;border-top:1px solid #e0e0e0;font-size:12px;color:#888">
      ESG Astraa — Submitted on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
    </div>
  </div>`;
};

exports.getPublicCareers = async (req, res) => {
  try {
    const openings = await JobOpening.findAll({
      where: { is_delete: false, is_active: true },
      attributes: [
        "id", "title", "department", "location", "employment_type",
        "experience_min", "experience_max", "summary", "responsibilities",
        "requirements", "createdAt",
      ],
      order: [["sort_order", "ASC"], ["id", "DESC"]],
    });

    const data = openings.map((item) => {
      const obj = item.toJSON();
      obj.experience = experienceLabel(obj.experience_min || 0, obj.experience_max || 0);
      obj.responsibilities = Array.isArray(obj.responsibilities) ? obj.responsibilities : [];
      obj.requirements = Array.isArray(obj.requirements) ? obj.requirements : [];
      return obj;
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Job openings fetched",
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

exports.applyToCareer = async (req, res) => {
  try {
    const {
      job_opening_id,
      job_title,
      department,
      full_name,
      email,
      phone,
      current_location,
      total_experience,
      current_organisation,
      current_designation,
      notice_period,
      qualification,
      institution,
      graduation_year,
      pan_number,
      certifications,
      linkedin_url,
      cover_note,
    } = req.body;

    if (!full_name || !email || !phone || !qualification || !institution || total_experience === undefined) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Required fields missing",
      });
    }

    if (!Validator.isEmail(email)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid email address",
      });
    }

    if (!Validator.isIndianMobile(phone)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid phone number. Expected a 10-digit mobile number",
      });
    }

    if (pan_number && !Validator.isPan(pan_number)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Invalid PAN number. Expected format: ABCDE1234F",
      });
    }

    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Resume file is required",
      });
    }

    const safeName = resumeFile.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    const key = `careers/resumes/${Date.now()}-${safeName}`;
    const resumeUrl = await uploadToS3(resumeFile.buffer, key, resumeFile.mimetype);

    const application = await JobApplication.create({
      job_opening_id: job_opening_id || null,
      job_title: job_title || null,
      department: department || null,
      full_name,
      email,
      phone,
      current_location: current_location || null,
      total_experience,
      current_organisation: current_organisation || null,
      current_designation: current_designation || null,
      notice_period: notice_period || null,
      qualification,
      institution,
      graduation_year: graduation_year || null,
      pan_number: pan_number ? String(pan_number).trim().toUpperCase() : null,
      certifications: certifications || null,
      linkedin_url: linkedin_url || null,
      resume_url: resumeUrl,
      cover_note: cover_note || null,
      ip_address: getClientIp(req),
    });

    try {
      await sendEmail({
        to: email,
        subject: `Thank you for applying — ${application.job_title || "ESG Astraa"}`,
        html: buildApplicantConfirmationHtml(full_name, application.job_title || "this role"),
      });

      if (process.env.EMAIL_ADMIN) {
        await sendEmail({
          to: process.env.EMAIL_ADMIN,
          subject: `New Job Application — ${application.job_title || "ESG Astraa"}`,
          html: buildApplicationAdminHtml(application),
        });
      }
    } catch (emailError) {
      console.error("[CAREERS APPLICATION EMAIL ERROR]", emailError.message);
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Application submitted",
      data: { id: application.id },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};