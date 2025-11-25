const embeddingsService = require("./embeddingsService");
const { GoogleGenAI } = require("@google/genai");

let genAI;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  }
} catch (err) {
  console.log("Gemini AI not configured, using mock RAG");
}

const generateInterviewQuestions = async (resumeText, jobDescription) => {
  try {
    const context = await embeddingsService.searchSimilarContent(
      `Generate interview questions for: ${
        jobDescription || "software engineer"
      }`,
      3
    );

    // if (!model) {
    //   // Mock logic with keyword matching
    //   const questions = [
    //     "Tell me about yourself and your experience with the technologies listed in your resume.",
    //     "I see you have experience with React. Can you explain the Virtual DOM and how it works?",
    //     "Describe a challenging project you worked on and how you overcame the obstacles.",
    //     "How do you handle state management in large applications?",
    //     "What is your approach to testing and ensuring code quality?",
    //   ];

    //   if (resumeText.toLowerCase().includes("node.js")) {
    //     questions.push("Can you explain the event loop in Node.js?");
    //   }
    //   if (resumeText.toLowerCase().includes("mongodb")) {
    //     questions.push(
    //       "What are the advantages of using a NoSQL database like MongoDB over a SQL database?"
    //     );
    //   }

    //   return questions.slice(0, 10); // Return max 10 questions
    // }

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
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = result.text;

    // Clean up markdown code blocks if present
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText).slice(0, 10);
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


const evaluateAnswer = async (question, answer) => {
  try {
    // if (!model) {
    //   // Mock evaluation
    //   const score = Math.floor(Math.random() * 30) + 70;
    //   return {
    //     score,
    //     feedback:
    //       "Good answer, but you could elaborate more on specific examples.",
    //   };
    // }

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

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = result.text;

    // Clean up markdown code blocks if present
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.log("JSON parse failed, attempting regex extraction:", cleanText);
      // Attempt to extract JSON object using regex
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }
  } catch (err) {
    console.error("Error evaluating answer:", err.message);
    return {
      score: 75,
      feedback:
        "Unable to evaluate at this time. Please try again. (Error: " +
        err.message +
        ")",
    };
  }
};


const generateNextQuestion = async (currentQuestion, answer, context = "") => {
  try {
    // if (!model) {
    //   return "Can you elaborate more on that point?";
    // }

    const prompt = `You are an expert technical interviewer.
    
Previous Question: ${currentQuestion}
Candidate Answer: ${answer}
Context: ${context}

Generate a single, relevant follow-up interview question that digs deeper into the candidate's knowledge or transitions to a related topic.
Return ONLY the question string.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (err) {
    console.error("Error generating next question:", err.message);
    return "What other related technologies have you worked with?";
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateNextQuestion,
};
