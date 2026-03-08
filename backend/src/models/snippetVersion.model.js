const mongoose = require('mongoose');

const snippetVersionSchema = new mongoose.Schema({
    snippetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Snippet',
        required: true,
    },
    code: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const SnippetVersion = mongoose.model('SnippetVersion', snippetVersionSchema);

module.exports = SnippetVersion;