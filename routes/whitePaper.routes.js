const express = require("express");
const router = express.Router();

const whitePaperController = require("../controllers/whitepaper.controller");
const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");
const upload = require("../middlewares/caseStudyUpload");

router.post(
  "/",
  auth,
  admin,
  upload.fields([
    { name: "pdf_file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  whitePaperController.createWhitePaper,
);
router.get("/", auth, admin, whitePaperController.getAllWhitePapers);
router.get("/:id", auth, admin, whitePaperController.getWhitePaperById);
router.put(
  "/:id",
  auth,
  admin,
  upload.fields([
    { name: "pdf_file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  whitePaperController.updateWhitePaper,
);
router.delete("/:id", auth, admin, whitePaperController.deleteWhitePaper);
router.patch(
  "/:id/status",
  auth,
  admin,
  whitePaperController.toggleWhitePaperStatus,
);

module.exports = router;
