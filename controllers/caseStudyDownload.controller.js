const { CaseStudyDownload, BlogDownload, WhitePaperDownload } = require('../models');
const { Op } = require('sequelize');

exports.getAllDownloadLogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', type = '' } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const buildWhere = (includeCategory) => {
      const where = {};
      if (search) {
        const conditions = [
          { email: { [Op.iLike]: `%${search}%` } },
          { mobile: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.iLike]: `%${search}%` } }
        ];
        if (includeCategory) {
          conditions.push({ category_name: { [Op.iLike]: `%${search}%` } });
        }
        where[Op.or] = conditions;
      }
      return where;
    };

    const fetchCaseStudy = !type || type === 'case_study';
    const fetchBlog = !type || type === 'blog';
    const fetchWhitePaper = !type || type === 'white_paper';

    const [caseStudyLogs, blogLogs, whitePaperLogs] = await Promise.all([
      fetchCaseStudy
        ? CaseStudyDownload.findAll({ where: buildWhere(true), order: [['createdAt', 'DESC']] })
        : [],
      fetchBlog
        ? BlogDownload.findAll({ where: buildWhere(false), order: [['createdAt', 'DESC']] })
        : [],
      fetchWhitePaper
        ? WhitePaperDownload.findAll({ where: buildWhere(true), order: [['createdAt', 'DESC']] })
        : []
    ]);

    const merged = [
      ...caseStudyLogs.map((r) => {
        const obj = r.toJSON();
        return {
          id: obj.id,
          type: 'case_study',
          resource_id: obj.case_study_id,
          email: obj.email,
          mobile: obj.mobile,
          title: obj.title,
          category_name: obj.category_name,
          context: obj.context,
          ip_address: obj.ip_address,
          createdAt: obj.createdAt
        };
      }),
      ...blogLogs.map((r) => {
        const obj = r.toJSON();
        return {
          id: obj.id,
          type: 'blog',
          resource_id: obj.blog_id,
          email: obj.email,
          mobile: obj.mobile,
          title: obj.title,
          category_name: null,
          context: obj.context,
          ip_address: obj.ip_address,
          createdAt: obj.createdAt
        };
      }),
      ...whitePaperLogs.map((r) => {
        const obj = r.toJSON();
        return {
          id: obj.id,
          type: 'white_paper',
          resource_id: obj.white_paper_id,
          email: obj.email,
          mobile: obj.mobile,
          title: obj.title,
          category_name: obj.category_name,
          context: obj.context,
          ip_address: obj.ip_address,
          createdAt: obj.createdAt
        };
      })
    ];

    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const count = merged.length;
    const rows = merged.slice(offset, offset + limit);

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
