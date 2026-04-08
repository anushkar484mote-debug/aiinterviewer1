const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  startInterview,
  saveAnswer,
  submitInterview,
  getInterview,
  getInterviewsByJob,
  getMyInterviews,
  updateStatus,
} = require('../controllers/interviewController');

router.use(protect);

// Candidate routes
router.post('/start', requireRole('candidate'), startInterview);
router.post('/answer', requireRole('candidate'), saveAnswer);
router.post('/submit', requireRole('candidate'), submitInterview);
router.get('/my', requireRole('candidate'), getMyInterviews);

// HR routes
router.get('/job/:jobId', requireRole('hr'), getInterviewsByJob);
router.patch('/:id/status', requireRole('hr'), updateStatus);

// Shared (HR or owning candidate)
router.get('/:id', getInterview);

module.exports = router;
