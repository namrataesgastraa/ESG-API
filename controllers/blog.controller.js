const { Blog, BlogTab, BlogReference, BlogTabBullet, sequelize } = require("../models");
const { normalizeName, slugify } = require("../utils/string.helper");
const { Op } = require("sequelize");
const { parseBlogExcel } = require("../utils/blogExcelParser");
const {
  uploadToS3,
  deleteFromS3,
  getKeyFromUrl,
} = require("../utils/s3.helper");

const TAB_IMAGE_FIELDS = {
  1: "tab1_image",
  3: "tab3_image",
  5: "tab5_image",
};

const parseJsonField = (raw, fallback) => {
  if (raw === undefined || raw === null || raw === "") return fallback;
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const parsePayload = (body) => {
  if (body && body.data) {
    return parseJsonField(body.data, {});
  }
  if (!body) return {};

  const result = { ...body };
  if (typeof result.tabs === "string") {
    result.tabs = parseJsonField(result.tabs, []);
  }
  if (typeof result.references === "string") {
    result.references = parseJsonField(result.references, []);
  }
  return result;
};

const uploadBlogImage = async (file, folder) => {
  if (!file) return null;
  const safeName = file.originalname
  .replace(/\s+/g, "-")
  .replace(/,/g, "")
  .replace(/[^a-zA-Z0-9.-]/g, "");

const key = `blog/${folder}/${Date.now()}-${safeName}`;
  return await uploadToS3(file.buffer, key, file.mimetype);
};

const removeImage = async (url) => {
  if (!url) return;
  const key = getKeyFromUrl(url);
  if (key) {
    try {
      await deleteFromS3(key);
    } catch (err) {
      console.error("S3 delete failed:", err.message);
    }
  }
};

const saveBlogFromPayload = async (req, res, payload) => {
  const t = await sequelize.transaction();
  const uploadedUrls = [];

  try {
    const {
  blog_name,
  website_url,
  linkedin_url,
  instagram_url,
  medium_url,

  main_title,
  sub_title,
  slug,
  eyebrow,

  industry_tag,
  published_date,
  read_time,
  author_name,
  summary,
  cover_alt,
  key_takeaways,
  related_blogs,

  intro_paragraph_1,
  intro_paragraph_2,

  cta_text,
  cover_caption,

  tabs = [],
  references = [],
} = payload;

    if (!blog_name || !main_title) {
      await t.rollback();
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "blog_name and main_title are required",
      });
    }

    if (!Array.isArray(tabs) || tabs.length === 0) {
      await t.rollback();
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "tabs array is required",
      });
    }

    const normalized = normalizeName(main_title);

    const exists = await Blog.findOne({
      where: { normalized_title: normalized, is_delete: false },
      transaction: t,
    });

    if (exists) {
      await t.rollback();
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Blog with this main title already exists",
      });
    }

    const coverFile = req.files?.cover_image?.[0];
    const coverUrl = await uploadBlogImage(coverFile, "cover");
    if (coverUrl) uploadedUrls.push(coverUrl);

    const blog = await Blog.create(
  {
    blog_name,
    website_url,
    linkedin_url,
    instagram_url,
    medium_url,

    main_title,
    sub_title,
    normalized_title: normalized,
    slug: slugify(slug) || slugify(main_title),

    eyebrow,
    industry_tag,
    published_date,
    read_time,
    author_name,
    summary,
    cover_alt,
    key_takeaways,
    related_blogs: Array.isArray(related_blogs) ? related_blogs : [],

    intro_paragraph_1,
    intro_paragraph_2,

    cta_text,
    cover_image: coverUrl,
    cover_caption,

    created_by: req.user?.id || null,
  },
  { transaction: t }
);
    const tabRows = [];
    const bulletRows = [];

    for (const tab of tabs) {
      const order = parseInt(tab.tab_order);
      let sectionImageUrl = null;

      const fieldName = TAB_IMAGE_FIELDS[order];
      if (fieldName) {
        const file = req.files?.[fieldName]?.[0];
        sectionImageUrl = await uploadBlogImage(file, `tab${order}`);
        if (sectionImageUrl) uploadedUrls.push(sectionImageUrl);
      }

      const content = tab.content ? { ...tab.content } : null;
      const bullets = content?.bullets;

      if (content && content.bullets) {
        delete content.bullets;
      }

      tabRows.push({
        blog_id: blog.id,
        tab_order: order,
        heading: tab.heading,
        content: Object.keys(content || {}).length > 0 ? content : null,
        section_image: sectionImageUrl,
        section_image_caption: tab.section_image_caption || null,
      });

      if (Array.isArray(bullets) && bullets.length > 0) {
        bullets.forEach((bullet, idx) => {
          bulletRows.push({
            tab_order: order,
            bullet_order: idx + 1,
            lead: bullet.lead || "Point",
            body: bullet.body || null,
          });
        });
      }
    }

    if (tabRows.length) {
      const createdTabs = await BlogTab.bulkCreate(tabRows, { transaction: t });

      if (bulletRows.length > 0) {
        const bulletRowsWithTabId = bulletRows.map((bullet) => {
          const tab = createdTabs.find((t) => t.tab_order === bullet.tab_order);
          if (!tab) {
            throw new Error(
              `No tab found with tab_order ${bullet.tab_order} for bullet "${bullet.lead}"`
            );
          }
          return {
            blog_tab_id: tab.id,
            bullet_order: bullet.bullet_order,
            lead: bullet.lead,
            body: bullet.body,
          };
        });

        await BlogTabBullet.bulkCreate(bulletRowsWithTabId, {
          transaction: t,
        });
      }
    }

    if (Array.isArray(references) && references.length) {
      const refRows = references
        .map((ref, idx) => {
          const content = typeof ref === "string" ? ref : ref?.content;
          if (!content) return null;

          return {
            blog_id: blog.id,
            reference_order:
              typeof ref === "object" && ref?.reference_order
                ? parseInt(ref.reference_order)
                : idx + 1,
            content,
          };
        })
        .filter(Boolean);

      if (refRows.length) {
        await BlogReference.bulkCreate(refRows, { transaction: t });
      }
    }

    await t.commit();

    const fullBlog = await Blog.findOne({
      where: { id: blog.id },
      include: [
        {
          model: BlogTab,
          as: "tabs",
          include: [{ model: BlogTabBullet, as: "bullets" }],
        },
        {
          model: BlogReference,
          as: "references",
        },
      ],
      order: [
        [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
        [{ model: BlogTab, as: "tabs" }, { model: BlogTabBullet, as: "bullets" }, "bullet_order", "ASC"],
        [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
      ],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blog created",
      data: fullBlog,
    });
  } catch (error) {
    await t.rollback();

    for (const url of uploadedUrls) {
      await removeImage(url);
    }

    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.createBlog = async (req, res) => {
  const payload = parsePayload(req.body);
  return saveBlogFromPayload(req, res, payload);
};
exports.previewBlogExcel = async (req, res) => {
  try {
    const excelFile = req.files?.excel_file?.[0];

    if (!excelFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "excel_file is required",
      });
    }

    const payload = parseBlogExcel(excelFile.buffer);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Excel preview generated",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
exports.uploadBlogExcel = async (req, res) => {
  try {
    const excelFile = req.files?.excel_file?.[0];

    if (!excelFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "excel_file is required",
      });
    }

    const payload = parseBlogExcel(excelFile.buffer);

    return saveBlogFromPayload(req, res, payload);
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

const updateBlogFromPayload = async (req, res, payload) => {
  const t = await sequelize.transaction();
  const uploadedUrls = [];

  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      where: { id, is_delete: false },
      transaction: t,
    });

    if (!blog) {
      await t.rollback();
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    if (payload.main_title) {
      const normalized = normalizeName(payload.main_title);
      const exists = await Blog.findOne({
        where: {
          normalized_title: normalized,
          is_delete: false,
          id: { [Op.ne]: blog.id },
        },
        transaction: t,
      });

      if (exists) {
        await t.rollback();
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: "Blog with this main title already exists",
        });
      }

      blog.main_title = payload.main_title;
      blog.normalized_title = normalized;
    }

    if (payload.slug !== undefined && payload.slug !== "") {
      blog.slug = slugify(payload.slug);
    } else if (payload.main_title && !blog.slug) {
      blog.slug = slugify(payload.main_title);
    }

    if (payload.related_blogs !== undefined) {
      blog.related_blogs = Array.isArray(payload.related_blogs)
        ? payload.related_blogs
        : [];
    }

    const scalarFields = [
      "blog_name",
      "website_url",
      "linkedin_url",
      "instagram_url",
      "medium_url",
      "sub_title",
      "eyebrow",
      "intro_paragraph_1",
      "intro_paragraph_2",
      "cta_text",
      "cover_caption",
    ];

    for (const field of scalarFields) {
      if (payload[field] !== undefined) blog[field] = payload[field];
    }

    const coverFile = req.files?.cover_image?.[0];

    if (coverFile) {
      const newUrl = await uploadBlogImage(coverFile, "cover");
      uploadedUrls.push(newUrl);
      await removeImage(blog.cover_image);
      blog.cover_image = newUrl;
    }

    blog.updated_by = req.user?.id || null;
    await blog.save({ transaction: t });

    if (Array.isArray(payload.tabs)) {
      const existingTabs = await BlogTab.findAll({
        where: { blog_id: blog.id },
        include: [{ model: BlogTabBullet, as: "bullets" }],
        transaction: t,
      });

      const existingByOrder = new Map(existingTabs.map((tb) => [tb.tab_order, tb]));

      const incomingOrders = new Set();

      for (const tab of payload.tabs) {
        const order = parseInt(tab.tab_order);
        incomingOrders.add(order);

        const fieldName = TAB_IMAGE_FIELDS[order];
        const existing = existingByOrder.get(order);
        let sectionImageUrl = existing?.section_image || null;

        if (fieldName && req.files?.[fieldName]?.[0]) {
          const file = req.files[fieldName][0];
          const newUrl = await uploadBlogImage(file, `tab${order}`);
          uploadedUrls.push(newUrl);
          await removeImage(existing?.section_image);
          sectionImageUrl = newUrl;
        }

        let content = tab.content !== undefined ? tab.content : existing?.content;
        if (content) content = { ...content };

        const incomingBullets = content?.bullets;

        if (content && content.bullets) {
          delete content.bullets;
        }

        const values = {
          blog_id: blog.id,
          tab_order: order,
          heading: tab.heading ?? existing?.heading,
          content,
          section_image: sectionImageUrl,
          section_image_caption:
            tab.section_image_caption !== undefined
              ? tab.section_image_caption
              : existing?.section_image_caption,
        };

        let tabRecord;

        if (existing) {
          await existing.update(values, { transaction: t });
          tabRecord = existing;
        } else {
          tabRecord = await BlogTab.create(values, { transaction: t });
        }

        if (incomingBullets !== undefined) {
          await BlogTabBullet.destroy({
            where: { blog_tab_id: tabRecord.id },
            transaction: t,
          });

          if (Array.isArray(incomingBullets) && incomingBullets.length > 0) {
            const bulletRowsToCreate = incomingBullets.map((bullet, idx) => ({
              blog_tab_id: tabRecord.id,
              bullet_order: idx + 1,
              lead: bullet.lead || "Point",
              body: bullet.body || null,
            }));

            await BlogTabBullet.bulkCreate(bulletRowsToCreate, {
              transaction: t,
            });
          }
        }
      }

      for (const existing of existingTabs) {
        if (!incomingOrders.has(existing.tab_order)) {
          await removeImage(existing.section_image);
          await existing.destroy({ transaction: t });
        }
      }
    }

    if (Array.isArray(payload.references)) {
      await BlogReference.destroy({
        where: { blog_id: blog.id },
        transaction: t,
      });

      const refRows = payload.references
        .map((ref, idx) => {
          const content = typeof ref === "string" ? ref : ref?.content;
          if (!content) return null;

          return {
            blog_id: blog.id,
            reference_order:
              typeof ref === "object" && ref?.reference_order
                ? parseInt(ref.reference_order)
                : idx + 1,
            content,
          };
        })
        .filter(Boolean);

      if (refRows.length) {
        await BlogReference.bulkCreate(refRows, { transaction: t });
      }
    }

    await t.commit();

    const fullBlog = await Blog.findOne({
      where: { id: blog.id },
      include: [
        { model: BlogTab, as: "tabs" },
        { model: BlogReference, as: "references" },
      ],
      order: [
        [{ model: BlogTab, as: "tabs" }, "tab_order", "ASC"],
        [{ model: BlogReference, as: "references" }, "reference_order", "ASC"],
      ],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blog updated",
      data: fullBlog,
    });
  } catch (error) {
    await t.rollback();

    for (const url of uploadedUrls) {
      await removeImage(url);
    }

    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  return updateBlogFromPayload(req, res, parsePayload(req.body));
};

