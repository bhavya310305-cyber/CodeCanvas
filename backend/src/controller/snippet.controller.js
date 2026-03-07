const Snippet = require('../models/snippet.model');

const getSnippets = async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json(snippets);
    } catch (error) {
        console.error('Error fetching snippets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createSnippet = async (req, res) => {
    try {
        const { title, language, code } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!language) {
            return res.status(400).json({ message: 'Language is required' });
        }

        const snippet = new Snippet({
            userId: req.user.id,
            title: title.trim(),
            language,
            code: code ?? '',
        });

        await snippet.save();
        res.status(201).json(snippet);
    } catch (error) {
        console.error('Error creating snippet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSnippet = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, language, code } = req.body;

        const snippet = await Snippet.findOne({ _id: id, userId: req.user.id });
        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found' });
        }

        if (title !== undefined) snippet.title = title.trim();
        if (language !== undefined) snippet.language = language;
        if (code !== undefined) snippet.code = code;

        await snippet.save();
        res.status(200).json(snippet);
    } catch (error) {
        console.error('Error updating snippet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSnippet = async (req, res) => {
    try {
        const { id } = req.params;

        const snippet = await Snippet.findOne({ _id: id, userId: req.user.id });
        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found' });
        }

        await snippet.deleteOne();
        res.status(200).json({ message: 'Snippet deleted successfully' });
    } catch (error) {
        console.error('Error deleting snippet:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSnippets, createSnippet, updateSnippet, deleteSnippet };
