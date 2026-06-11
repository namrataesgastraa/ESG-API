const { CaseStudy, Category } = require('../models');
const { normalizeName } = require('../utils/string.helper');
const { Op } = require('sequelize');
const { uploadToS3, deleteFromS3, getKeyFromUrl } = require('../utils/s3.helper');

exports.createCaseStudy = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Title and category are required'
      });
    }

    if (!req.files?.pdf_file?.[0]) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'PDF file is required'
      });
    }

    if (!req.files?.image?.[0]) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Image is required'
      });
    }

    const category = await Category.findOne({
      where: { id: category_id, is_delete: false }
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Invalid category'
      });
    }

    const normalized = normalizeName(title);

    const exists = await CaseStudy.findOne({
      where: {
        normalized_title: normalized,
        is_delete: false
      }
    });

    if (exists) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Case study title already exists'
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

    const data = await CaseStudy.create({
      title,
      normalized_title: normalized,
      description,
      category_id,
      pdf_file: pdfUrl,
      image: imageUrl,
      created_by: req.user.id
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Case study created',
      data: {
        "id": data.id,
        "title": data.title,
        "category": {
            "id": category.id,
            "name": category.name
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id } = req.body;

    const caseStudy = await CaseStudy.findOne({
      where: { id, is_delete: false }
    });

    if (!caseStudy) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Case study not found'
      });
    }

    if (category_id) {
      const category = await Category.findOne({
        where: { id: category_id, is_delete: false }
      });

      if (!category) {
        return res.status(404).json({
          status: false,
          responseCode: 404,
          message: 'Invalid category'
        });
      }

      caseStudy.category_id = category_id;
    }

    if (title) {
      const normalized = normalizeName(title);

      const exists = await CaseStudy.findOne({
        where: {
          normalized_title: normalized,
          is_delete: false
        }
      });

      if (exists && exists.id !== caseStudy.id) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: 'Case study title already exists'
        });
      }

      caseStudy.title = title;
      caseStudy.normalized_title = normalized;
    }

    if (description) caseStudy.description = description;

    // PDF update
    if (req.files?.pdf_file) {
      const pdfFile = req.files.pdf_file[0];

      // delete old
      if (caseStudy.pdf_file) {
        const oldKey = getKeyFromUrl(caseStudy.pdf_file);
        if (oldKey) await deleteFromS3(oldKey);
      }

      const key = `case-study/pdf/${Date.now()}-${pdfFile.originalname}`;
      caseStudy.pdf_file = await uploadToS3(pdfFile.buffer, key, pdfFile.mimetype);
    }

    // IMAGE update
    if (req.files?.image) {
      const imageFile = req.files.image[0];

      if (caseStudy.image) {
        const oldKey = getKeyFromUrl(caseStudy.image);
        if (oldKey) await deleteFromS3(oldKey);
      }

      const key = `case-study/image/${Date.now()}-${imageFile.originalname}`;
      caseStudy.image = await uploadToS3(imageFile.buffer, key, imageFile.mimetype);
    }

    caseStudy.updated_by = req.user.id;

    await caseStudy.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Case study updated',
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.getAllCaseStudies = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);

    const offset = (page - 1) * limit;

    const whereCondition = {
      is_delete: false
    };

    if (search) {
      const normalized = normalizeName(search);
      whereCondition.normalized_title = {
        [Op.like]: `%${normalized}%`
      };
    }

    const { count, rows } = await CaseStudy.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'title', 'normalized_title', 'description', 'category_id', 'pdf_file', 'image','is_active', 'createdAt','updatedAt'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['id', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      data: rows,
      responseCode: 200,
      message: 'Case study fetched',
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CaseStudy.findOne({
      where: { id, is_delete: false },
      attributes: ['id', 'title', 'normalized_title', 'description', 'category_id', 'pdf_file', 'image','is_active', 'createdAt','updatedAt'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Case study not found'
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Case study fetched',
      data
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.toggleCaseStudyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CaseStudy.findOne({
      where: { id, is_delete: false }
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Case study not found'
      });
    }

    data.is_active = !data.is_active;
    data.updated_by = req.user.id;

    await data.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Status updated'
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CaseStudy.findOne({
      where: { id, is_delete: false }
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Case study not found'
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
      message: 'Case study deleted'
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};