"use strict";

module.exports = (sequelize, DataTypes) => {
  const Podcast = sequelize.define(
    "Podcast",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      normalized_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      podcast_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
    },
    {
      tableName: "Podcasts",
      timestamps: true,
    },
  );

  return Podcast;
};
