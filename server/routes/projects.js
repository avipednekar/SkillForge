const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const projectController = require("../controllers/projectController");

router.get("/", auth, projectController.getProjects);
router.get("/:id", auth, projectController.getProject);
router.post("/", auth, projectController.createProject);
router.put("/:id", auth, projectController.updateProject);
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;
