const fs = require("fs");
const {PDFParse} = require("pdf-parse"); 
const mammoth = require("mammoth");
const { GoogleGenAI } = require("@google/genai");
const embeddingsService = require("../services/embeddingsService");

// Initialize Gemini
let genAI;


try {
  if (process.env.GEMINI_API_KEY) {
    // FIX: Updated to new SDK object syntax { apiKey: ... }
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
      const dataBuffer = fs.readFileSync(filePath);
      console.log(filePath)
      const parser = new PDFParse({url:filePath});
      const data = await parser.getText();
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
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error("Error deleting temp file:", cleanupErr);
    }
  }
};

exports.parseResume = async (req, res) => {
  const { text } = req.body;
  // console.log("text: ",text)

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
        You are an expert Resume Parser. Extract the following information from the resume text below and return it in strict JSON format.
        
        Resume Text: "${text.substring(0, 3000)}"
        
        Output Format (JSON):
        {
          "skills": ["Skill1", "Skill2", ...],
          "experience": [
            { "role": "Job Title", "company": "Company Name", "duration": "Dates" }
          ],
          "education": [
            { "degree": "Degree Name", "school": "School Name", "year": "Year" }
          ]
        }
        
        Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
      `;

      try {
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        // Safe extraction for new SDK
        const responseText = result.text;
        
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

    // Store embeddings for RAG
    // Ensure req.user exists (middleware)
    const userId = req.user ? req.user.id : "anonymous";
    const embeddingResult = await embeddingsService.storeResumeEmbeddings(
      userId,
      text,
      parsedData
    );

    res.json({
      ...parsedData,
      embeddingsStored: embeddingResult.success,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error parsing resume");
  }
};