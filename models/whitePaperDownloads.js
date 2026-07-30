'use strict';

module.exports = (sequelize, DataTypes) => {
  const WhitePaperDownload = sequelize.define('WhitePaperDownload', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false
    },

    white_paper_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title: DataTypes.STRING,

    category_name: DataTypes.STRING,

    context: {
      type: DataTypes.STRING,
      defaultValue: 'download'
    },

    ip_address: DataTypes.STRING

  }, {
    tableName: 'WhitePaperDownloads',
    timestamps: true,
    updatedAt: false,
  });

  return WhitePaperDownload;
};
