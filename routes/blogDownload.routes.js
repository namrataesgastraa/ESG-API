const express = require('express');
const router = express.Router();

const blogDownloadController = require('../controllers/blogDownload.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, blogDownloadController.getAllDownloadLogs);

module.exports = router;
