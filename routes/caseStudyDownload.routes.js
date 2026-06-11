const express = require('express');
const router = express.Router();

const caseStudyDownloadController = require('../controllers/caseStudyDownload.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, caseStudyDownloadController.getAllDownloadLogs);

module.exports = router;