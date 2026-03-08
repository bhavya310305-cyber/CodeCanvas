const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const snippetController = require('../controller/snippet.controller');

const router = express.Router();

router.get('/', protect, snippetController.getSnippets);
router.post('/', protect, snippetController.createSnippet);
router.put('/:id', protect, snippetController.updateSnippet);
router.delete('/:id', protect, snippetController.deleteSnippet);

router.get('/:id/versions', protect, snippetController.getVersions);
router.post('/:id/restore/:versionId', protect, snippetController.restoreVersion);

module.exports = router;