'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogReferences', {
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

      reference_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false
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

    await queryInterface.addIndex('BlogReferences', ['blog_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BlogReferences');
  }
};
