'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobOpenings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      department: {
        type: Sequelize.STRING,
        allowNull: false
      },

      location: {
        type: Sequelize.STRING,
        allowNull: false
      },

      employment_type: {
        type: Sequelize.STRING,
        defaultValue: 'Full-time'
      },

      experience_min: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      experience_max: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      summary: {
        type: Sequelize.TEXT
      },

      responsibilities: {
        type: Sequelize.JSON
      },

      requirements: {
        type: Sequelize.JSON
      },

      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      is_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      created_by: Sequelize.INTEGER,
      updated_by: Sequelize.INTEGER,

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
    await queryInterface.dropTable('JobOpenings');
  }
};
