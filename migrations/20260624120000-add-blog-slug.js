'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Blogs');
    if (!table.slug) {
      await queryInterface.addColumn('Blogs', 'slug', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Blogs');
    if (table.slug) {
      await queryInterface.removeColumn('Blogs', 'slug');
    }
  },
};
