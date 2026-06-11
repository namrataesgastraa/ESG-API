'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    normalized_name: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: 'Categories',
    timestamps: true
  });

  Category.associate = (models) => {
    Category.hasMany(models.CaseStudy, {
        foreignKey: 'category_id',
        as: 'case_studies'
    });
  };

  return Category;
};