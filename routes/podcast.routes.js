const express = require("express");
const router = express.Router();

const podcastController = require("../controllers/podcast.controller");
const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");
const upload = require("../middlewares/caseStudyUpload");

const thumbnailField = upload.fields([{ name: "thumbnail", maxCount: 1 }]);

router.post("/", auth, admin, thumbnailField, podcastController.createPodcast);
router.get("/", auth, admin, podcastController.getAllPodcasts);
router.get("/:id", auth, admin, podcastController.getPodcastById);
router.put("/:id", auth, admin, thumbnailField, podcastController.updatePodcast);
router.delete("/:id", auth, admin, podcastController.deletePodcast);
router.patch("/:id/status", auth, admin, podcastController.togglePodcastStatus);

module.exports = router;
