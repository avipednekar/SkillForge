const mongoose = require("mongoose");

const InterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  jobDescription: {
    type: String,
  },
  resumeText: {
    type: String,
  },
  transcript: [
    {
      sender: { type: String, enum: ["ai", "user", "system"] },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  scores: [
    {
      question: String,
      answer: String,
      score: Number,
      feedback: String,
    },
  ],
  averageScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
});

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
