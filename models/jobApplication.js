'use strict';

module.exports = (sequelize, DataTypes) => {
  const JobApplication = sequelize.define('JobApplication', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    job_opening_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    job_title: DataTypes.STRING,
    department: DataTypes.STRING,

    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },

    current_location: DataTypes.STRING,
    total_experience: DataTypes.DECIMAL(4, 1),
    current_organisation: DataTypes.STRING,
    current_designation: DataTypes.STRING,
    notice_period: DataTypes.STRING,

    qualification: DataTypes.STRING,
    institution: DataTypes.STRING,
    graduation_year: DataTypes.STRING,

    pan_number: DataTypes.STRING,
    certifications: DataTypes.STRING,
    linkedin_url: DataTypes.STRING,

    resume_url: {
      type: DataTypes.STRING,
      allowNull: false
    },

    cover_note: DataTypes.TEXT,
    ip_address: DataTypes.STRING,

    status: {
      type: DataTypes.STRING,
      defaultValue: 'new'
    }

  }, {
    tableName: 'JobApplications',
    timestamps: true,
    updatedAt: false,
  });

  JobApplication.associate = (models) => {
    JobApplication.belongsTo(models.JobOpening, {
      foreignKey: 'job_opening_id',
      as: 'jobOpening'
    });
  };

  return JobApplication;
};
