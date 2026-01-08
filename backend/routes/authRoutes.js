// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../Middleware/authMiddleware'); 
const Admin = require('../models/Admin');

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find admin by username or email
        const admin = await Admin.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create Token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            username: admin.username,
            email: admin.email,
            role: admin.role
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verification Route
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(401).json({ message: 'User not found' });
        }
        res.json({ valid: true, admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;