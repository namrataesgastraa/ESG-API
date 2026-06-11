"use strict";

module.exports = (sequelize, DataTypes) => {
  const WhitePaperCategory = sequelize.define(
    "WhitePaperCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      normalized_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "WhitePaperCategories",
      timestamps: true,
    },
  );

  WhitePaperCategory.associate = (models) => {
    WhitePaperCategory.hasMany(models.WhitePaper, {
      foreignKey: "category_id",
      as: "white_papers",
    });
  };

  return WhitePaperCategory;
};
