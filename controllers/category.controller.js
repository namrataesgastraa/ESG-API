const { Category } = require('../models');
const { normalizeName } = require('../utils/string.helper');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Category name is required'
      });
    }

    const normalized = normalizeName(name);
    const exists = await Category.findOne({
      where: {
        normalized_name: normalized,
        is_delete: false
      }
    });

    if (exists) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name,
      normalized_name: normalized,
      created_by: req.user?.id
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category created successfully',
      data: {
        "id": category.id,
        "name": category.name
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

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findOne({
      where: { id, is_delete: false }
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Category not found'
      });
    }

    if (name) {
      const normalized = normalizeName(name);

      const exists = await Category.findOne({
        where: {
          normalized_name: normalized,
          is_delete: false
        }
      });

      if (exists && exists.id !== category.id) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: 'Category already exists'
        });
      }

      category.name = name;
      category.normalized_name = normalized;
    }

    category.updated_by = req.user?.id;

    await category.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category updated successfully',
      data: {
        "id": category.id,
        "name": category.name
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

exports.getAllCategories = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const normalizedSearch = normalizeName(search);

    const whereCondition = {
      is_delete: false
    };

    if (search) {
      whereCondition.normalized_name = {
        [require('sequelize').Op.like]: `%${normalizedSearch}%`
      };
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereCondition,
      attributes: [
        'id',
        'name',
        'normalized_name',
        'is_active',
        'createdAt',
        'updatedAt'
      ],
      order: [['id', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category list fetched',
      data: rows,
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

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, is_delete: false },
      attributes: ['id', 'name', 'normalized_name', 'is_active', 'createdAt','updatedAt'],
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category fetched',
      data: category
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, is_delete: false }
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Category not found'
      });
    }

    category.is_active = !category.is_active;
    category.updated_by = req.user?.id;

    await category.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category status updated',
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, is_delete: false }
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Category not found'
      });
    }

    category.is_delete = true;
    category.updated_by = req.user?.id;

    await category.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.getCategoryDropdown = async (req, res) => {
  try {
    let { search = '', limit = 20 } = req.query;

    limit = parseInt(limit);
    limit = Math.min(limit, 50);

    const { Op } = require('sequelize');

    const whereCondition = {
      is_delete: false,
      is_active: true
    };

    if (search) {
      const normalizedSearch = normalizeName(search);

      whereCondition.normalized_name = {
        [Op.like]: `%${normalizedSearch}%`
      };
    }

    const categories = await Category.findAll({
      where: whereCondition,
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
      limit
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Category dropdown fetched',
      data: categories
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};