'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WhitePapers', {
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

      normalized_title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT
      },

      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'WhitePaperCategories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      pdf_file: {
        type: Sequelize.STRING,
        allowNull: false
      },

      image: {
        type: Sequelize.STRING
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

    await queryInterface.addIndex('WhitePapers', ['normalized_title'], {
      unique: true,
      where: {
        is_delete: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WhitePapers');
  }
};