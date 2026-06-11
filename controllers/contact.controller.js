'use strict';

const { ContactLog } = require('../models');
const { Op } = require('sequelize');
const Validator = require('../utils/validator');
const { sendEmail, verifyConnection } = require('../utils/email.helper');

const formConfig = {
  book_consultation: {
    requiredFields: ['full_name', 'work_email', 'company', 'role_title', 'inquiry_type'],
    emailField: 'work_email',
    nameField: 'full_name',
    subject: 'New Consultation Booking - ESG Astraa'
  },
  request_assessment: {
    requiredFields: ['full_name', 'work_email', 'company', 'role_title', 'assessment_type'],
    emailField: 'work_email',
    nameField: 'full_name',
    subject: 'New Assessment Request - ESG Astraa'
  },
  request_call: {
    requiredFields: ['first_name', 'last_name', 'work_email', 'message'],
    emailField: 'work_email',
    nameField: ['first_name', 'last_name'],
    subject: 'New Call Request - ESG Astraa'
  },
  download_resource: {
    requiredFields: ['name', 'work_email'],
    emailField: 'work_email',
    nameField: 'name',
    subject: 'New Resource Download Request - ESG Astraa'
  },
  newsletter_subscribe: {
    requiredFields: ['first_name', 'work_email'],
    emailField: 'work_email',
    nameField: 'first_name',
    subject: 'New Newsletter Subscription - ESG Astraa'
  }
};

const resolveName = (config, payload) => {
  if (Array.isArray(config.nameField)) {
    return config.nameField.map(f => payload[f] || '').join(' ').trim();
  }
  return payload[config.nameField] || '';
};

const buildAdminHtml = (form_type, name, payload) => {
  const formLabel = form_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const rows = Object.entries(payload)
    .map(([key, value]) =>
      `<tr>
        <td style="padding:10px 14px;border:1px solid #e0e0e0;font-weight:600;background:#f9f9f9;text-transform:capitalize;white-space:nowrap">${key.replace(/_/g, ' ')}</td>
        <td style="padding:10px 14px;border:1px solid #e0e0e0">${value || '-'}</td>
      </tr>`
    )
    .join('');

  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
    <div style="background:#1a1a2e;padding:20px 24px">
      <h2 style="color:#ffffff;margin:0;font-size:18px">New ${formLabel} Submission</h2>
      <p style="color:#a0a0c0;margin:4px 0 0;font-size:13px">Submitted by: ${name}</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;border-top:1px solid #e0e0e0;font-size:12px;color:#888">
      ESG Astraa — Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>`;
};

const buildUserHtml = (form_type, name) => {
  const confirmMessages = {
    book_consultation: 'Your consultation request has been received. Our team will review it and a named consultant will contact you directly within 24 hours.',
    request_assessment: 'Your assessment request has been received. We will review your details and reach out within 24 hours with a tailored proposal.',
    request_call: 'Your call request has been received. Our team will get back to you within 24 hours.',
    download_resource: 'Thank you for your interest. Your download request has been received and we will follow up shortly.',
    newsletter_subscribe: 'You have been subscribed to ESG Pulse — the weekly ESG briefing for Indian practitioners. Look out for your first issue this Friday.'
  };

  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
    <div style="background:#1a1a2e;padding:20px 24px">
      <h2 style="color:#ffffff;margin:0;font-size:18px">ESG Astraa</h2>
    </div>
    <div style="padding:32px 24px">
      <h3 style="margin:0 0 12px;font-size:20px;color:#1a1a2e">Thank you, ${name}!</h3>
      <p style="color:#444;line-height:1.6;font-size:15px">${confirmMessages[form_type]}</p>
      <p style="color:#444;line-height:1.6;font-size:15px;margin-top:24px">Best regards,<br><strong>ESG Astraa Team</strong></p>
    </div>
    <div style="padding:16px 24px;background:#f5f5f5;border-top:1px solid #e0e0e0;font-size:12px;color:#888">
      advisory@esgastraa.com &nbsp;|&nbsp; +91 9409025555
    </div>
  </div>`;
};

exports.submitContactForm = async (req, res) => {
  try {
    const { form_type, ...payload } = req.body;

    if (!form_type) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'form_type is required'
      });
    }

    const config = formConfig[form_type];

    if (!config) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: `Invalid form_type. Allowed: ${Object.keys(formConfig).join(', ')}`
      });
    }

    const requiredError = Validator.required(config.requiredFields, payload);
    if (requiredError) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: requiredError
      });
    }

    const userEmail = payload[config.emailField];

    if (!Validator.isEmail(userEmail)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Invalid email format'
      });
    }

    const name = resolveName(config, payload);

    let status = 'success';
    let errorMessage = null;
    let sentAt = null;

    try {
      await sendEmail({
        to: process.env.EMAIL_ADMIN,
        subject: config.subject,
        html: buildAdminHtml(form_type, name, payload)
      });

      await sendEmail({
        to: userEmail,
        subject: 'We received your request — ESG Astraa',
        html: buildUserHtml(form_type, name)
      });

      sentAt = new Date();
    } catch (emailError) {
      status = 'failed';
      errorMessage = emailError.message;
      console.error('[EMAIL ERROR]', emailError.message);
    }

    await ContactLog.create({
      form_type,
      name,
      email: userEmail,
      payload,
      status,
      error_message: errorMessage,
      sent_at: sentAt
    });

    if (status === 'failed') {
      return res.status(500).json({
        status: false,
        responseCode: 500,
        message: 'Failed to send email. Your submission has been logged.'
      });
    }

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Your request has been submitted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.getContactLogs = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', form_type = '', status = '' } = req.query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);
    const offset = (page - 1) * limit;

    const whereCondition = { is_delete: false };

    if (form_type) {
      whereCondition.form_type = form_type;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ContactLog.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'Contact logs fetched',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: error.message
    });
  }
};

exports.verifySmtp = async (req, res) => {
  try {
    await verifyConnection();
    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: 'SMTP connection verified successfully',
      data: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        sender: process.env.EMAIL_USER,
        admin_recipient: process.env.EMAIL_ADMIN
      }
    });
  } catch (error) {
    console.error('[SMTP VERIFY ERROR]', error.message);
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: 'SMTP connection failed',
      error: error.message
    });
  }
};

exports.testEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to || !Validator.isEmail(to)) {
      return res.status(400).json({
        status: false,
        responseCode: 400,
        message: 'Valid recipient email (to) is required'
      });
    }

    await sendEmail({
      to,
      subject: 'SMTP Test — ESG Astraa',
      html: `<div style="font-family:Arial,sans-serif;padding:24px">
        <h2>SMTP Test Email</h2>
        <p>This is a test email from ESG Astraa API.</p>
        <p>If you received this, SMTP is working correctly.</p>
        <p style="color:#888;font-size:12px">Sent: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>`
    });

    return res.status(200).json({
      status: true,
      responseCode: 200,
      message: `Test email sent successfully to ${to}`
    });

  } catch (error) {
    console.error('[TEST EMAIL ERROR]', error.message);
    return res.status(500).json({
      status: false,
      responseCode: 500,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};
