const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question:       { type: String, required: true },
    answer:         { type: String, default: '' },
    followUp:       { type: String, default: null },
    followUpAnswer: { type: String, default: null },
  },
  { _id: false }
);

const scoresSchema = new mongoose.Schema(
  {
    communication: { type: Number, min: 0, max: 10, default: null },
    technical:     { type: Number, min: 0, max: 10, default: null },
    confidence:    { type: Number, min: 0, max: 10, default: null },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    scores: {
      type: scoresSchema,
      default: {},
    },
    feedback: {
      type: String,
      default: null,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      enum: ['hire', 'maybe', 'reject', null],
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One interview per candidate per job
interviewSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
interviewSchema.index({ candidateId: 1 });
interviewSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
