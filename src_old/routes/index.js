const express = require('express');
const scholarshipRoutes = require('./scholarshipRoutes');
const contributionRoutes = require('./contributionRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// API routes
router.use('/api/scholarships', scholarshipRoutes);
router.use('/api/contributions', contributionRoutes);
router.use('/api/auth', authRoutes);

// API documentation route
router.get('/api', (req, res) => {
  res.json({
    message: 'HBA Foundation API',
    version: '1.0.0',
    endpoints: {
      scholarships: '/api/scholarships',
      contributions: '/api/contributions',
      auth: '/api/auth',
    },
  });
});

module.exports = router; 