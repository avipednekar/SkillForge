const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/projects";
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      req.user.id + "_" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Multer upload instance for images
const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
});

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/resumes";
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with user ID and timestamp
    const timestamp = Date.now();
    const uniqueSuffix = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    // Format: resume_userId_timestamp_random.pdf
    cb(null, `resume_${req.user.id}_${timestamp}_${uniqueSuffix}${ext}`);
  },
});

// File filter for resumes only (PDF and DOCX)
const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Check MIME types
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed for resume uploads"));
  }
};

// Multer upload instance for resumes
const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
  },
  fileFilter: resumeFileFilter,
});

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted:", filePath);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};

module.exports = {
  upload, // For images
  resumeUpload,
  deleteFile,
};
