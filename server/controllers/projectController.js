const Project = require("../models/Project");

// @desc    Get all projects for current user
// @route   GET api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Get single project
// @route   GET api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(500).send("Server error");
  }
};

// @desc    Create a project
// @route   POST api/projects
// @access  Private
exports.createProject = async (req, res) => {
  const { title, description, technologies, imageUrl, projectUrl, githubUrl } =
    req.body;

  try {
    const newProject = new Project({
      title,
      description,
      technologies: Array.isArray(technologies)
        ? technologies
        : technologies.split(",").map((tech) => tech.trim()),
      imageUrl,
      projectUrl,
      githubUrl,
      user: req.user.id,
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Update a project
// @route   PUT api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  const { title, description, technologies, imageUrl, projectUrl, githubUrl } =
    req.body;

  const projectFields = {
    title,
    description,
    technologies: Array.isArray(technologies)
      ? technologies
      : technologies?.split(",").map((tech) => tech.trim()),
    imageUrl,
    projectUrl,
    githubUrl,
  };

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Delete a project
// @route   DELETE api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Make sure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await project.deleteOne();

    res.json({ message: "Project removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
