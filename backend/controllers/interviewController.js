const Interview = require('../models/Interview');
const Job       = require('../models/Job');

// ── POST /api/interviews/start ─────────────────────────────────────────────────
// Creates (or retrieves) an interview session for a candidate
exports.startInterview = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId is required.' });

    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) return res.status(404).json({ error: 'Job not found or no longer active.' });

    // Return existing incomplete interview, or create fresh one
    let interview = await Interview.findOne({
      jobId,
      candidateId: req.user._id,
    });

    if (interview && interview.completedAt) {
      return res.status(409).json({ error: 'You have already completed this interview.' });
    }

    if (!interview) {
      interview = await Interview.create({ jobId, candidateId: req.user._id });
    }

    res.status(201).json({ interview, questions: job.questions });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/interviews/answer ────────────────────────────────────────────────
// Save one answer (and optional follow-up answer) to an in-progress interview
exports.saveAnswer = async (req, res, next) => {
  try {
    const { interviewId, question, answer, followUp, followUpAnswer } = req.body;

    if (!interviewId || !question || answer === undefined) {
      return res.status(400).json({ error: 'interviewId, question, and answer are required.' });
    }

    const interview = await Interview.findOne({
      _id:         interviewId,
      candidateId: req.user._id,
    });

    if (!interview)       return res.status(404).json({ error: 'Interview not found.' });
    if (interview.completedAt) return res.status(409).json({ error: 'Interview already submitted.' });

    // Upsert the answer for this question
    const idx = interview.answers.findIndex((a) => a.question === question);
    const answerObj = { question, answer, followUp: followUp || null, followUpAnswer: followUpAnswer || null };

    if (idx >= 0) {
      interview.answers[idx] = answerObj;
    } else {
      interview.answers.push(answerObj);
    }

    await interview.save();
    res.json({ interview });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/interviews/submit ────────────────────────────────────────────────
// Finalise interview with AI evaluation data
exports.submitInterview = async (req, res, next) => {
  try {
    const { interviewId, answers, scores, feedback, strengths, weaknesses, recommendation } = req.body;

    if (!interviewId) return res.status(400).json({ error: 'interviewId is required.' });

    const interview = await Interview.findOne({ _id: interviewId, candidateId: req.user._id });
    if (!interview)       return res.status(404).json({ error: 'Interview not found.' });
    if (interview.completedAt) return res.status(409).json({ error: 'Interview already submitted.' });

    if (answers)        interview.answers        = answers;
    if (scores)         interview.scores         = scores;
    if (feedback)       interview.feedback       = feedback;
    if (strengths)      interview.strengths      = strengths;
    if (weaknesses)     interview.weaknesses     = weaknesses;
    if (recommendation) interview.recommendation = recommendation;

    interview.completedAt = new Date();
    await interview.save();

    res.json({ interview });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/interviews/:id ────────────────────────────────────────────────────
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId', 'name email')
      .populate('jobId',       'title description');

    if (!interview) return res.status(404).json({ error: 'Interview not found.' });

    // HR can view any interview; candidates can only view their own
    const isOwner = interview.candidateId._id.toString() === req.user._id.toString();
    const isHR    = req.user.role === 'hr';

    if (!isOwner && !isHR) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ interview });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/interviews/job/:jobId ─────────────────────────────────────────────
// HR only: list all interviews for a job
exports.getInterviewsByJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found or access denied.' });

    const interviews = await Interview.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email')
      .sort({ completedAt: -1, createdAt: -1 });

    res.json({ interviews });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/interviews/my ─────────────────────────────────────────────────────
// Candidate: list own interviews
exports.getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ candidateId: req.user._id })
      .populate('jobId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ interviews });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/interviews/:id/status ──────────────────────────────────────────
// HR only: shortlist or reject a candidate
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['shortlisted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending, shortlisted, or rejected.' });
    }

    // Verify the interview belongs to a job owned by this HR user
    const interview = await Interview.findById(req.params.id).populate('jobId');
    if (!interview) return res.status(404).json({ error: 'Interview not found.' });
    if (interview.jobId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    interview.status = status;
    await interview.save();

    res.json({ interview });
  } catch (err) {
    next(err);
  }
};
