const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to data files
const DATA_DIR = path.join(process.cwd(), 'data');
const SCHOLARSHIPS_FILE = path.join(DATA_DIR, 'scholarships.json');
const CONTRIBUTIONS_FILE = path.join(DATA_DIR, 'contributions.json');

// Helper functions for file operations
async function readScholarships() {
  try {
    const data = await fs.readFile(SCHOLARSHIPS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Scholarships file not found');
      return [];
    }
    console.error('Error reading scholarships:', error);
    throw error;
  }
}

async function writeScholarships(scholarships) {
  try {
    await fs.writeFile(SCHOLARSHIPS_FILE, JSON.stringify(scholarships, null, 2));
  } catch (error) {
    console.error('Error writing scholarships:', error);
    throw error;
  }
}

async function readContributions() {
  try {
    const data = await fs.readFile(CONTRIBUTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    console.error('Error reading contributions:', error);
    throw error;
  }
}

async function writeContributions(contributions) {
  try {
    await fs.writeFile(CONTRIBUTIONS_FILE, JSON.stringify(contributions, null, 2));
  } catch (error) {
    console.error('Error writing contributions:', error);
    throw error;
  }
}

// Initialize contributions file if it doesn't exist
async function initializeContributions() {
  try {
    // Just check if file exists and is readable
    await readContributions();
    console.log('Contributions file ready');
  } catch (error) {
    console.error('Error initializing contributions:', error);
  }
}

// Initialize contributions on startup
initializeContributions();

// Helper function to convert contribution to scholarship format
function convertContributionToScholarship(contribution) {
  return {
    id: contribution.id,
    name: contribution.scholarshipName,
    organization: contribution.organization,
    hostCountry: contribution.hostCountry,
    region: getRegionFromCountry(contribution.hostCountry),
    targetGroup: contribution.targetGroup,
    level: Array.isArray(contribution.level) ? contribution.level : [contribution.level],
    deadline: contribution.deadline,
    funding: contribution.fundingType === 'Yes' ? 'Yes' : 'Partial',
    fundingDetails: contribution.fundingDetails,
    returnHome: 'No', // Default value
    website: contribution.website,
    notes: contribution.additionalNotes || 'Submitted by community member',
    eligibility: contribution.eligibility,
    applicationProcess: contribution.applicationProcess
  };
}

// Helper function to determine region from country
function getRegionFromCountry(country) {
  const countryLower = country.toLowerCase();
  if (countryLower.includes('usa') || countryLower.includes('canada') || countryLower.includes('america')) {
    return 'North America';
  } else if (countryLower.includes('uk') || countryLower.includes('europe') || countryLower.includes('germany') || countryLower.includes('france')) {
    return 'Europe';
  } else if (countryLower.includes('online') || countryLower.includes('virtual')) {
    return 'Online';
  } else if (countryLower.includes('china') || countryLower.includes('japan') || countryLower.includes('korea') || countryLower.includes('asia')) {
    return 'Asia';
  } else {
    return 'Other';
  }
}

// Helper function to get all scholarships
async function getAllScholarships() {
  const scholarships = await readScholarships();
  const contributions = await readContributions();
  const approvedContributions = contributions
    .filter(contribution => contribution.status === 'approved')
    .map(convertContributionToScholarship);
  return [...scholarships, ...approvedContributions];
}

// API Routes - IMPORTANT: Put specific routes before parameterized routes

// Search scholarships (must be before :id route)
router.get('/api/scholarships/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required', success: false });
    }
    
    const searchTerm = q.toLowerCase().trim();
    const allScholarships = await getAllScholarships();
    
    // Search in name, organization, targetGroup, hostCountry, eligibility, notes
    const results = allScholarships.filter(s => {
      return (
        s.name?.toLowerCase().includes(searchTerm) ||
        s.organization?.toLowerCase().includes(searchTerm) ||
        s.targetGroup?.toLowerCase().includes(searchTerm) ||
        s.hostCountry?.toLowerCase().includes(searchTerm) ||
        s.eligibility?.toLowerCase().includes(searchTerm) ||
        s.notes?.toLowerCase().includes(searchTerm) ||
        s.fundingDetails?.toLowerCase().includes(searchTerm)
      );
    });
    
    console.log(`Search for "${q}" returned ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error('Error searching scholarships:', error);
    res.status(500).json({ message: 'Error searching scholarships', error: error.message });
  }
});

// Filter scholarships (must be before :id route)
router.get('/api/scholarships/filter', async (req, res) => {
  try {
    const { level, region, funding, targetGroup, hostCountry } = req.query;
    
    let results = await getAllScholarships();
    
    // Apply filters
    if (level && level !== 'all') {
      results = results.filter(s => {
        const levels = Array.isArray(s.level) ? s.level : [s.level];
        return levels.some(l => l?.toLowerCase().includes(level.toLowerCase()));
      });
    }
    
    if (region && region !== 'all') {
      results = results.filter(s => s.region?.toLowerCase() === region.toLowerCase());
    }
    
    if (funding && funding !== 'all') {
      results = results.filter(s => s.funding?.toLowerCase() === funding.toLowerCase());
    }
    
    if (targetGroup && targetGroup !== 'all') {
      results = results.filter(s => s.targetGroup?.toLowerCase().includes(targetGroup.toLowerCase()));
    }
    
    if (hostCountry && hostCountry !== 'all') {
      results = results.filter(s => s.hostCountry?.toLowerCase().includes(hostCountry.toLowerCase()));
    }
    
    console.log(`Filter returned ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error('Error filtering scholarships:', error);
    res.status(500).json({ message: 'Error filtering scholarships', error: error.message });
  }
});

