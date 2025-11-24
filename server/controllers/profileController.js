const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, headline, bio, skills, socials } = req.body;

  const profileFields = {
    firstName,
    lastName,
    headline,
    bio,
    skills: Array.isArray(skills)
      ? skills
      : skills.split(",").map((skill) => skill.trim()),
    socials,
  };

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      user.profile = { ...user.profile, ...profileFields };
      await user.save();
      return res.json(user);
    }

    res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