exports.updateBlogExcel = async (req, res) => {
  try {
    const excelFile = req.files?.excel_file?.[0];

    if (!excelFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "excel_file is required",
      });
    }

    const payload = parseBlogExcel(excelFile.buffer);
    return updateBlogFromPayload(req, res, payload);
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const whereCondition = { is_delete: false };

    if (search) {
      const normalized = normalizeName(search);
      whereCondition.normalized_title = { [Op.like]: `%${normalized}%` };
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "blog_name",
        "main_title",
        "sub_title",
        "normalized_title",
        "eyebrow",
        "cover_image",
        "cover_caption",
        "is_active",
        "createdAt",
        "updatedAt",
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blogs fetched",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
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

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Blog.findOne({
      where: { id, is_delete: false },
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

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blog fetched",
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

exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Blog.findOne({
      where: { id, is_delete: false },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    data.is_active = !data.is_active;
    data.updated_by = req.user?.id || null;
    await data.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Status updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      where: { id, is_delete: false },
      include: [{ model: BlogTab, as: "tabs" }],
      transaction: t,
    });

    if (!blog) {
      await t.rollback();
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Blog not found",
      });
    }

    await removeImage(blog.cover_image);

    if (Array.isArray(blog.tabs)) {
      for (const tab of blog.tabs) {
        await removeImage(tab.section_image);
      }
    }

    blog.is_delete = true;
    blog.updated_by = req.user?.id || null;
    await blog.save({ transaction: t });

    await t.commit();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Blog deleted",
    });
  } catch (error) {
    await t.rollback();

    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};