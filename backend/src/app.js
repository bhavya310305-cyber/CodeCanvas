require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const snippetRoutes = require('./routes/snippet.routes');

const app = express();

app.use(cors({ 
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);

module.exports = app;