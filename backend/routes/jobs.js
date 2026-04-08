const express = require('express');
const router  = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// All job routes require authentication
router.use(protect);

router.get('/',    getJobs);
router.post('/',   requireRole('hr'), createJob);

router.get('/:id',    getJob);
router.patch('/:id',  requireRole('hr'), updateJob);
router.delete('/:id', requireRole('hr'), deleteJob);

module.exports = router;
