const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, announcementController.getAnnouncements);
router.put('/', auth, admin, announcementController.saveAnnouncements);

module.exports = router;
