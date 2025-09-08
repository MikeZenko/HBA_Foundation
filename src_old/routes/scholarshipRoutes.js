const express = require('express');
const scholarshipController = require('../controllers/scholarshipController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/scholarships
 * @desc Get all scholarships
 * @access Public
 */
router.get('/', scholarshipController.getAllScholarships);

/**
 * @route GET /api/scholarships/search
 * @desc Search scholarships
 * @access Public
 */
router.get('/search', scholarshipController.searchScholarships);

/**
 * @route GET /api/scholarships/filter
 * @desc Filter scholarships
 * @access Public
 */
router.get('/filter', scholarshipController.filterScholarships);

/**
 * @route GET /api/scholarships/:id
 * @desc Get scholarship by ID
 * @access Public
 */
router.get('/:id', scholarshipController.getScholarshipById);

/**
 * @route POST /api/scholarships
 * @desc Create a new scholarship
 * @access Private (Admin, Editor)
 */
router.post('/', auth, authorize(['admin', 'editor']), scholarshipController.createScholarship);

/**
 * @route PUT /api/scholarships/:id
 * @desc Update a scholarship
 * @access Private (Admin, Editor)
 */
router.put('/:id', auth, authorize(['admin', 'editor']), scholarshipController.updateScholarship);

/**
 * @route DELETE /api/scholarships/:id
 * @desc Delete a scholarship
 * @access Private (Admin)
 */
router.delete('/:id', auth, authorize(['admin']), scholarshipController.deleteScholarship);

module.exports = router; 