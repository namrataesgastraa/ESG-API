const express = require('express');
const router = express.Router();

const jobOpeningController = require('../controllers/jobOpening.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.post('/', auth, admin, jobOpeningController.createJobOpening);
router.get('/', auth, admin, jobOpeningController.getAllJobOpenings);
router.get('/:id', auth, admin, jobOpeningController.getJobOpeningById);
router.put('/:id', auth, admin, jobOpeningController.updateJobOpening);
router.delete('/:id', auth, admin, jobOpeningController.deleteJobOpening);
router.patch('/:id/status', auth, admin, jobOpeningController.toggleJobOpeningStatus);

module.exports = router;
