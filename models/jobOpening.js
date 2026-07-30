'use strict';

module.exports = (sequelize, DataTypes) => {
  const JobOpening = sequelize.define('JobOpening', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    department: {
      type: DataTypes.STRING,
      allowNull: false
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false
    },

    employment_type: {
      type: DataTypes.STRING,
      defaultValue: 'Full-time'
    },

    experience_min: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    experience_max: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    summary: DataTypes.TEXT,

    responsibilities: DataTypes.JSON,
    requirements: DataTypes.JSON,

    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'JobOpenings',
    timestamps: true
  });

  return JobOpening;
};
