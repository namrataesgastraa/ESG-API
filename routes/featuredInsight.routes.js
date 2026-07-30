const express = require('express');
const router = express.Router();

const featuredInsightController = require('../controllers/featuredInsight.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/options', auth, admin, featuredInsightController.getInsightOptions);
router.get('/', auth, admin, featuredInsightController.getFeaturedInsights);
router.put('/', auth, admin, featuredInsightController.saveFeaturedInsights);

module.exports = router;
