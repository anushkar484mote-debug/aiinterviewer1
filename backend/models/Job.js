const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 15,
        message: 'A job must have between 1 and 15 questions',
      },
      default: [],
    },
    evaluationCriteria: {
      communication: { type: Boolean, default: true },
      technical:     { type: Boolean, default: true },
      confidence:    { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookups by HR user
jobSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
