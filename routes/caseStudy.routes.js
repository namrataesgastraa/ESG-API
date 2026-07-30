const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/caseStudy.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const upload = require('../middlewares/caseStudyUpload');

const caseStudyExcelFields = upload.fields([
  { name: 'excel_file', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]);

router.post('/preview-excel', auth, admin, caseStudyExcelFields, categoryController.previewCaseStudyExcel);
router.post('/upload-excel', auth, admin, caseStudyExcelFields, categoryController.uploadCaseStudyExcel);
router.put('/:id/upload-excel', auth, admin, caseStudyExcelFields, categoryController.updateCaseStudyExcel);

router.post(
  '/',
  auth,
  admin,
  upload.fields([
    { name: 'pdf_file', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  categoryController.createCaseStudy
);
router.get('/', auth, admin, categoryController.getAllCaseStudies);
router.get('/:id', auth, admin, categoryController.getCaseStudyById);
router.put(
  '/:id',
  auth,
  admin,
  upload.fields([
    { name: 'pdf_file', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  categoryController.updateCaseStudy
);
router.delete('/:id', auth, admin, categoryController.deleteCaseStudy);
router.patch('/:id/status', auth, admin, categoryController.toggleCaseStudyStatus);

module.exports = router;