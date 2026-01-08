// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware'); // Your existing middleware
const Admin = require('../models/Admin'); // Your Admin model

// Verification Route
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        // authMiddleware should have attached the user ID to req.user
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