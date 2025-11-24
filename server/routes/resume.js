const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const resumeController = require("../controllers/resumeController");

// Multer config
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  "/upload",
  auth,
  upload.single("resume"),
  resumeController.uploadResume
);
router.post("/parse", auth, resumeController.parseResume);

module.exports = router;
