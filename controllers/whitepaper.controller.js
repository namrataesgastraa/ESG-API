const { WhitePaper, WhitePaperCategory } = require("../models");
const { normalizeName, slugify } = require("../utils/string.helper");
const { Op } = require("sequelize");
const {
  uploadToS3,
  deleteFromS3,
  getKeyFromUrl,
} = require("../utils/s3.helper");
const { parseWhitePaperExcel } = require("../utils/whitePaperExcelParser");

const uploadWhitePaperFile = async (file, folder) => {
  if (!file) return null;
  const safeName = file.originalname
    .replace(/\s+/g, "-")
    .replace(/,/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "");
  const key = `white-paper/${folder}/${Date.now()}-${safeName}`;
  return uploadToS3(file.buffer, key, file.mimetype);
};

const summaryToDescription = (summary) => {
  if (!summary || !Array.isArray(summary.paragraphs)) return "";
  return summary.paragraphs.join(" ").slice(0, 500);
};

const buildWhitePaperExcelFields = (payload, title, normalized) => ({
  title,
  normalized_title: normalized,
  slug: slugify(payload.slug) || slugify(title),
  subtitle: payload.subtitle || null,
  description: summaryToDescription(payload.summary_content),
  eyebrow: payload.eyebrow || null,
  industry_tag: payload.industry_tag || null,
  category_tags: Array.isArray(payload.category_tags) ? payload.category_tags : [],
  published_date: payload.published_date || null,
  read_time: payload.read_time || null,
  author_name: payload.author_name || null,
  report_type: payload.report_type || null,
  pages: payload.pages || null,
  frameworks_covered: Array.isArray(payload.frameworks_covered)
    ? payload.frameworks_covered
    : [],
  cover_alt: payload.cover_alt || null,
  cover_caption: payload.cover_caption || null,
  summary_content: payload.summary_content || null,
  key_insights: Array.isArray(payload.key_insights) ? payload.key_insights : [],
  related_whitepapers: Array.isArray(payload.related_whitepapers)
    ? payload.related_whitepapers
    : [],
  graphical_enabled: Boolean(payload.graphical_enabled),
  graphs: Array.isArray(payload.graphs) ? payload.graphs : [],
  featured: Boolean(payload.featured),
  is_active: Boolean(payload.published),
});

const saveWhitePaperFromExcel = async (req, res, payload) => {
  const title = (payload.title || "").trim();

  if (!title) {
    return res.status(400).json({
      status: false,
      responseCode: 400,
      message: "Title is required in the Basic Info sheet",
    });
  }

  const normalized = normalizeName(title);

  const existing = await WhitePaper.findOne({
    where: { normalized_title: normalized, is_delete: false },
  });

  const coverUrl =
    (await uploadWhitePaperFile(req.files?.cover_image?.[0], "image")) ||
    payload.cover_image_url ||
    null;

  const pdfUrl =
    (await uploadWhitePaperFile(req.files?.pdf_file?.[0], "pdf")) ||
    payload.pdf_url ||
    null;

  const fields = buildWhitePaperExcelFields(payload, title, normalized);

  if (existing) {
    if (coverUrl) {
      fields.cover_image = coverUrl;
      fields.image = coverUrl;
    }
    if (pdfUrl) {
      fields.pdf_file = pdfUrl;
    }
    fields.updated_by = req.user?.id || null;
    await existing.update(fields);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Whitepaper updated",
      data: { id: existing.id, title: existing.title, slug: existing.slug },
    });
  }

  const data = await WhitePaper.create({
    ...fields,
    cover_image: coverUrl,
    image: coverUrl,
    pdf_file: pdfUrl,
    created_by: req.user?.id || null,
  });

  return res.status(200).json({
    status: true,
    responseCode: 200,
    message: "Whitepaper created",
    data: { id: data.id, title: data.title, slug: data.slug },
  });
};

exports.previewWhitePaperExcel = async (req, res) => {
  try {
    const excelFile = req.files?.excel_file?.[0];
    if (!excelFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "excel_file is required",
      });
    }

    const payload = parseWhitePaperExcel(excelFile.buffer);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Whitepaper preview generated",
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

