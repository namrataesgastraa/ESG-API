const express = require('express');
const router = express.Router();

const whitePaperDownloadController = require('../controllers/whitePaperDownload.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, whitePaperDownloadController.getAllDownloadLogs);

module.exports = router;
