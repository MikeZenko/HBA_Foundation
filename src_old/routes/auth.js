const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { AppError } = require('../middleware/error');

// Login route
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            throw new AppError('Please provide username and password', 400);
        }

        // Check credentials
        if (username !== config.adminCredentials.username) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, config.adminCredentials.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            { username, isAdmin: true },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: { username, isAdmin: true }
        });
    } catch (error) {
        next(error);
    }
});

// Verify token route
router.get('/verify', (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new AppError('No token provided', 401);
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 