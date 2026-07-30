const express = require('express');
const router = express.Router();

const controller = require('../controllers/public.controller');
const publicAuth = require('../middlewares/public.middleware');
const resumeUpload = require('../middlewares/resumeUpload');

router.get('/token', controller.getPublicToken);
router.get('/case-studies', publicAuth, controller.getPublicCaseStudies);
router.post('/download', publicAuth, controller.downloadCaseStudy);

router.get('/white-papers', publicAuth, controller.getPublicWhitePaper);
router.post('/white-paper-download', publicAuth, controller.downloadWhitePaper);

router.get('/blogs', publicAuth, controller.getPublicBlogs);
router.get('/blog-detail/:id', publicAuth, controller.getPublicBlogDetail);

router.post('/blog-download', publicAuth, controller.downloadBlog);

router.get('/announcement', publicAuth, controller.getPublicAnnouncement);
router.get('/faqs', publicAuth, controller.getPublicFaqs);
router.get('/featured-insights', publicAuth, controller.getPublicFeaturedInsights);
router.get('/podcasts', publicAuth, controller.getPublicPodcasts);

router.get('/careers', publicAuth, controller.getPublicCareers);
router.post('/careers/apply', publicAuth, resumeUpload.single('resume'), controller.applyToCareer);

module.exports = router;