const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  startVoiceInterview,
  processVoiceAnswer,
  endVoiceInterview
} = require('../controllers/voiceController');

router.use(protect);

router.post('/start', startVoiceInterview);
router.post('/next',  processVoiceAnswer);
router.post('/end',   endVoiceInterview);

module.exports = router;
