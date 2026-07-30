'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Announcements');

    const columns = {
      link_label: { type: Sequelize.STRING, allowNull: true },
      link_url: { type: Sequelize.STRING, allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    };

    for (const [name, definition] of Object.entries(columns)) {
      if (!table[name]) {
        await queryInterface.addColumn('Announcements', name, definition);
      }
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Announcements');
    for (const name of ['link_label', 'link_url', 'sort_order']) {
      if (table[name]) {
        await queryInterface.removeColumn('Announcements', name);
      }
    }
  },
};
