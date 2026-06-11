const { WhitePaperDownload } = require('../models');
const { Op } = require('sequelize');

exports.getAllDownloadLogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { category_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await WhitePaperDownload.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Download logs fetched',
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
