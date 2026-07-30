'use strict';

module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    link_label: DataTypes.STRING,
    link_url: DataTypes.STRING,

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
    tableName: 'Announcements',
    timestamps: true
  });

  return Announcement;
};
