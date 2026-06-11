'use strict';

module.exports = (sequelize, DataTypes) => {
  const CaseStudyDownload = sequelize.define('CaseStudyDownload', {

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

    case_study_id: {
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
    tableName: 'CaseStudyDownloads',
    timestamps: true,
    updatedAt: false,
  });

  return CaseStudyDownload;
};