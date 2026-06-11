'use strict';

module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('Blog', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    blog_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    website_url: DataTypes.STRING,
    linkedin_url: DataTypes.STRING,
    instagram_url: DataTypes.STRING,
    medium_url: DataTypes.STRING,

    main_title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    sub_title: DataTypes.STRING,

    normalized_title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    eyebrow: DataTypes.STRING,

    intro_paragraph_1: DataTypes.TEXT,
    intro_paragraph_2: DataTypes.TEXT,

    cta_text: DataTypes.TEXT,

    cover_image: DataTypes.STRING,
    cover_caption: DataTypes.STRING,

    pdf_file: DataTypes.STRING,

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER

  }, {
    tableName: 'Blogs',
    timestamps: true
  });

  Blog.associate = (models) => {
    Blog.hasMany(models.BlogTab, {
      foreignKey: 'blog_id',
      as: 'tabs',
      onDelete: 'CASCADE',
      hooks: true
    });

    Blog.hasMany(models.BlogReference, {
      foreignKey: 'blog_id',
      as: 'references',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return Blog;
};
