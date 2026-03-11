require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const snippetRoutes = require('./routes/snippet.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];

app.use(cors({ 
    origin: allowedOrigins,
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;