// Get unique filter options (must be before :id route)
router.get('/api/scholarships/filters/options', async (req, res) => {
  try {
    const allScholarships = await getAllScholarships();
    
    // Extract unique values for each filter
    const levels = new Set();
    const regions = new Set();
    const funding = new Set();
    const targetGroups = new Set();
    const hostCountries = new Set();
    
    allScholarships.forEach(s => {
      // Handle level which can be an array
      if (Array.isArray(s.level)) {
        s.level.forEach(l => levels.add(l));
      } else if (s.level) {
        levels.add(s.level);
      }
      
      if (s.region) regions.add(s.region);
      if (s.funding) funding.add(s.funding);
      if (s.targetGroup) targetGroups.add(s.targetGroup);
      if (s.hostCountry) hostCountries.add(s.hostCountry);
    });
    
    res.json({
      levels: Array.from(levels).sort(),
      regions: Array.from(regions).sort(),
      funding: Array.from(funding).sort(),
      targetGroups: Array.from(targetGroups).sort(),
      hostCountries: Array.from(hostCountries).sort()
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Error fetching filter options', error: error.message });
  }
});

// Get all scholarships
router.get('/api/scholarships', async (req, res) => {
  try {
    const allScholarships = await getAllScholarships();
    const scholarships = await readScholarships();
    const contributions = await readContributions();
    const approvedCount = contributions.filter(c => c.status === 'approved').length;
    
    console.log(`Returning ${allScholarships.length} scholarships (${scholarships.length} base + ${approvedCount} approved contributions)`);
    res.json(allScholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ message: 'Error fetching scholarships', error: error.message });
  }
});

// Get single scholarship (parameterized route - must be after specific routes)
router.get('/api/scholarships/:id', async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);
    
    // Check in base scholarships first
    const scholarships = await readScholarships();
    let scholarship = scholarships.find(s => s.id === scholarshipId);
    
    // If not found, check in approved contributions
    if (!scholarship) {
      const contributions = await readContributions();
      const contribution = contributions.find(c => c.id === scholarshipId && c.status === 'approved');
      if (contribution) {
        scholarship = convertContributionToScholarship(contribution);
      }
    }
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    res.json(scholarship);
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({ message: 'Error fetching scholarship', error: error.message });
  }
});

