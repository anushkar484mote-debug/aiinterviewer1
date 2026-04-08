const { callClaude, parseJSON } = require('../utils/claude');
const Interview = require('../models/Interview');
const Job = require('../models/Job');

// ── Lifecycle helper ────────────────────────────────────────────────────────
const INTERVIEW_STAGES = ['intro', 'experience', 'project', 'behavioral', 'wrap_up'];

function getSystemPrompt(role, stage, history = []) {
  const stageInstruction = {
    intro:      "Briefly introduce yourself as the AI interviewer and ask the candidate to introduce themselves.",
    experience: "Ask about their past work experience relevant to this role. Dig for specific achievements.",
    project:    "Ask them to describe a challenging technical or professional project they recently worked on.",
    behavioral: "Ask a 'tell me about a time' question to assess soft skills or situational judgment.",
    wrap_up:    "Thank them for their time and ask if they have any quick questions before finishing."
  }[stage] || "Continue the interview naturally.";

  return `You are a professional AI interviewer for the role: "${role}".
Current Interview Stage: ${stage.toUpperCase()}

Instructions:
1. ${stageInstruction}
2. Keep your response CONCISE (max 40 words) for natural speech.
3. If the candidate's last answer was brief, ask a quick follow-up.
4. Transition smoothly between stages.
5. Be supportive but professional.

Conversation history so far:
${history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n')}

Respond ONLY with the text of your next question or statement. DO NOT include any meta-talk or JSON.`;
}

// ── API: POST /api/voice/start ──────────────────────────────────────────────
exports.startVoiceInterview = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check for existing interview or clear it
    let interview = await Interview.findOne({ jobId, candidateId: req.user._id });
    if (interview) await interview.deleteOne();

    interview = await Interview.create({
      jobId,
      candidateId: req.user._id,
      status: 'pending',
    });

    const prompt = getSystemPrompt(job.title, 'intro');
    const introText = await callClaude(prompt, "You are a professional AI interviewer. Start the interview.");

    res.json({
      interviewId: interview._id,
      text:        introText.trim(),
      stage:       'intro',
      step:        0,
    });
  } catch (err) {
    next(err);
  }
};

// ── API: POST /api/voice/next ───────────────────────────────────────────────
exports.processVoiceAnswer = async (req, res, next) => {
  try {
    const { interviewId, answer } = req.body;
    const interview = await Interview.findById(interviewId).populate('jobId');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // current question is the last one, or if no answers yet, it's the "intro"
    // For simplicity, let's track state by answers.length
    const currentStep = interview.answers.length;
    const currentStage = INTERVIEW_STAGES[Math.min(currentStep, INTERVIEW_STAGES.length - 1)];

    // 1. Get the question that was just asked (either stored in DB or from request)
    const prevQuestion = req.body.question; // UI sends what the AI just said

    // 2. Save the answer
    interview.answers.push({ question: prevQuestion, answer });
    await interview.save();

    // 3. Determine next stage
    const nextStep = interview.answers.length;
    const isFinished = nextStep >= INTERVIEW_STAGES.length;
    const nextStage = INTERVIEW_STAGES[Math.min(nextStep, INTERVIEW_STAGES.length - 1)];

    if (isFinished) {
      return res.json({ finished: true, text: "Thank you for the interview. We have all the information we need. Good luck!" });
    }

    // 4. Generate next question
    const prompt = getSystemPrompt(interview.jobId.title, nextStage, interview.answers);
    const nextQuestion = await callClaude(prompt, "You are a professional AI interviewer.");

    res.json({
      text:  nextQuestion.trim(),
      stage: nextStage,
      step:  nextStep,
    });
  } catch (err) {
    next(err);
  }
};

// ── API: POST /api/voice/end ────────────────────────────────────────────────
exports.endVoiceInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId).populate('jobId');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    // AI Evaluation
    const prompt = `Evaluate this voice interview for the role: "${interview.jobId.title}".
    
Transcript:
${interview.answers.map((a, i) => `Q${i+1}: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Return ONLY valid JSON:
{
  "scores": { "communication": <0-10>, "technical": <0-10>, "confidence": <0-10> },
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendation": "hire|maybe|reject"
}
`;

    const raw = await callClaude(prompt, "You are an expert HR talent evaluator. Return ONLY valid JSON.");
    const evaluation = parseJSON(raw);

    interview.scores         = evaluation.scores;
    interview.feedback       = evaluation.feedback;
    interview.strengths      = evaluation.strengths;
    interview.weaknesses     = evaluation.weaknesses;
    interview.recommendation = evaluation.recommendation;
    interview.completedAt    = new Date();
    await interview.save();

    res.json({ evaluation });
  } catch (err) {
    next(err);
  }
};
