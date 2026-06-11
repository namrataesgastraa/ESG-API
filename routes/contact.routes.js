const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/submit', contactController.submitContactForm);
router.get('/logs', authMiddleware, contactController.getContactLogs);
router.get('/verify-smtp', authMiddleware, contactController.verifySmtp);
router.post('/test-email', authMiddleware, contactController.testEmail);

module.exports = router;
