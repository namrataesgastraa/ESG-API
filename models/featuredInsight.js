'use strict';

module.exports = (sequelize, DataTypes) => {
  const FeaturedInsight = sequelize.define('FeaturedInsight', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    insight_type: {
      type: DataTypes.STRING,
      allowNull: false
    },

    insight_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER

  }, {
    tableName: 'FeaturedInsights',
    timestamps: true
  });

  return FeaturedInsight;
};
