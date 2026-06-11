'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingAdmin = await queryInterface.sequelize.query(
      `SELECT * FROM "Users" WHERE is_superadmin = true LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length > 0) {
      console.log('SuperAdmin already exists');
      return;
    }

    const hash = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('Users', [{
      name: 'Astra Admin',
      email: 'superadmin@astra.com',
      mobile_number: '9999999999',
      password: hash,
      is_superadmin: true,
      is_active: true,
      is_delete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    console.log('SuperAdmin created');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      is_superadmin: true
    });
  }
};