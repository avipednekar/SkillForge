const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const resumeController = require("../controllers/resumeController");
const { resumeUpload } = require("../services/uploadService");

// Resume upload route with dedicated configuration
router.post(
  "/upload",
  auth,
  resumeUpload.single("resume"),
  resumeController.uploadResume
);

router.post(
  "/parse",
  auth,
  resumeUpload.single("resume"),
  resumeController.parseResume
);

module.exports = router;
