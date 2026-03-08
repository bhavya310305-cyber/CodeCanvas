const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { askAI } = require('../controller/ai.controller');
const router = express.Router();

router.post('/ask', protect, askAI);

module.exports = router;