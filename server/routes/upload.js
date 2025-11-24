const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload } = require("../services/uploadService");

// @route   POST api/upload/image
// @desc    Upload image file
// @access  Private
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the file path/URL
    const imageUrl = `/uploads/projects/${req.file.filename}`;

    res.json({
      message: "Image uploaded successfully",
      imageUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during upload" });
  }
});

module.exports = router;
