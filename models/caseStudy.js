'use strict';

module.exports = (sequelize, DataTypes) => {
  const CaseStudy = sequelize.define('CaseStudy', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    normalized_title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: DataTypes.TEXT,

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    pdf_file: {
      type: DataTypes.STRING,
      allowNull: true
    },

    image: DataTypes.STRING,

    slug: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    eyebrow: DataTypes.STRING,
    industry_tag: DataTypes.STRING,
    category_tags: DataTypes.JSON,
    published_date: DataTypes.STRING,
    read_time: DataTypes.STRING,
    author_name: DataTypes.STRING,

    cover_image: DataTypes.STRING,
    cover_alt: DataTypes.STRING,
    cover_caption: DataTypes.STRING,

    summary_content: DataTypes.JSON,
    key_insights: DataTypes.JSON,
    related_case_studies: DataTypes.JSON,

    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

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
    tableName: 'CaseStudies',
    timestamps: true
  });

  CaseStudy.associate = (models) => {
    CaseStudy.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });
  };

  return CaseStudy;
};