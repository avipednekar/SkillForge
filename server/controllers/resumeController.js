const fs = require("fs");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const User = require("../models/User");

// @desc    Upload resume and extract text
// @route   POST api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    let text = "";
    const filePath = req.file.path;

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      // Cleanup
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "Invalid file format. Only PDF and Docx allowed." });
    }

    // Cleanup uploaded file after extraction (or keep it if you want to store it)
    fs.unlinkSync(filePath);

    // Save extracted text to user profile (temporary storage before parsing)
    // In a real app, you might parse it immediately or put it in a queue
    // For now, let's just return the text so the frontend can display it or send it for parsing

    res.json({
      text,
      message: "Resume uploaded and text extracted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error processing file");
  }
};

exports.parseResume = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  try {
    const embeddingsService = require("../services/embeddingsService");

    // TODO: Integrate with OpenAI/Gemini here to parse the text
    // For now, return a mock parsed object
    const mockParsedData = {
      skills: ["JavaScript", "React", "Node.js"],
      experience: [
        {
          role: "Software Engineer",
          company: "Tech Corp",
          duration: "2020 - Present",
        },
      ],
      education: [
        {
          degree: "B.S. Computer Science",
          school: "University of Tech",
          year: "2020",
        },
      ],
    };

    // Generate and store embeddings for the resume
    const embeddingResult = await embeddingsService.storeResumeEmbeddings(
      req.user.id,
      text,
      mockParsedData
    );

    console.log("Embeddings stored:", embeddingResult);

    res.json({
      ...mockParsedData,
      embeddingsStored: embeddingResult.success,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error parsing resume");
  }
};
