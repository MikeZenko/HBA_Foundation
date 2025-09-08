const express = require('express');
const contributionController = require('../controllers/contributionController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/contributions
 * @desc Get all contributions
 * @access Private (Admin)
 */
router.get('/', auth, authorize(['admin']), contributionController.getAllContributions);

/**
 * @route GET /api/contributions/status/:status
 * @desc Get contributions by status
 * @access Private (Admin)
 */
router.get('/status/:status', auth, authorize(['admin']), contributionController.getContributionsByStatus);

/**
 * @route GET /api/contributions/:id
 * @desc Get contribution by ID
 * @access Private (Admin)
 */
router.get('/:id', auth, authorize(['admin']), contributionController.getContributionById);

/**
 * @route POST /api/contributions
 * @desc Create a new contribution
 * @access Public
 */
router.post('/', contributionController.createContribution);

/**
 * @route PUT /api/contributions/:id
 * @desc Update a contribution
 * @access Private (Admin)
 */
router.put('/:id', auth, authorize(['admin']), contributionController.updateContribution);

/**
 * @route DELETE /api/contributions/:id
 * @desc Delete a contribution
 * @access Private (Admin)
 */
router.delete('/:id', auth, authorize(['admin']), contributionController.deleteContribution);

/**
 * @route POST /api/contributions/:id/approve
 * @desc Approve a contribution and create a scholarship
 * @access Private (Admin)
 */
router.post('/:id/approve', auth, authorize(['admin']), contributionController.approveContribution);

/**
 * @route POST /api/contributions/:id/reject
 * @desc Reject a contribution
 * @access Private (Admin)
 */
router.post('/:id/reject', auth, authorize(['admin']), contributionController.rejectContribution);

module.exports = router; 