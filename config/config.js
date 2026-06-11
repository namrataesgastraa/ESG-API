require('dotenv').config();
const fs = require('fs');
const path = require('path');

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
};

const productionConfig = {
  ...baseConfig,
  ssl: true,
  get dialectOptions() {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(__dirname, '..', 'global-bundle.pem')).toString(),
      },
    };
  },
};

module.exports = {
  development: { ...baseConfig },
  production: productionConfig,
};
