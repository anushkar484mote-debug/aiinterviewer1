const express = require('express');
const router  = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  generateQuestions,
  generateFollowUp,
  evaluateInterview,
} = require('../controllers/aiController');

router.use(protect);

// HR: generate questions for a job role
router.post('/generate-questions', requireRole('hr'), generateQuestions);

// Candidate: get a follow-up question mid-interview
router.post('/follow-up', requireRole('candidate'), generateFollowUp);

// Candidate: batch evaluate all answers at the end
router.post('/evaluate', requireRole('candidate'), evaluateInterview);

module.exports = router;
