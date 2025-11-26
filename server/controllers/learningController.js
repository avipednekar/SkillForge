const LearningPath = require("../models/LearningPath");
const User = require("../models/User");

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userSkills = user.profile.skills || [];

  
    const mockPaths = [
      {
        skill: "React",
        resources: [
          {
            title: "Advanced React Patterns",
            type: "article",
            url: "https://reactjs.org/docs/advanced-performance.html",
            difficulty: "advanced",
          },
          {
            title: "Redux Toolkit Fundamentals",
            type: "video",
            url: "https://redux-toolkit.js.org/",
            difficulty: "intermediate",
          },
        ],
        relatedSkills: ["Redux", "TypeScript", "Next.js"],
      },
      {
        skill: "Node.js",
        resources: [
          {
            title: "Node.js Design Patterns",
            type: "book",
            url: "#",
            difficulty: "advanced",
          },
          {
            title: "Microservices with Node.js",
            type: "course",
            url: "#",
            difficulty: "intermediate",
          },
        ],
        relatedSkills: ["MongoDB", "Docker", "Kubernetes"],
      },
    ];

    let recommendations = [];

    // Check for each user skill
    for (const skill of userSkills) {
      // Find matching mock path
      const path = mockPaths.find(
        (p) => p.skill.toLowerCase() === skill.toLowerCase()
      );
      if (path) {
        recommendations.push({
          reason: `Because you know ${path.skill}`,
          resources: path.resources,
          nextSteps: path.relatedSkills.filter((s) => !userSkills.includes(s)),
        });
      }
    }

    // Default recommendation if no skills match or empty
    if (recommendations.length === 0) {
      recommendations.push({
        reason: "Recommended for Full Stack Developers",
        resources: [
          {
            title: "Full Stack Open 2024",
            type: "course",
            url: "https://fullstackopen.com/",
            difficulty: "beginner",
          },
        ],
        nextSteps: ["React", "Node.js", "SQL"],
      });
    }

    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error fetching recommendations");
  }
};