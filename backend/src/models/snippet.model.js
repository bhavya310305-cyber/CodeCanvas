const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'typescript', 'html', 'css', 'python', 'java', 'cpp', 'json', 'markdown'],
        default: 'javascript',
    },
    code: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;