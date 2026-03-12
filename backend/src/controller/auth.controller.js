const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hash = await bcrypt.hash(password, 10);
        const newUser = new userModel({ fullName: name, email, password: hash });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
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
        if (!user) return res.status(400).json({ message: 'No account found with this email. Please sign up first.' });

        if (!user.password) {
            return res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });

        res.status(200).json({
            message: 'User logged in successfully',
            user: { _id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ message: 'Google credential is required' });

        const googleRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${credential}` } }
        );
        if (!googleRes.ok) return res.status(400).json({ message: 'Invalid Google token' });

        const payload = await googleRes.json();
        const { sub: googleId, email, name } = payload;

        let user = await userModel.findOne({ email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
            return res.status(200).json({
                message: 'Logged in with Google',
                user: { _id: user._id, fullName: user.fullName, email: user.email }
            });
        }

        const newUser = new userModel({ fullName: name, email, googleId, password: null });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true });
        res.status(201).json({
            message: 'Account created with Google',
            user: { _id: newUser._id, fullName: newUser.fullName, email: newUser.email }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

const logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
            sameSite: 'none',
            secure: true,
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateName = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Name cannot be empty' });

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { fullName: name.trim() },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            message: 'Name updated successfully',
            user: { _id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        console.error('Error updating name:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.password) {
            return res.status(400).json({ message: 'Google accounts cannot change password here' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await userModel.findOne({ email });

        if (!user || !user.password) {
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetUrl);
        } catch (emailErr) {
            console.error('Email send error:', emailErr);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

        res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, googleAuth, logout, updateName, changePassword, deleteAccount, forgotPassword, resetPassword };