'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogTab = sequelize.define('BlogTab', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    tab_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    heading: {
      type: DataTypes.STRING,
      allowNull: false
    },

    content: {
      type: DataTypes.JSON,
      allowNull: true
    },

    section_image: DataTypes.STRING,
    section_image_caption: DataTypes.STRING

  }, {
    tableName: 'BlogTabs',
    timestamps: true
  });

  BlogTab.associate = (models) => {
    BlogTab.belongsTo(models.Blog, {
      foreignKey: 'blog_id',
      as: 'blog'
    });

    BlogTab.hasMany(models.BlogTabBullet, {
      foreignKey: 'blog_tab_id',
      as: 'bullets',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return BlogTab;
};
