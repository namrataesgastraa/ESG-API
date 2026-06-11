const { Industry } = require("../models");
const { normalizeName } = require("../utils/string.helper");

exports.createIndustry = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Industry name is required",
      });
    }

    const normalized = normalizeName(name);
    const exists = await Industry.findOne({
      where: {
        normalized_name: normalized,
        is_delete: false,
      },
    });

    if (exists) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: "Industry already exists",
      });
    }

    const industry = await Industry.create({
      name,
      normalized_name: normalized,
      created_by: req.user?.id,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry created successfully",
      data: {
        id: industry.id,
        name: industry.name,
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

exports.updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const industry = await Industry.findOne({
      where: { id, is_delete: false },
    });

    if (!industry) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Industry not found",
      });
    }

    if (name) {
      const normalized = normalizeName(name);

      const exists = await Industry.findOne({
        where: {
          normalized_name: normalized,
          is_delete: false,
        },
      });

      if (exists && exists.id !== industry.id) {
        return res.status(400).json({
          status: false,
          responseCode: 400,
          message: "Industry already exists",
        });
      }

      industry.name = name;
      industry.normalized_name = normalized;
    }

    industry.updated_by = req.user?.id;

    await industry.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry updated successfully",
      data: {
        id: industry.id,
        name: industry.name,
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

exports.getAllIndustries = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const normalizedSearch = normalizeName(search);

    const whereCondition = {
      is_delete: false,
    };

    if (search) {
      whereCondition.normalized_name = {
        [require("sequelize").Op.like]: `%${normalizedSearch}%`,
      };
    }

    const { count, rows } = await Industry.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "normalized_name",
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
      message: "Industry list fetched",
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

exports.getIndustryById = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findOne({
      where: { id, is_delete: false },
      attributes: [
        "id",
        "name",
        "normalized_name",
        "is_active",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!industry) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Industry not found",
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry fetched",
      data: industry,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.toggleIndustryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findOne({
      where: { id, is_delete: false },
    });

    if (!industry) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Industry not found",
      });
    }

    industry.is_active = !industry.is_active;
    industry.updated_by = req.user?.id;

    await industry.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry status updated",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findOne({
      where: { id, is_delete: false },
    });

    if (!industry) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: "Industry not found",
      });
    }

    industry.is_delete = true;
    industry.updated_by = req.user?.id;

    await industry.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.getIndustryDropdown = async (req, res) => {
  try {
    let { search = "", limit = 20 } = req.query;

    limit = parseInt(limit);
    limit = Math.min(limit, 50);

    const { Op } = require("sequelize");

    const whereCondition = {
      is_delete: false,
      is_active: true,
    };

    if (search) {
      const normalizedSearch = normalizeName(search);

      whereCondition.normalized_name = {
        [Op.like]: `%${normalizedSearch}%`,
      };
    }

    const industries = await Industry.findAll({
      where: whereCondition,
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
      limit,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: "Industry dropdown fetched",
      data: industries,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};
