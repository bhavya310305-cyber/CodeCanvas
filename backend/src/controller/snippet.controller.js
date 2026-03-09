const Snippet = require('../models/snippet.model');
const SnippetVersion = require('../models/snippetVersion.model');

const MAX_VERSIONS = 10;

const getSnippets = async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(snippets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createSnippet = async (req, res) => {
    try {
        const { title, code, language, tags } = req.body;
        const snippet = await Snippet.create({
            title,
            code: code || '',
            language: language || 'javascript',
            tags: tags || [],
            userId: req.user.id,
        });
        res.status(201).json(snippet);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSnippet = async (req, res) => {
    try {
        const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

        // Save version if code is changing
        if (req.body.code !== undefined && req.body.code !== snippet.code) {
            await SnippetVersion.create({
                snippetId: snippet._id,
                code: snippet.code,
            });

            // Keep only last MAX_VERSIONS versions
            const versions = await SnippetVersion.find({ snippetId: snippet._id }).sort({ createdAt: -1 });
            if (versions.length > MAX_VERSIONS) {
                const toDelete = versions.slice(MAX_VERSIONS).map(v => v._id);
                await SnippetVersion.deleteMany({ _id: { $in: toDelete } });
            }
        }

        const { title, code, language, tags } = req.body;
        if (title !== undefined) snippet.title = title;
        if (code !== undefined) snippet.code = code;
        if (language !== undefined) snippet.language = language;
        if (tags !== undefined) snippet.tags = tags;

        await snippet.save();
        res.json(snippet);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSnippet = async (req, res) => {
    try {
        const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

        // Clean up all versions for this snippet
        await SnippetVersion.deleteMany({ snippetId: req.params.id });

        res.json({ message: 'Snippet deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getVersions = async (req, res) => {
    try {
        const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

        const versions = await SnippetVersion.find({ snippetId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(MAX_VERSIONS);

        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const restoreVersion = async (req, res) => {
    try {
        const snippet = await Snippet.findOne({ _id: req.params.id, userId: req.user.id });
        if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

        const version = await SnippetVersion.findById(req.params.versionId);
        if (!version) return res.status(404).json({ message: 'Version not found' });

        // Save current code as a version before restoring
        await SnippetVersion.create({
            snippetId: snippet._id,
            code: snippet.code,
        });

        snippet.code = version.code;
        await snippet.save();

        // Trim versions again
        const versions = await SnippetVersion.find({ snippetId: snippet._id }).sort({ createdAt: -1 });
        if (versions.length > MAX_VERSIONS) {
            const toDelete = versions.slice(MAX_VERSIONS).map(v => v._id);
            await SnippetVersion.deleteMany({ _id: { $in: toDelete } });
        }

        res.json(snippet);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSnippets, createSnippet, updateSnippet, deleteSnippet, getVersions, restoreVersion };