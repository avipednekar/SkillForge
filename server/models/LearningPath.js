const mongoose = require("mongoose");

const LearningPathSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  resources: [
    {
      title: String,
      type: { type: String, enum: ["video", "article", "course"] },
      url: String,
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
      },
    },
  ],
  relatedSkills: [String],
});

module.exports = mongoose.model("LearningPath", LearningPathSchema);