exports.uploadWhitePaperExcel = async (req, res) => {
  try {
    const excelFile = req.files?.excel_file?.[0];
    if (!excelFile) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "excel_file is required",
      });
    }

    const payload = parseWhitePaperExcel(excelFile.buffer);

    return saveWhitePaperFromExcel(req, res, payload);
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.updateWhitePaperExcel = async (req, res) => {
  try {
    const { id } = req.params;

    const whitePaper = await WhitePaper.findOne({
      where: { id, is_delete: false },
    });

    if (!whitePaper) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White Paper not found",
      });
    }

    const excelFile = req.files?.excel_file?.[0];

    if (excelFile) {
      const payload = parseWhitePaperExcel(excelFile.buffer);
      const title = (payload.title || "").trim();

      if (!title) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: "Title is required in the Basic Info sheet",
        });
      }

      const normalized = normalizeName(title);

      const exists = await WhitePaper.findOne({
        where: {
          normalized_title: normalized,
          is_delete: false,
          id: { [Op.ne]: whitePaper.id },
        },
      });

      if (exists) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: "White Paper title already exists",
        });
      }

      const fields = buildWhitePaperExcelFields(payload, title, normalized);
      // Preserve the existing slug on edit unless the Excel explicitly sets a new one —
      // other resources' "Related" cards link by slug, so an incidental slug change breaks them.
      if (!slugify(payload.slug)) {
        fields.slug = whitePaper.slug;
      }
      Object.assign(whitePaper, fields);
    }

    if (req.files?.cover_image?.[0]) {
      if (whitePaper.image) {
        const oldKey = getKeyFromUrl(whitePaper.image);
        if (oldKey) await deleteFromS3(oldKey);
      }
      const coverUrl = await uploadWhitePaperFile(req.files.cover_image[0], "image");
      whitePaper.cover_image = coverUrl;
      whitePaper.image = coverUrl;
    }

    if (req.files?.pdf_file?.[0]) {
      if (whitePaper.pdf_file) {
        const oldKey = getKeyFromUrl(whitePaper.pdf_file);
        if (oldKey) await deleteFromS3(oldKey);
      }
      whitePaper.pdf_file = await uploadWhitePaperFile(req.files.pdf_file[0], "pdf");
    }

    whitePaper.updated_by = req.user?.id || null;
    await whitePaper.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White Paper updated",
      data: { id: whitePaper.id, title: whitePaper.title, slug: whitePaper.slug },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.createWhitePaper = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Title and White Paper Category are required",
      });
    }

    if (!req.files?.pdf_file?.[0]) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "PDF file is required",
      });
    }

    if (!req.files?.image?.[0]) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Image is required",
      });
    }

    const category = await WhitePaperCategory.findOne({
      where: { id: category_id, is_delete: false },
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Invalid White Paper Category",
      });
    }

    const normalized = normalizeName(title);

    const exists = await WhitePaper.findOne({
      where: {
        normalized_title: normalized,
        is_delete: false,
      },
    });

    if (exists) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Case study title already exists",
      });
    }

    const pdfFile = req.files?.pdf_file?.[0];
    const imageFile = req.files?.image?.[0];

    let pdfUrl = null;
    let imageUrl = null;

    if (pdfFile) {
      const key = `case-study/pdf/${Date.now()}-${pdfFile.originalname}`;
      pdfUrl = await uploadToS3(pdfFile.buffer, key, pdfFile.mimetype);
    }

    if (imageFile) {
      const key = `case-study/image/${Date.now()}-${imageFile.originalname}`;
      imageUrl = await uploadToS3(imageFile.buffer, key, imageFile.mimetype);
    }

    const data = await WhitePaper.create({
      title,
      normalized_title: normalized,
      description,
      category_id,
      pdf_file: pdfUrl,
      image: imageUrl,
      created_by: req.user.id,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Case study created",
      data: {
        id: data.id,
        title: data.title,
        WhitePaperCategory: {
          id: category.id,
          name: category.name,
        },
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

exports.updateWhitePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id } = req.body;

    const whitePaper = await WhitePaper.findOne({
      where: { id, is_delete: false },
    });

    if (!whitePaper) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White Paper not found",
      });
    }

    if (category_id) {
      const category = await WhitePaperCategory.findOne({
        where: { id: category_id, is_delete: false },
      });

      if (!category) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: "Invalid White Paper Category",
        });
      }

      whitePaper.category_id = category_id;
    }

    if (title) {
      const normalized = normalizeName(title);

      const exists = await WhitePaper.findOne({
        where: {
          normalized_title: normalized,
          is_delete: false,
        },
      });

      if (exists && exists.id !== whitePaper.id) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: "White Paper title already exists",
        });
      }

      whitePaper.title = title;
      whitePaper.normalized_title = normalized;
    }

    if (description) whitePaper.description = description;

    // PDF update
    if (req.files?.pdf_file) {
      const pdfFile = req.files.pdf_file[0];

      // delete old
      if (whitePaper.pdf_file) {
        const oldKey = getKeyFromUrl(whitePaper.pdf_file);
        if (oldKey) await deleteFromS3(oldKey);
      }

      const key = `case-study/pdf/${Date.now()}-${pdfFile.originalname}`;
      whitePaper.pdf_file = await uploadToS3(
        pdfFile.buffer,
        key,
        pdfFile.mimetype,
      );
    }

    // IMAGE update
    if (req.files?.image) {
      const imageFile = req.files.image[0];

      if (whitePaper.image) {
        const oldKey = getKeyFromUrl(whitePaper.image);
        if (oldKey) await deleteFromS3(oldKey);
      }

      const key = `case-study/image/${Date.now()}-${imageFile.originalname}`;
      whitePaper.image = await uploadToS3(
        imageFile.buffer,
        key,
        imageFile.mimetype,
      );
    }

    whitePaper.updated_by = req.user.id;

    await whitePaper.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White Paper updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getAllWhitePapers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);

    const offset = (page - 1) * limit;

    const whereCondition = {
      is_delete: false,
    };

    if (search) {
      const normalized = normalizeName(search);
      whereCondition.normalized_title = {
        [Op.like]: `%${normalized}%`,
      };
    }

    const { count, rows } = await WhitePaper.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "title",
        "normalized_title",
        "description",
        "category_id",
        "industry_tag",
        "slug",
        "pdf_file",
        "image",
        "is_active",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: WhitePaperCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      status: true,
      data: rows,
      responseCode: 200,
      message: "White Paper fetched",
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

