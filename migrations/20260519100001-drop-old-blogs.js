'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('Blogs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('Blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: { type: Sequelize.STRING, allowNull: false },
      normalized_title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      pdf_file: { type: Sequelize.STRING, allowNull: false },
      image: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_delete: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_by: Sequelize.INTEGER,
      updated_by: Sequelize.INTEGER,
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  }
};
