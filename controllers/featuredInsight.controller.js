const { FeaturedInsight, Blog, CaseStudy, WhitePaper, sequelize } = require('../models');

const INSIGHT_TYPES = ['blog', 'case-study', 'whitepaper'];
const MAX_SLOTS = 4;

const toOptions = (rows, titleField) =>
  rows
    .map((item) => ({
      id: item.id,
      title: String(item[titleField] || '').trim(),
      slug: item.slug,
    }))
    .filter((item) => item.title);

exports.getInsightOptions = async (req, res) => {
  try {
    const [blogs, caseStudies, whitePapers] = await Promise.all([
      Blog.findAll({
        where: { is_delete: false, is_active: true },
        attributes: ['id', 'main_title', 'slug'],
        order: [['id', 'DESC']],
      }),
      CaseStudy.findAll({
        where: { is_delete: false, is_active: true },
        attributes: ['id', 'title', 'slug'],
        order: [['id', 'DESC']],
      }),
      WhitePaper.findAll({
        where: { is_delete: false, is_active: true },
        attributes: ['id', 'title', 'slug'],
        order: [['id', 'DESC']],
      }),
    ]);

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Insight options fetched',
      data: {
        blog: toOptions(blogs, 'main_title'),
        'case-study': toOptions(caseStudies, 'title'),
        whitepaper: toOptions(whitePapers, 'title'),
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

exports.getFeaturedInsights = async (req, res) => {
  try {
    const items = await FeaturedInsight.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Featured insights fetched',
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

exports.saveFeaturedInsights = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const incoming = Array.isArray(req.body.insights) ? req.body.insights : [];

    const rows = incoming
      .map((item, index) => ({
        insight_type: String(item.insight_type || '').trim(),
        insight_id: Number(item.insight_id),
        sort_order: index,
        is_active: true,
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      }))
      .filter((item) => INSIGHT_TYPES.includes(item.insight_type) && Number.isInteger(item.insight_id) && item.insight_id > 0)
      .slice(0, MAX_SLOTS);

    await FeaturedInsight.destroy({ where: {}, transaction: t });

    if (rows.length) {
      await FeaturedInsight.bulkCreate(rows, { transaction: t });
    }

    await t.commit();

    const items = await FeaturedInsight.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Featured insights saved',
      data: items,
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
