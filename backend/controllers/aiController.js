const { callClaude, parseJSON } = require('../utils/claude');
const Job = require('../models/Job');

// ── POST /api/ai/generate-questions ───────────────────────────────────────────
exports.generateQuestions = async (req, res, next) => {
  try {
    const { title, description, count = 5 } = req.body;
    if (!title) return res.status(400).json({ error: 'Job title is required.' });

    const prompt = `You are an experienced HR interviewer. Generate exactly ${count} interview questions for the role: "${title}".
${description ? `Role description: "${description}"` : ''}

Requirements:
- Start with 1-2 easy/introductory questions
- Progress to intermediate questions about experience and judgment  
- End with 1-2 challenging technical or scenario-based questions
- Questions should be open-ended and encourage detailed answers
- Tailor questions specifically to the "${title}" role

Return ONLY a valid JSON array of ${count} strings. No explanation, no markdown, no preamble.
Example format: ["Question 1?", "Question 2?", "Question 3?"]`;

    const raw = await callClaude(prompt, 'You are an expert HR interviewer. Respond with valid JSON only.');
    const questions = parseJSON(raw);

    if (!Array.isArray(questions)) throw new Error('AI did not return an array');

    // Optionally persist questions to an existing job
    if (req.body.jobId) {
      await Job.findOneAndUpdate(
        { _id: req.body.jobId, createdBy: req.user._id },
        { questions: questions.slice(0, 15) }
      );
    }

    res.json({ questions });
  } catch (err) {
    console.error('[AI] generate-questions error:', err.message);
    // Graceful fallback
    if (err.message?.includes('AI did not return')) {
      return res.status(502).json({ error: 'AI returned unexpected format. Please try again.' });
    }
    next(err);
  }
};

// ── POST /api/ai/follow-up ────────────────────────────────────────────────────
exports.generateFollowUp = async (req, res, next) => {
  try {
    const { question, answer, role } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required.' });
    }

    const prompt = `You are an HR interviewer conducting an interview for the role: "${role || 'the position'}".

The candidate was asked:
"${question}"

They answered:
"${answer}"

Generate ONE concise follow-up question (maximum 25 words) that:
- Digs deeper into their answer
- Asks for a specific example or clarification
- Is natural and conversational

Return ONLY the follow-up question text. Nothing else.`;

    const followUp = await callClaude(prompt, 'You are a professional interviewer. Reply with only the follow-up question.');
    res.json({ followUp: followUp.trim().replace(/^["']|["']$/g, '') });
  } catch (err) {
    console.error('[AI] follow-up error:', err.message);
    next(err);
  }
};

// ── POST /api/ai/evaluate ──────────────────────────────────────────────────────
exports.evaluateInterview = async (req, res, next) => {
  try {
    const { answers, role, criteria } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers array is required.' });
    }

    const answersText = answers
      .map((a, i) => {
        let block = `Q${i + 1}: ${a.question}\nAnswer: ${a.answer || '(no answer)'}`;
        if (a.followUp) {
          block += `\nFollow-up: ${a.followUp}\nAnswer: ${a.followUpAnswer || '(no answer)'}`;
        }
        return block;
      })
      .join('\n\n');

    const scoringInstructions = [
      criteria?.communication !== false && 'communication (clarity, structure, articulation)',
      criteria?.technical      !== false && 'technical (accuracy, depth, role-specific knowledge)',
      criteria?.confidence     !== false && 'confidence (assertiveness, conviction, use of concrete examples)',
    ]
      .filter(Boolean)
      .join(', ');

    const prompt = `You are a senior HR talent evaluator. Evaluate the following interview for the role: "${role || 'the position'}".

INTERVIEW TRANSCRIPT:
${answersText}

Evaluate and score the candidate on: ${scoringInstructions}.

Return ONLY valid JSON in this exact structure:
{
  "scores": {
    "communication": <integer 0-10>,
    "technical": <integer 0-10>,
    "confidence": <integer 0-10>
  },
  "feedback": "<2-3 sentences summarizing overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>"],
  "recommendation": "<hire|maybe|reject>"
}

Scoring guide: 8-10 = exceptional, 6-7 = good, 4-5 = average, 0-3 = poor.
Be honest and constructive. Base recommendation strictly on evidence in the answers.`;

    const raw = await callClaude(
      prompt,
      'You are an expert HR evaluator. Respond only with valid JSON matching the specified structure.',
      1200
    );

    const evaluation = parseJSON(raw);

    // Validate required fields
    const required = ['scores', 'feedback', 'strengths', 'weaknesses', 'recommendation'];
    for (const field of required) {
      if (!(field in evaluation)) throw new Error(`Missing field: ${field}`);
    }

    // Clamp scores to 0-10
    for (const key of Object.keys(evaluation.scores)) {
      evaluation.scores[key] = Math.min(10, Math.max(0, Math.round(evaluation.scores[key])));
    }

    res.json({ evaluation });
  } catch (err) {
    console.error('[AI] evaluate error:', err.message);
    if (err.message?.includes('Missing field') || err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI returned unexpected format. Please try again.' });
    }
    next(err);
  }
};
