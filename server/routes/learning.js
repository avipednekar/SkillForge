const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const learningController = require("../controllers/learningController");

router.get("/recommendations", auth, learningController.getRecommendations);

module.exports = router;
