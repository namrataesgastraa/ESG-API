const express = require('express');
const router = express.Router();

const controller = require('../controllers/public.controller');
const publicAuth = require('../middlewares/public.middleware');

router.get('/token', controller.getPublicToken);
router.get('/case-studies', publicAuth, controller.getPublicCaseStudies);
router.post('/download', publicAuth, controller.downloadCaseStudy);

router.get('/white-papers', publicAuth, controller.getPublicWhitePaper);
router.post('/white-paper-download', publicAuth, controller.downloadWhitePaper);

router.get('/blogs', publicAuth, controller.getPublicBlogs);
router.get('/blog-detail/:id', controller.getPublicBlogDetail);

router.post('/blog-download', publicAuth, controller.downloadBlog);

module.exports = router;