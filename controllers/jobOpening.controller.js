const { JobOpening } = require('../models');
const { Op } = require('sequelize');

exports.createJobOpening = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      employment_type,
      experience_min,
      experience_max,
      summary,
      responsibilities,
      requirements,
      sort_order,
      is_active,
    } = req.body;

    if (!title || !department || !location) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Title, department and location are required'
      });
    }

    const data = await JobOpening.create({
      title,
      department,
      location,
      employment_type: employment_type || 'Full-time',
      experience_min: experience_min ?? 0,
      experience_max: experience_max ?? 0,
      summary: summary || '',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      sort_order: sort_order ?? 0,
      is_active: is_active === undefined ? true : Boolean(is_active),
      created_by: req.user?.id || null,
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job opening created',
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

exports.updateJobOpening = async (req, res) => {
  try {
    const { id } = req.params;

    const jobOpening = await JobOpening.findOne({
      where: { id, is_delete: false }
    });

    if (!jobOpening) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Job opening not found'
      });
    }

    const {
      title,
      department,
      location,
      employment_type,
      experience_min,
      experience_max,
      summary,
      responsibilities,
      requirements,
      sort_order,
      is_active,
    } = req.body;

    if (title !== undefined) jobOpening.title = title;
    if (department !== undefined) jobOpening.department = department;
    if (location !== undefined) jobOpening.location = location;
    if (employment_type !== undefined) jobOpening.employment_type = employment_type;
    if (experience_min !== undefined) jobOpening.experience_min = experience_min;
    if (experience_max !== undefined) jobOpening.experience_max = experience_max;
    if (summary !== undefined) jobOpening.summary = summary;
    if (Array.isArray(responsibilities)) jobOpening.responsibilities = responsibilities;
    if (Array.isArray(requirements)) jobOpening.requirements = requirements;
    if (sort_order !== undefined) jobOpening.sort_order = sort_order;
    if (is_active !== undefined) jobOpening.is_active = Boolean(is_active);

    jobOpening.updated_by = req.user?.id || null;
    await jobOpening.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job opening updated',
      data: jobOpening
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.getAllJobOpenings = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = '' } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const whereCondition = { is_delete: false };

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await JobOpening.findAndCountAll({
      where: whereCondition,
      order: [['sort_order', 'ASC'], ['id', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job openings fetched',
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

exports.getJobOpeningById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await JobOpening.findOne({
      where: { id, is_delete: false }
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Job opening not found'
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job opening fetched',
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

exports.toggleJobOpeningStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await JobOpening.findOne({
      where: { id, is_delete: false }
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Job opening not found'
      });
    }

    data.is_active = !data.is_active;
    data.updated_by = req.user?.id || null;
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

exports.deleteJobOpening = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await JobOpening.findOne({
      where: { id, is_delete: false }
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Job opening not found'
      });
    }

    data.is_delete = true;
    data.updated_by = req.user?.id || null;
    await data.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job opening deleted'
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};