exports.getWhitePaperById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await WhitePaper.findOne({
      where: { id, is_delete: false },
      attributes: [
        "id",
        "title",
        "normalized_title",
        "description",
        "category_id",
        "industry_tag",
        "slug",
        "pdf_file",
        "image",
        "is_active",
        "createdAt",
        "updatedAt",
        "subtitle",
        "eyebrow",
        "category_tags",
        "published_date",
        "read_time",
        "author_name",
        "report_type",
        "pages",
        "frameworks_covered",
        "cover_image",
        "cover_alt",
        "cover_caption",
        "summary_content",
        "key_insights",
        "related_whitepapers",
        "graphical_enabled",
        "graphs",
        "featured",
      ],
      include: [
        {
          model: WhitePaperCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White Paper not found",
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White Paper fetched",
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

exports.toggleWhitePaperStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await WhitePaper.findOne({
      where: { id, is_delete: false },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "White Paper not found",
      });
    }

    data.is_active = !data.is_active;
    data.updated_by = req.user.id;

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

exports.deleteWhitePaper = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await WhitePaper.findOne({
      where: { id, is_delete: false },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Case study not found",
      });
    }

    if (data.pdf_file) {
      const key = getKeyFromUrl(data.pdf_file);
      if (key) await deleteFromS3(key);
    }

    if (data.image) {
      const key = getKeyFromUrl(data.image);
      if (key) await deleteFromS3(key);
    }

    data.is_delete = true;
    data.updated_by = req.user.id;

    await data.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "White Paper deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
