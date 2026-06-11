const express = require("express");
const router = express.Router();

const whitePaperCategoryController = require("../controllers/whitePaperCategory.controller");
const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");

router.post(
  "/",
  auth,
  admin,
  whitePaperCategoryController.createWhitePaperCategory,
);
router.get("/", auth, admin, whitePaperCategoryController.getAllCategories);
router.get(
  "/dropdown",
  auth,
  admin,
  whitePaperCategoryController.getWhitePaperCategoryDropdown,
);
router.get(
  "/:id",
  auth,
  admin,
  whitePaperCategoryController.getWhitePaperCategoryById,
);
router.put(
  "/:id",
  auth,
  admin,
  whitePaperCategoryController.updateWhitePaperCategory,
);
router.delete(
  "/:id",
  auth,
  admin,
  whitePaperCategoryController.deleteWhitePaperCategory,
);
router.patch(
  "/:id/status",
  auth,
  admin,
  whitePaperCategoryController.toggleWhitePaperCategoryStatus,
);

module.exports = router;
