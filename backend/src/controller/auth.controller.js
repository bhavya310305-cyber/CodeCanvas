const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hash = await bcrypt.hash(password, 10);
        
        const newUser = new userModel({
            fullName: name,
            email,
            password: hash 
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true }); 
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        if (!user.password) {
            return res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'User logged in successfully' });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // fetch user info from Google using the access_token
        const googleRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${credential}` } }
        );

        if (!googleRes.ok) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const payload = await googleRes.json();
        const { sub: googleId, email, name } = payload;

        // check if user already exists
        let user = await userModel.findOne({ email });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.cookie('token', token, { httpOnly: true });
            return res.status(200).json({
                message: 'Logged in with Google',
                user: { _id: user._id, fullName: user.fullName, email: user.email }
            });
        }

        // new user — create account
        const newUser = new userModel({
            fullName: name,
            email,
            googleId,
            password: null,
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        res.status(201).json({
            message: 'Account created with Google',
            user: { _id: newUser._id, fullName: newUser.fullName, email: newUser.email }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

module.exports = { registerUser, loginUser, googleAuth };