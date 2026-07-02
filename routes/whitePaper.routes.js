const express = require("express");
const router = express.Router();

const whitePaperController = require("../controllers/whitepaper.controller");
const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");
const upload = require("../middlewares/caseStudyUpload");

const whitePaperExcelFields = upload.fields([
  { name: "excel_file", maxCount: 1 },
  { name: "cover_image", maxCount: 1 },
  { name: "pdf_file", maxCount: 1 },
]);

router.post("/preview-excel", auth, admin, whitePaperExcelFields, whitePaperController.previewWhitePaperExcel);
router.post("/upload-excel", auth, admin, whitePaperExcelFields, whitePaperController.uploadWhitePaperExcel);

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
