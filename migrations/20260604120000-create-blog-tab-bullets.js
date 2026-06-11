'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogTabBullets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      blog_tab_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BlogTabs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      bullet_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      lead: {
        type: Sequelize.STRING,
        allowNull: false
      },

      body: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('BlogTabBullets', ['blog_tab_id']);
    await queryInterface.addIndex('BlogTabBullets', ['blog_tab_id', 'bullet_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BlogTabBullets');
  }
};
