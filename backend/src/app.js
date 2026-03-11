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

app.use('/auth', authRoutes);
app.use('/snippets', snippetRoutes);
app.use('/ai', aiRoutes);
app.use('/health', require('./routes/health.routes'));  
module.exports = app;