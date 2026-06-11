const express = require("express");
const router = express.Router();

const industriesController = require("../controllers/industries.controller.js");
const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");

router.post("/", auth, admin, industriesController.createIndustry);
router.get("/", auth, admin, industriesController.getAllIndustries);
router.get("/dropdown", auth, admin, industriesController.getIndustryDropdown);
router.get("/:id", auth, admin, industriesController.getIndustryById);
router.put("/:id", auth, admin, industriesController.updateIndustry);
router.delete("/:id", auth, admin, industriesController.deleteIndustry);
router.patch(
  "/:id/status",
  auth,
  admin,
  industriesController.toggleIndustryStatus,
);

module.exports = router;
