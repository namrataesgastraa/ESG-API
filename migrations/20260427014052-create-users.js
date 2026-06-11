'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: Sequelize.STRING,

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      mobile_number: Sequelize.STRING,

      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      is_superadmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      last_login_at: Sequelize.DATE,

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

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      where: {
        is_delete: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};