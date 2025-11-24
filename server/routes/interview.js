const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const interviewController = require("../controllers/interviewController");

router.post("/start", auth, interviewController.startInterview);
router.post("/answer", auth, interviewController.submitAnswer);
router.post("/end", auth, interviewController.endInterview);

module.exports = router;
