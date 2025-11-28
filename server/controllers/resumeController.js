const fs = require("fs");
const fsPromises = require("fs").promises;
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenAI } = require("@google/genai");
const embeddingsService = require("../services/embeddingsService");
const { url } = require("inspector");

// Initialize Gemini
let genAI;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.error("Failed to initialize Gemini in resumeController:", err);
}

exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    let text = "";
    console.log("Processing file:", filePath, "Mime:", req.file.mimetype);

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = await fsPromises.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();

      // Log PDF metadata for debugging
      console.log("PDF Info:", await parser.getInfo());

      text = data.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      console.log("Invalid mimetype:", req.file.mimetype);
      // File cleanup will happen in finally block
      return res
        .status(400)
        .json({ message: "Invalid file format. Only PDF and Docx allowed." });
    }

    res.json({
      text: text.trim(),
      message: "Resume uploaded and text extracted successfully",
    });
  } catch (err) {
    console.error("Error in uploadResume:", err);
    res.status(500).send("Server error processing file: " + err.message);
  } finally {
    // FIX: Ensure file is deleted even if error occurs
    try {
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
      }
    } catch (cleanupErr) {
      console.error("Error deleting temp file:", cleanupErr);
    }
  }
};

exports.parseResume = async (req, res) => {
  let { text } = req.body;

  // Handle file upload if present
  if (req.file) {
    const filePath = req.file.path;
    try {
      console.log(
        "Processing file in parseResume:",
        filePath,
        "Mime:",
        req.file.mimetype
      );

      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = await fsPromises.readFile(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();

        // console.log("PDF Info:", await parser.getInfo());

        text = data.text;
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else {
        if (fs.existsSync(filePath)) await fsPromises.unlink(filePath);
        return res
          .status(400)
          .json({ message: "Invalid file format. Only PDF and Docx allowed." });
      }
    } catch (err) {
      console.error("Error extracting text in parseResume:", err);
      if (fs.existsSync(filePath)) await fsPromises.unlink(filePath);
      return res.status(500).json({ message: "Error reading file" });
    } finally {
      // Cleanup temp file
      if (fs.existsSync(filePath)) {
        try {
          await fsPromises.unlink(filePath);
        } catch (e) {
          console.error("Error deleting temp file:", e);
        }
      }
    }
  }

  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  try {
    let parsedData = {
      skills: [],
      experience: [],
      education: [],
    };

    // Use Gemini to parse if available
    if (genAI) {
      const prompt = `
        You are an expert Resume Parser. Extract information from the text below into strict JSON.
        
        CRITICAL INSTRUCTIONS:
        1. Fix any OCR issues (e.g., "Python\\n\\nMongoDB" should be two separate skills).
        2. Analyze the resume and provide 3-5 specific suggestions for improvement.
        
        Resume Text: "${text.substring(0, 8000)}" 
        
        Output Format (JSON):
        {
          "skills": ["Skill1", "Skill2", ...],
          "experience": [
            { "role": "Job Title", "company": "Company Name", "duration": "Dates" }
          ],
          "education": [
            { "degree": "Degree Name", "school": "School Name", "year": "Year" }
          ],
          "projects": [
            { "name": "Project Name", "description": "Brief description", "techStack": "Tools used" }
          ],
          "suggestions": [
            "Suggestion 1 (e.g., Add more metrics to experience)",
            "Suggestion 2 (e.g., Move skills section higher)",
            "Suggestion 3"
          ]
        }
        
        Return ONLY the JSON string.
      `;

      try {
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const responseText = result.response
          ? result.response.text()
          : result.text;
        const cleanJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        parsedData = JSON.parse(cleanJson);
      } catch (aiError) {
        console.error(
          "AI Parsing failed, falling back to simple extraction:",
          aiError.message
        );
      }
    } else {
      console.log("Gemini API Key missing, returning empty structure");
    }

    const userId = req.user ? req.user.id : "anonymous";
    const embeddingResult = await embeddingsService.storeResumeEmbeddings(
      userId,
      text,
      parsedData
    );

    res.json({
      ...parsedData,
      embeddingResult,
      skills: parsedData.skills || [],
      suggestions: parsedData.suggestions || ["Could not analyze suggestions."],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error parsing resume");
  }
};
