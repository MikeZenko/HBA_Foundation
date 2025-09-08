const Scholarship = require('../models/Scholarship');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all scholarships
 * @route GET /api/scholarships
 */
const getAllScholarships = async (req, res, next) => {
  try {
    const scholarships = await Scholarship.getAll();
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
};

/**
 * Get scholarship by ID
 * @route GET /api/scholarships/:id
 */
const getScholarshipById = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.getById(req.params.id);
    
    if (!scholarship) {
      throw new ApiError(404, 'Scholarship not found');
    }
    
    res.json(scholarship);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new scholarship
 * @route POST /api/scholarships
 */
const createScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json(scholarship);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a scholarship
 * @route PUT /api/scholarships/:id
 */
const updateScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.update(req.params.id, req.body);
    
    if (!scholarship) {
      throw new ApiError(404, 'Scholarship not found');
    }
    
    res.json(scholarship);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a scholarship
 * @route DELETE /api/scholarships/:id
 */
const deleteScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.delete(req.params.id);
    
    if (!scholarship) {
      throw new ApiError(404, 'Scholarship not found');
    }
    
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Search scholarships
 * @route GET /api/scholarships/search
 */
const searchScholarships = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      throw new ApiError(400, 'Search query is required');
    }
    
    const scholarships = await Scholarship.search(query);
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter scholarships
 * @route GET /api/scholarships/filter
 */
const filterScholarships = async (req, res, next) => {
  try {
    const filters = {
      mode: req.query.mode || 'all',
      region: req.query.region || 'all',
      level: req.query.level || 'all',
      funding: req.query.funding || 'all',
    };
    
    const scholarships = await Scholarship.filter(filters);
    res.json(scholarships);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  searchScholarships,
  filterScholarships,
}; 