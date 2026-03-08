const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/user.model');
const authController = require('../controller/auth.controller');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/google', authController.googleAuth);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-name', protect, authController.updateName);
router.put('/change-password', protect, authController.changePassword);
router.delete('/delete-account', protect, authController.deleteAccount);

module.exports = router;