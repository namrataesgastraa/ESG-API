'use strict';

const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    requireTLS: process.env.EMAIL_SECURE !== 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: process.env.EMAIL_ALLOW_SELF_SIGNED !== 'true'
    }
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"ESG Astraa" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

const verifyConnection = async () => {
  const transporter = createTransporter();
  return transporter.verify();
};

module.exports = { sendEmail, verifyConnection };
