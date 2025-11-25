const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenAI } = require("@google/genai");

// Initialize clients
let pinecone, genAI;

try {
  if (process.env.PINECONE_API_KEY) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    // New SDK initialization: Pass configuration object
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (err) {
  console.log("Vector DB / Gemini AI not configured, using mock embeddings");
}

/**
 * Generate embeddings for resume text
 * @param {string} text - Resume text to embed
 * @returns {Array<number>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    if (!genAI) {
      return Array(768)
        .fill(0)
        .map(() => Math.random());
    }

    const result = await genAI.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });

    return result.embeddings[0].values;
  } catch (err) {
    console.error("Error generating embedding:", err.message);
    // Return mock embedding on error
    return Array(768)
      .fill(0)
      .map(() => Math.random());
  }
};

/**
 * Store resume embeddings in Vector DB
 * @param {string} userId - User ID
 * @param {string} resumeText - Full resume text
 * @param {Object} parsedData - Parsed resume data
 */
const storeResumeEmbeddings = async (userId, resumeText, parsedData) => {
  try {
    // Generate embeddings for different sections
    const sections = [
      {
        id: `${userId}_full`,
        text: resumeText,
        metadata: { type: "full_resume", userId },
      },
      {
        id: `${userId}_skills`,
        text: parsedData.skills?.join(", ") || "",
        metadata: { type: "skills", userId },
      },
      {
        id: `${userId}_experience`,
        text: parsedData.experience?.join(" ") || "",
        metadata: { type: "experience", userId },
      },
    ];

    if (!pinecone) {
      console.log("Mock: Storing embeddings for user", userId);
      return { success: true, mock: true };
    }

    const index = pinecone.index(process.env.PINECONE_INDEX || "skillforge");

    // Generate and upsert embeddings
    const vectors = await Promise.all(
      sections.map(async (section) => {
        const embedding = await generateEmbedding(section.text);
        return {
          id: section.id,
          values: embedding,
          metadata: section.metadata,
        };
      })
    );

    await index.upsert(vectors);

    return { success: true, vectorsStored: vectors.length };
  } catch (err) {
    console.error("Error storing embeddings:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Search similar resumes/content in Vector DB
 * @param {string} queryText - Query text
 * @param {number} topK - Number of results to return
 */
const searchSimilarContent = async (queryText, topK = 5) => {
  try {
    if (!pinecone) {
      return {
        mock: true,
        results: [
          { id: "mock_1", score: 0.95, metadata: { type: "full_resume" } },
          { id: "mock_2", score: 0.87, metadata: { type: "skills" } },
        ],
      };
    }

    const queryEmbedding = await generateEmbedding(queryText);
    const index = pinecone.index(process.env.PINECONE_INDEX || "skillforge");

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return { success: true, results: results.matches };
  } catch (err) {
    console.error("Error searching embeddings:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  generateEmbedding,
  storeResumeEmbeddings,
  searchSimilarContent,
};