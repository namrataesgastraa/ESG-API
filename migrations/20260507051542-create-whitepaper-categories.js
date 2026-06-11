"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WhitePaperCategories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      normalized_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      is_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("WhitePaperCategories", ["normalized_name"], {
      unique: true,
      where: {
        is_delete: false,
      },
      name: "whitepaper_categories_normalized_name_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("WhitePaperCategories");
  },
};
