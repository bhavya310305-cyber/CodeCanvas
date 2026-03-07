const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const snippetController = require('../controller/snippet.controller');

const router = express.Router();

router.get('/', protect, snippetController.getSnippets);
router.post('/', protect, snippetController.createSnippet);
router.put('/:id', protect, snippetController.updateSnippet);
router.delete('/:id', protect, snippetController.deleteSnippet);

module.exports = router;