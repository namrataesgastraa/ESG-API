'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogDownload = sequelize.define('BlogDownload', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false
    },

    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title: DataTypes.STRING,

    context: {
      type: DataTypes.STRING,
      defaultValue: 'download'
    },

    ip_address: DataTypes.STRING

  }, {
    tableName: 'BlogDownloads',
    timestamps: true,
    updatedAt: false,
  });

  return BlogDownload;
};