// PUT /api/scholarships/:id - Update a scholarship
router.put('/api/scholarships/:id', async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);
    const updates = req.body;
    
    const scholarships = await readScholarships();
    const index = scholarships.findIndex(s => s.id === scholarshipId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Scholarship not found', success: false });
    }
    
    // Update scholarship while preserving the id
    scholarships[index] = {
      ...scholarships[index],
      ...updates,
      id: scholarshipId, // Preserve original ID
      updatedAt: new Date().toISOString()
    };
    
    await writeScholarships(scholarships);
    console.log(`Scholarship ${scholarshipId} updated`);
    
    res.json({ 
      message: 'Scholarship updated successfully', 
      success: true, 
      scholarship: scholarships[index] 
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ message: 'Error updating scholarship', success: false, error: error.message });
  }
});

// DELETE /api/scholarships/:id - Delete a scholarship
router.delete('/api/scholarships/:id', async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);
    
    const scholarships = await readScholarships();
    const index = scholarships.findIndex(s => s.id === scholarshipId);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Scholarship not found', success: false });
    }
    
    const deletedScholarship = scholarships[index];
    scholarships.splice(index, 1);
    await writeScholarships(scholarships);
    
    console.log(`Scholarship ${scholarshipId} deleted: ${deletedScholarship.name}`);
    
    res.json({ 
      message: 'Scholarship deleted successfully', 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ message: 'Error deleting scholarship', success: false, error: error.message });
  }
});

// POST /api/scholarships - Create a new scholarship (admin)
router.post('/api/scholarships', async (req, res) => {
  try {
    const scholarshipData = req.body;
    
    // Basic validation
    if (!scholarshipData.name || !scholarshipData.organization || !scholarshipData.website) {
      return res.status(400).json({ 
        message: 'Name, organization, and website are required', 
        success: false 
      });
    }
    
    const scholarships = await readScholarships();
    
    // Generate new ID (max ID + 1)
    const maxId = scholarships.reduce((max, s) => Math.max(max, s.id || 0), 0);
    const newScholarship = {
      id: maxId + 1,
      ...scholarshipData,
      createdAt: new Date().toISOString()
    };
    
    scholarships.push(newScholarship);
    await writeScholarships(scholarships);
    
    console.log(`New scholarship created: ${newScholarship.name}`);
    
    res.status(201).json({ 
      message: 'Scholarship created successfully', 
      success: true, 
      scholarship: newScholarship 
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ message: 'Error creating scholarship', success: false, error: error.message });
  }
});

router.post('/api/contributions', async (req, res) => {
  try {
    console.log('Contribution received:', req.body);
    
    // Basic validation for scholarship contribution form
    const { 
      scholarshipName, 
      organization, 
      website, 
      level, 
      hostCountry, 
      targetGroup, 
      deadline, 
      fundingType, 
      fundingDetails, 
      eligibility, 
      applicationProcess, 
      additionalNotes,
      submitterName, 
      submitterEmail 
    } = req.body;
    
    // Check required fields
    const requiredFields = {
      scholarshipName,
      organization,
      website,
      level,
      hostCountry,
      targetGroup,
      deadline,
      fundingType,
      fundingDetails,
      eligibility,
      applicationProcess,
      submitterName,
      submitterEmail
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        success: false
      });
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitterEmail)) {
      return res.status(400).json({ 
        message: 'Invalid email format for submitter email',
        success: false
      });
    }
    
    // Simple website URL validation
    try {
      new URL(website);
    } catch (e) {
      return res.status(400).json({ 
        message: 'Invalid website URL format',
        success: false
      });
    }
    
    // Save to contributions file
    const contributions = await readContributions();
    const newContribution = {
      id: Date.now(),
      scholarshipName,
      organization,
      website,
      level,
      hostCountry,
      targetGroup,
      deadline,
      fundingType,
      fundingDetails,
      eligibility,
      applicationProcess,
      additionalNotes,
      submitterName,
      submitterEmail,
      timestamp: new Date(),
      status: 'pending'
    };
    
    contributions.push(newContribution);
    await writeContributions(contributions);
    console.log('New contribution added. Total contributions:', contributions.length);
    
    res.json({ 
      message: 'Thank you for your scholarship contribution! We have received your submission and will review it soon.',
      success: true,
      id: newContribution.id
    });
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ 
      message: 'Error saving contribution. Please try again.',
      success: false,
      error: error.message
    });
  }
});

