const Job       = require('../models/Job');
const Interview = require('../models/Interview');

// ── POST /api/jobs ─────────────────────────────────────────────────────────────
exports.createJob = async (req, res, next) => {
  try {
    const { title, description, questions, evaluationCriteria } = req.body;

    if (!title) return res.status(400).json({ error: 'Job title is required.' });

    const job = await Job.create({
      title,
      description,
      questions:           questions || [],
      evaluationCriteria:  evaluationCriteria || { communication: true, technical: true, confidence: true },
      createdBy:           req.user._id,
    });

    res.status(201).json({ job });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('. ') });
    }
    next(err);
  }
};

// ── GET /api/jobs ──────────────────────────────────────────────────────────────
// HR: sees only their own jobs. Candidates: see all active jobs.
exports.getJobs = async (req, res, next) => {
  try {
    const filter = req.user.role === 'hr'
      ? { createdBy: req.user._id }
      : { isActive: true };

    const jobs = await Job.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // For HR, attach applicant counts in one aggregation query
    if (req.user.role === 'hr') {
      const jobIds = jobs.map((j) => j._id);
      const counts = await Interview.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } },
      ]);
      const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
      const jobsWithCounts = jobs.map((j) => ({
        ...j.toObject(),
        applicantCount: countMap[j._id.toString()] || 0,
      }));
      return res.json({ jobs: jobsWithCounts });
    }

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/jobs/:id ──────────────────────────────────────────────────────────
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    // Candidates can only see active jobs
    if (req.user.role === 'candidate' && !job.isActive) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({ job });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/jobs/:id ────────────────────────────────────────────────────────
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found or access denied.' });

    const allowed = ['title', 'description', 'questions', 'evaluationCriteria', 'isActive'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) job[key] = req.body[key];
    });

    await job.save();
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/jobs/:id ───────────────────────────────────────────────────────
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found or access denied.' });
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    next(err);
  }
};
