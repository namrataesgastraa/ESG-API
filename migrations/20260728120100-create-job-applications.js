'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobApplications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      job_opening_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      job_title: {
        type: Sequelize.STRING
      },

      department: {
        type: Sequelize.STRING
      },

      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },

      current_location: {
        type: Sequelize.STRING
      },

      total_experience: {
        type: Sequelize.DECIMAL(4, 1)
      },

      current_organisation: {
        type: Sequelize.STRING
      },

      current_designation: {
        type: Sequelize.STRING
      },

      notice_period: {
        type: Sequelize.STRING
      },

      qualification: {
        type: Sequelize.STRING
      },

      institution: {
        type: Sequelize.STRING
      },

      graduation_year: {
        type: Sequelize.STRING
      },

      pan_number: {
        type: Sequelize.STRING
      },

      certifications: {
        type: Sequelize.STRING
      },

      linkedin_url: {
        type: Sequelize.STRING
      },

      resume_url: {
        type: Sequelize.STRING,
        allowNull: false
      },

      cover_note: {
        type: Sequelize.TEXT
      },

      ip_address: {
        type: Sequelize.STRING
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: 'new'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('JobApplications');
  }
};