router.get('/api/contributions', async (req, res) => {
  try {
    const contributions = await readContributions();
    console.log('Fetching contributions, count:', contributions.length);
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ 
      message: 'Error loading contributions',
      error: error.message 
    });
  }
});

router.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'adminhba' && password === 'hba2025') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: { id: 1, email, role: 'admin' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Additional endpoints for admin functionality
router.post('/api/approve-scholarship', async (req, res) => {
  try {
    const { id } = req.body;
    const contributions = await readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'approved';
      await writeContributions(contributions);
      console.log(`Contribution ${id} approved`);
      res.json({ message: 'Scholarship approved successfully', success: true });
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error approving scholarship:', error);
    res.status(500).json({ message: 'Error approving scholarship', success: false, error: error.message });
  }
});

router.post('/api/reject-scholarship', async (req, res) => {
  try {
    const { id } = req.body;
    const contributions = await readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'rejected';
      await writeContributions(contributions);
      console.log(`Contribution ${id} rejected`);
      res.json({ message: 'Scholarship rejected successfully', success: true });
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error rejecting scholarship:', error);
    res.status(500).json({ message: 'Error rejecting scholarship', success: false, error: error.message });
  }
});

// Endpoint to remove scholarship from public view (set status to 'hidden')
router.post('/api/remove-scholarship', async (req, res) => {
  try {
    const { id } = req.body;
    const contributions = await readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'hidden';
      await writeContributions(contributions);
      console.log(`Contribution ${id} removed from public view`);
      res.json({ message: 'Scholarship removed from public view successfully', success: true });
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error removing scholarship:', error);
    res.status(500).json({ message: 'Error removing scholarship', success: false, error: error.message });
  }
});

// PUT /api/contributions/:id - Edit a submission
router.put('/api/contributions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const contributions = await readContributions();
    const index = contributions.findIndex(c => c.id == id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Contribution not found', success: false });
    }
    
    // Preserve id, timestamp, and update the rest
    contributions[index] = {
      ...contributions[index],
      ...updates,
      id: contributions[index].id,
      timestamp: contributions[index].timestamp,
      updatedAt: new Date()
    };
    
    await writeContributions(contributions);
    console.log(`Contribution ${id} updated`);
    res.json({ message: 'Contribution updated successfully', success: true, contribution: contributions[index] });
  } catch (error) {
    console.error('Error updating contribution:', error);
    res.status(500).json({ message: 'Error updating contribution', success: false, error: error.message });
  }
});

// DELETE /api/contributions/:id - Permanently delete a submission
router.delete('/api/contributions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contributions = await readContributions();
    const index = contributions.findIndex(c => c.id == id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Contribution not found', success: false });
    }
    
    contributions.splice(index, 1);
    await writeContributions(contributions);
    console.log(`Contribution ${id} permanently deleted`);
    res.json({ message: 'Contribution deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ message: 'Error deleting contribution', success: false, error: error.message });
  }
});

// POST /api/contributions/:id/pending - Set submission back to pending
router.post('/api/contributions/:id/pending', async (req, res) => {
  try {
    const { id } = req.params;
    const contributions = await readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found', success: false });
    }
    
    contribution.status = 'pending';
    await writeContributions(contributions);
    console.log(`Contribution ${id} set back to pending`);
    res.json({ message: 'Contribution set to pending successfully', success: true });
  } catch (error) {
    console.error('Error setting contribution to pending:', error);
    res.status(500).json({ message: 'Error setting contribution to pending', success: false, error: error.message });
  }
});

// GET /api/contributions/:id - Get a single contribution
router.get('/api/contributions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contributions = await readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found', success: false });
    }
    
    res.json(contribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    res.status(500).json({ message: 'Error fetching contribution', success: false, error: error.message });
  }
});

module.exports = router; 