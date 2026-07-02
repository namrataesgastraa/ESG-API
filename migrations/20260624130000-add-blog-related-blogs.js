'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Blogs');
    if (!table.related_blogs) {
      await queryInterface.addColumn('Blogs', 'related_blogs', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Blogs');
    if (table.related_blogs) {
      await queryInterface.removeColumn('Blogs', 'related_blogs');
    }
  },
};
