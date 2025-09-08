const Contribution = require('../models/Contribution');
const Scholarship = require('../models/Scholarship');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all contributions
 * @route GET /api/contributions
 */
const getAllContributions = async (req, res, next) => {
  try {
    const contributions = await Contribution.getAll();
    res.json(contributions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get contribution by ID
 * @route GET /api/contributions/:id
 */
const getContributionById = async (req, res, next) => {
  try {
    const contribution = await Contribution.getById(req.params.id);
    
    if (!contribution) {
      throw new ApiError(404, 'Contribution not found');
    }
    
    res.json(contribution);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new contribution
 * @route POST /api/contributions
 */
const createContribution = async (req, res, next) => {
  try {
    // Validate required fields
    const requiredFields = ['scholarshipName', 'organization', 'website', 'level', 'hostCountry'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiError(400, `Missing required field: ${field}`);
      }
    }
    
    const contributionData = {
      ...req.body,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    
    const contribution = await Contribution.create(contributionData);
    res.status(201).json({
      success: true,
      message: 'Contribution received successfully',
      contribution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a contribution
 * @route PUT /api/contributions/:id
 */
const updateContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.update(req.params.id, req.body);
    
    if (!contribution) {
      throw new ApiError(404, 'Contribution not found');
    }
    
    res.json({
      success: true,
      message: 'Contribution updated successfully',
      contribution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a contribution
 * @route DELETE /api/contributions/:id
 */
const deleteContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.delete(req.params.id);
    
    if (!contribution) {
      throw new ApiError(404, 'Contribution not found');
    }
    
    res.json({
      success: true,
      message: 'Contribution deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contributions by status
 * @route GET /api/contributions/status/:status
 */
const getContributionsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Invalid status. Must be pending, approved, or rejected');
    }
    
    const contributions = await Contribution.getByStatus(status);
    res.json(contributions);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a contribution and create a scholarship
 * @route POST /api/contributions/:id/approve
 */
const approveContribution = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the contribution
    const contribution = await Contribution.getById(id);
    
    if (!contribution) {
      throw new ApiError(404, 'Contribution not found');
    }
    
    if (contribution.status === 'approved') {
      throw new ApiError(400, 'Contribution already approved');
    }
    
    // Update contribution status
    await Contribution.approve(id);
    
    // Create a new scholarship from the contribution
    const scholarshipData = {
      name: contribution.scholarshipName,
      organization: contribution.organization,
      hostCountry: contribution.hostCountry,
      region: contribution.region || contribution.hostCountry,
      targetGroup: contribution.targetGroup || 'All',
      level: [contribution.level],
      deadline: contribution.deadline,
      funding: contribution.fundingType,
      fundingDetails: contribution.fundingDetails || '',
      returnHome: contribution.returnHome || 'No',
      website: contribution.website,
      notes: contribution.additionalNotes || '',
      eligibility: contribution.eligibility || '',
      applicationProcess: contribution.applicationProcess || '',
    };
    
    const scholarship = await Scholarship.create(scholarshipData);
    
    res.json({
      success: true,
      message: 'Contribution approved and scholarship created successfully',
      scholarship,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a contribution
 * @route POST /api/contributions/:id/reject
 */
const rejectContribution = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the contribution
    const contribution = await Contribution.getById(id);
    
    if (!contribution) {
      throw new ApiError(404, 'Contribution not found');
    }
    
    if (contribution.status === 'rejected') {
      throw new ApiError(400, 'Contribution already rejected');
    }
    
    // Update contribution status
    await Contribution.reject(id);
    
    res.json({
      success: true,
      message: 'Contribution rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution,
  getContributionsByStatus,
  approveContribution,
  rejectContribution,
}; 