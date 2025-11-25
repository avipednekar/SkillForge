const ragService = require("../services/ragService");
const InterviewSession = require("../models/InterviewSession");

exports.startInterview = async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  try {
    const questions = await ragService.generateInterviewQuestions(
      resumeText || "",
      jobDescription || ""
    );

    const session = new InterviewSession({
      user: req.user.id,
      resumeText,
      jobDescription,
      transcript: [],
    });

    await session.save();

    res.json({
      sessionId: session._id,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error starting interview");
  }
};

exports.submitAnswer = async (req, res) => {
  const { sessionId, question, answer } = req.body;

  try {
    const evaluation = await ragService.evaluateAnswer(question, answer);
    const nextQuestion = await ragService.generateNextQuestion(
      question,
      answer
    );

    const session = await InterviewSession.findById(sessionId);
    if (session) {
      session.transcript.push({ sender: "ai", message: question });
      session.transcript.push({ sender: "user", message: answer });
      session.transcript.push({
        sender: "system",
        message: `Feedback: ${evaluation.feedback} (Score: ${evaluation.score})`,
      });

      session.scores.push({
        question,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
      });

      // Recalculate average
      const totalScore = session.scores.reduce(
        (acc, curr) => acc + curr.score,
        0
      );
      session.averageScore = Math.round(totalScore / session.scores.length);

      await session.save();
    }

    res.json({ ...evaluation, nextQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error evaluating answer");
  }
};

exports.endInterview = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "completed";
    session.endTime = Date.now();
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error ending interview");
  }
};
