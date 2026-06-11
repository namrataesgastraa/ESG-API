'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      blog_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      website_url: {
        type: Sequelize.STRING,
        allowNull: true
      },

      linkedin_url: {
        type: Sequelize.STRING,
        allowNull: true
      },

      instagram_url: {
        type: Sequelize.STRING,
        allowNull: true
      },

      medium_url: {
        type: Sequelize.STRING,
        allowNull: true
      },

      main_title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      sub_title: {
        type: Sequelize.STRING,
        allowNull: true
      },

      normalized_title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      eyebrow: {
        type: Sequelize.STRING,
        allowNull: true
      },

      intro_paragraph_1: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      intro_paragraph_2: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      cta_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      cover_image: {
        type: Sequelize.STRING,
        allowNull: true
      },

      cover_caption: {
        type: Sequelize.STRING,
        allowNull: true
      },

      pdf_file: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addIndex('Blogs', ['normalized_title'], {
      unique: true,
      where: { is_delete: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Blogs');
  }
};
