'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContactLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      form_type: {
        type: Sequelize.STRING,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING,
        allowNull: true
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      payload: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false
      },

      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      is_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ContactLogs');
  }
};
