'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CaseStudyDownloads', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('WhitePaperDownloads', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CaseStudyDownloads', 'name');
    await queryInterface.removeColumn('WhitePaperDownloads', 'name');
  },
};
