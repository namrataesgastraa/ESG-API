'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      normalized_name: {
        type: Sequelize.STRING,
        allowNull: false
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

    await queryInterface.addIndex('Categories', ['normalized_name'], {
      unique: true,
      where: {
        is_delete: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Categories');
  }
};