const { Announcement, sequelize } = require('../models');

exports.getAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Announcements fetched',
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

exports.saveAnnouncements = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];

    const rows = incoming
      .map((item, index) => ({
        message: (item.message || '').trim(),
        link_label: (item.link_label || '').trim() || null,
        link_url: (item.link_url || '').trim() || null,
        sort_order: index,
        is_active: item.is_active === undefined ? true : Boolean(item.is_active),
        created_by: req.user?.id || null,
        updated_by: req.user?.id || null,
      }))
      .filter((item) => item.message);

    await Announcement.destroy({ where: {}, transaction: t });

    if (rows.length) {
      await Announcement.bulkCreate(rows, { transaction: t });
    }

    await t.commit();

    const items = await Announcement.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Announcements saved',
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
