const express = require('express');
const router = express.Router();

const jobApplicationController = require('../controllers/jobApplication.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', auth, admin, jobApplicationController.getAllJobApplications);
router.get('/:id', auth, admin, jobApplicationController.getJobApplicationById);
router.patch('/:id/status', auth, admin, jobApplicationController.updateJobApplicationStatus);
router.delete('/:id', auth, admin, jobApplicationController.deleteJobApplication);

module.exports = router;
