require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const snippetRoutes = require('./routes/snippet.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.FRONTEND_URLS,
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({ 
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/snippets', snippetRoutes);
app.use('/ai', aiRoutes);
app.use('/health', require('./routes/health.routes'));  

module.exports = app;