const { HomeFaq, sequelize } = require('../models');

// Returns all homepage FAQs ordered for the admin editor.
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await HomeFaq.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'FAQs fetched',
      data: faqs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message,
    });
  }
};

// Replaces the homepage FAQ set with the submitted list (max 6 kept).
exports.saveFaqs = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const incoming = Array.isArray(req.body.faqs) ? req.body.faqs : [];

    const rows = incoming
      .map((item, index) => ({
        question: (item.question || '').trim(),
        answer: (item.answer || '').trim(),
        sort_order: index,
        is_active: item.is_active === undefined ? true : Boolean(item.is_active),
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      }))
      .filter((item) => item.question && item.answer);

    await HomeFaq.destroy({ where: {}, truncate: false, transaction: t });

    if (rows.length) {
      await HomeFaq.bulkCreate(rows, { transaction: t });
    }

    await t.commit();

    const faqs = await HomeFaq.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'FAQs saved',
      data: faqs,
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
