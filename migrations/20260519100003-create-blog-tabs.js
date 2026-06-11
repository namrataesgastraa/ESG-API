'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogTabs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      blog_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Blogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      tab_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      heading: {
        type: Sequelize.STRING,
        allowNull: false
      },

      content: {
        type: Sequelize.JSON,
        allowNull: true
      },

      section_image: {
        type: Sequelize.STRING,
        allowNull: true
      },

      section_image_caption: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addIndex('BlogTabs', ['blog_id']);
    await queryInterface.addIndex('BlogTabs', ['blog_id', 'tab_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BlogTabs');
  }
};
