const mongoose = require("mongoose");
const LearningPath = require("./models/LearningPath");
require("dotenv").config();

const connectDB = require("./config/db");

const seedLearningPaths = async () => {
  try {
    await connectDB();

    await LearningPath.deleteMany();

    const learningPaths = [
      {
        skill: "Full Stack Web Development",
        description: "Master the MERN stack and build modern web applications.",
        category: "Web Development",
        difficulty: "Intermediate",
        modules: [
          {
            title: "Frontend Fundamentals",
            resources: [
              {
                title: "React Documentation",
                type: "Article",
                url: "https://react.dev",
              },
              {
                title: "Modern JavaScript Course",
                type: "Course",
                url: "https://example.com/js-course",
              },
            ],
          },
          {
            title: "Backend Mastery",
            resources: [
              {
                title: "Node.js Crash Course",
                type: "Video",
                url: "https://youtube.com/example",
              },
              {
                title: "MongoDB Basics",
                type: "Article",
                url: "https://mongodb.com/basics",
              },
            ],
          },
        ],
      },
      {
        skill: "Data Science with Python",
        description:
          "Learn data analysis, visualization, and machine learning.",
        category: "Data Science",
        difficulty: "Beginner",
        modules: [
          {
            title: "Python Basics",
            resources: [
              {
                title: "Python for Beginners",
                type: "Course",
                url: "https://example.com/python",
              },
            ],
          },
          {
            title: "Data Analysis",
            resources: [
              {
                title: "Pandas Tutorial",
                type: "Article",
                url: "https://pandas.pydata.org",
              },
            ],
          },
        ],
      },
    ];

    await LearningPath.insertMany(learningPaths);

    console.log("Learning Paths Seeded Successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLearningPaths();
