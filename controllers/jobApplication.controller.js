const { JobApplication, JobOpening } = require('../models');
const { Op } = require('sequelize');

exports.getAllJobApplications = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = '', job_opening_id, status } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (job_opening_id) whereCondition.job_opening_id = job_opening_id;
    if (status) whereCondition.status = status;

    if (search) {
      whereCondition[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await JobApplication.findAndCountAll({
      where: whereCondition,
      include: [{ model: JobOpening, as: 'jobOpening', attributes: ['id', 'title', 'department'] }],
      order: [['id', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Job applications fetched',
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

exports.getJobApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await JobApplication.findOne({
      where: { id },
      include: [{ model: JobOpening, as: 'jobOpening', attributes: ['id', 'title', 'department'] }],
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Application fetched',
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

exports.updateJobApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const application = await JobApplication.findOne({ where: { id } });

    if (!application) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Application not found'
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.deleteJobApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findOne({ where: { id } });

    if (!application) {
      return res.status(404).json({
        status: false,
        responseCode: 404,
        message: 'Application not found'
      });
    }

    await application.destroy();

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Application deleted'
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};
