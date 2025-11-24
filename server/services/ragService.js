// Enhanced RAG Service with Vector DB Integration
// Implements: User Question → Retrieve top K docs → Construct prompt → LLM generates response

const embeddingsService = require("./embeddingsService");
const { OpenAI } = require("openai");

let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (err) {
  console.log("OpenAI not configured, using mock RAG");
}

/**
 * Generate interview questions based on resume context
 * Uses RAG: Retrieve resume chunks from Vector DB → Construct prompt → LLM generates questions
 */
const generateInterviewQuestions = async (resumeText, jobDescription) => {
  try {
    // Step 1: Retrieve relevant context from Vector DB
    const context = await embeddingsService.searchSimilarContent(
      `Generate interview questions for: ${
        jobDescription || "software engineer"
      }`,
      3
    );

    if (!openai) {
      // Mock logic with keyword matching
      const questions = [
        "Tell me about yourself and your experience with the technologies listed in your resume.",
        "I see you have experience with React. Can you explain the Virtual DOM and how it works?",
        "Describe a challenging project you worked on and how you overcame the obstacles.",
        "How do you handle state management in large applications?",
        "What is your approach to testing and ensuring code quality?",
      ];

      if (resumeText.toLowerCase().includes("node.js")) {
        questions.push("Can you explain the event loop in Node.js?");
      }
      if (resumeText.toLowerCase().includes("mongodb")) {
        questions.push(
          "What are the advantages of using a NoSQL database like MongoDB over a SQL database?"
        );
      }

      return questions.slice(0, 10); // Return max 10 questions
    }

    // Step 2: Construct prompt with context
    const prompt = `You are an expert technical interviewer. Based on the following resume and context, generate 10 relevant interview questions.

Resume Context:
${resumeText.substring(0, 1000)}

Job Description: ${jobDescription || "General Software Engineer"}

Retrieved Context:
${JSON.stringify(context.results?.map((r) => r.metadata) || [])}

Generate 10 technical interview questions that are:
1. Specific to the candidate's experience
2. Progressive in difficulty
3. Cover technical, behavioral, and problem-solving aspects

Return ONLY a JSON array of question strings, no other text.`;

    // Step 3: LLM generates response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const questions = JSON.parse(response.choices[0].message.content);
    return questions.slice(0, 10);
  } catch (err) {
    console.error("Error in RAG pipeline:", err.message);
    // Fallback to mock questions
    return [
      "Tell me about your background and experience.",
      "Describe a challenging technical problem you solved.",
      "How do you stay current with new technologies?",
      "Explain your approach to code quality and testing.",
      "Describe your experience with teamwork and collaboration.",
    ];
  }
};

/**
 * Evaluate candidate answer using LLM
 * Provides scoring and detailed feedback
 */
const evaluateAnswer = async (question, answer) => {
  try {
    if (!openai) {
      // Mock evaluation
      const score = Math.floor(Math.random() * 30) + 70;
      return {
        score,
        feedback:
          "Good answer, but you could elaborate more on specific examples.",
      };
    }

    const prompt = `You are an expert technical interviewer evaluating candidate answers.

Question: ${question}
Candidate Answer: ${answer}

Evaluate this answer on a scale of 0-100 and provide constructive feedback. Consider:
1. Accuracy and technical correctness
2. Depth of explanation
3. Real-world applicability
4. Communication clarity

Return a JSON object with:
{
  "score": <number 0-100>,
  "feedback": "<detailed constructive feedback>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Error evaluating answer:", err.message);
    return {
      score: 75,
      feedback: "Unable to evaluate at this time. Please try again.",
    };
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
};
