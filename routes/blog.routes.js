const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const upload = require('../middlewares/caseStudyUpload');

const blogUploadFields = upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'tab1_image', maxCount: 1 },
  { name: 'tab3_image', maxCount: 1 },
  { name: 'tab5_image', maxCount: 1 }
]);

router.post('/', auth, admin, blogUploadFields, blogController.createBlog);
router.get('/', auth, admin, blogController.getAllBlogs);
router.get('/:id', auth, admin, blogController.getBlogById);
router.put('/:id', auth, admin, blogUploadFields, blogController.updateBlog);
router.delete('/:id', auth, admin, blogController.deleteBlog);
router.patch('/:id/status', auth, admin, blogController.toggleBlogStatus);

module.exports = router;
