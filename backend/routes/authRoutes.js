// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../Middleware/authMiddleware');
const Admin = require('../models/Admin');

// --- ADD THE LOGIN ROUTE HERE ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if admin exists (check by username OR email)
        const admin = await Admin.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // 3. Create JWT Token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Send response back to frontend
        res.json({
            token,
            username: admin.username,
            email: admin.email,
            role: admin.role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verification Route (Keep this for the admin panel protection)
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