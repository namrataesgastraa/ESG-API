'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogDownloads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      mobile: {
        type: Sequelize.STRING,
        allowNull: false
      },

      blog_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      title: {
        type: Sequelize.STRING
      },

      context: {
        type: Sequelize.STRING,
        defaultValue: 'download'
      },

      ip_address: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BlogDownloads');
  }
};
