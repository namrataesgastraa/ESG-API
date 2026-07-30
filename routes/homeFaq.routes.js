const express = require('express');
const router = express.Router();

const homeFaqController = require('../controllers/homeFaq.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, homeFaqController.getFaqs);
router.put('/', auth, admin, homeFaqController.saveFaqs);

module.exports = router;
