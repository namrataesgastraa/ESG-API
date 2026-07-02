'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Blogs', 'industry_tag', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'published_date', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'read_time', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'author_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'summary', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'cover_alt', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Blogs', 'key_takeaways', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Blogs', 'industry_tag');
    await queryInterface.removeColumn('Blogs', 'published_date');
    await queryInterface.removeColumn('Blogs', 'read_time');
    await queryInterface.removeColumn('Blogs', 'author_name');
    await queryInterface.removeColumn('Blogs', 'summary');
    await queryInterface.removeColumn('Blogs', 'cover_alt');
    await queryInterface.removeColumn('Blogs', 'key_takeaways');
  },
};