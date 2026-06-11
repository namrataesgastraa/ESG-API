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
      allowNull: false
    },

    pdf_file: {
      type: DataTypes.STRING,
      allowNull: false
    },

    image: DataTypes.STRING,

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