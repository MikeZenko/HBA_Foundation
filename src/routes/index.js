const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to contributions file
const CONTRIBUTIONS_FILE = path.join(process.cwd(), 'contributions.json');

// Helper functions for file operations
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

// Initialize with sample data if file is empty
async function initializeContributions() {
  try {
    const contributions = await readContributions();
    if (contributions.length === 0) {
      const sampleContributions = [
        {
          id: 1,
          scholarshipName: 'Sample Scholarship',
          organization: 'Sample University',
          website: 'https://example.com',
          level: "Bachelor's",
          hostCountry: 'USA',
          targetGroup: 'All Students',
          deadline: '2024-12-31',
          fundingType: 'Yes',
          fundingDetails: 'Full tuition coverage',
          eligibility: 'Must have high GPA',
          applicationProcess: 'Apply online',
          additionalNotes: 'This is a sample scholarship for demo purposes',
          submitterName: 'John Doe',
          submitterEmail: 'john@example.com',
          timestamp: new Date('2024-01-01'),
          status: 'pending'
        },
        {
          id: 2,
          scholarshipName: 'Graduate Research Fellowship',
          organization: 'Research Institute',
          website: 'https://research.example.com',
          level: "Master's",
          hostCountry: 'Canada',
          targetGroup: 'Graduate Students',
          deadline: '2024-11-30',
          fundingType: 'Partial',
          fundingDetails: 'Covers tuition and stipend',
          eligibility: 'Must be enrolled in research program',
          applicationProcess: 'Submit proposal and transcripts',
          additionalNotes: 'Focus on STEM fields',
          submitterName: 'Jane Smith',
          submitterEmail: 'jane@example.com',
          timestamp: new Date('2024-01-15'),
          status: 'approved'
        }
      ];
      await writeContributions(sampleContributions);
    }
  } catch (error) {
    console.error('Error initializing contributions:', error);
  }
}

// Initialize contributions on startup
initializeContributions();

// Mock data for scholarships
const mockScholarships = [
  {
    id: 1,
    name: 'University of the People Afghan Women\'s Fund',
    organization: 'University of the People (UoPeople)',
    hostCountry: 'Online',
    region: 'Online',
    targetGroup: 'Afghan Women',
    level: ['Bachelor\'s'],
    deadline: 'Ongoing (apply for admission first)',
    funding: 'Yes',
    fundingDetails: 'Full tuition coverage. UoPeople is tuition-free but has assessment fees per course, which this scholarship covers.',
    returnHome: 'No',
    website: 'https://www.uopeople.edu/tuition-free/our-scholarships/afghan-womens-scholarship-fund/',
    notes: 'This is a highly accessible option as it is online and specifically targets Afghan women.',
    eligibility: 'Must be a female Afghan citizen, demonstrate financial need, and gain admission to UoPeople.',
    applicationProcess: '1. Apply for admission to UoPeople. 2. Once accepted, request the scholarship via the student portal.'
  },
  {
    id: 2,
    name: 'UNHCR DAFI Scholarship Programme',
    organization: 'UNHCR',
    hostCountry: 'Various',
    region: 'Global',
    targetGroup: 'Refugees',
    level: ['Bachelor\'s'],
    deadline: 'Varies by country',
    funding: 'Yes',
    fundingDetails: 'Covers tuition, living allowance, and other study-related costs.',
    returnHome: 'No',
    website: 'https://www.unhcr.org/dafi-scholarships',
    notes: 'Available in multiple countries for refugee students.',
    eligibility: 'Must be a recognized refugee under UNHCR mandate.',
    applicationProcess: 'Apply through UNHCR field offices in host countries.'
  },
  {
    id: 3,
    name: 'World University Service of Canada (WUSC) Student Refugee Program',
    organization: 'WUSC',
    hostCountry: 'Canada',
    region: 'North America',
    targetGroup: 'Refugees',
    level: ['Bachelor\'s'],
    deadline: 'January 15 annually',
    funding: 'Yes',
    fundingDetails: 'Full sponsorship including tuition, accommodation, and living expenses.',
    returnHome: 'No',
    website: 'https://wusc.ca/programs/student-refugee-program/',
    notes: 'Comprehensive support program with community sponsorship.',
    eligibility: 'Must be a refugee between 18-24 years old with strong academic record.',
    applicationProcess: 'Apply through UNHCR referral system.'
  },
  {
    id: 4,
    name: 'Mastercard Foundation Scholars Program',
    organization: 'Mastercard Foundation',
    hostCountry: 'Various (Africa & North America)',
    region: 'Africa/North America',
    targetGroup: 'Young Africans',
    level: ['Bachelor\'s', 'Master\'s'],
    deadline: 'Varies by partner university',
    funding: 'Yes',
    fundingDetails: 'Comprehensive scholarship covering tuition, accommodation, books, and living expenses.',
    returnHome: 'Yes',
    website: 'https://mastercardfdn.org/all/scholars/',
    notes: 'Focus on developing leadership skills and giving back to Africa.',
    eligibility: 'African citizens with demonstrated financial need and academic excellence.',
    applicationProcess: 'Apply directly to partner universities offering the program.'
  },
  {
    id: 5,
    name: 'Open Society Foundations Scholarships',
    organization: 'Open Society Foundations',
    hostCountry: 'Various',
    region: 'Global',
    targetGroup: 'Underrepresented groups',
    level: ['Master\'s', 'PhD'],
    deadline: 'Varies by program',
    funding: 'Yes',
    fundingDetails: 'Full funding including tuition, living expenses, and travel costs.',
    returnHome: 'Encouraged',
    website: 'https://www.opensocietyfoundations.org/grants/scholarships',
    notes: 'Multiple programs targeting different regions and groups.',
    eligibility: 'Varies by specific program, generally for marginalized communities.',
    applicationProcess: 'Apply through specific program websites.'
  },
  {
    id: 6,
    name: 'Fulbright Foreign Student Program',
    organization: 'U.S. Department of State',
    hostCountry: 'United States',
    region: 'North America',
    targetGroup: 'International Students',
    level: ['Master\'s', 'PhD'],
    deadline: 'Varies by country (typically February-October)',
    funding: 'Yes',
    fundingDetails: 'Full funding including tuition, living stipend, health insurance, and travel costs.',
    returnHome: 'Yes',
    website: 'https://foreign.fulbrightonline.org/',
    notes: 'Prestigious program with strong alumni network.',
    eligibility: 'Varies by country; generally requires bachelor\'s degree and English proficiency.',
    applicationProcess: 'Apply through Fulbright Commission in home country.'
  },
  {
    id: 7,
    name: 'Kailash Satyarthi Children\'s Foundation Scholarship',
    organization: 'Kailash Satyarthi Children\'s Foundation',
    hostCountry: 'India',
    region: 'Asia',
    targetGroup: 'Disadvantaged Children',
    level: ['High School', 'Bachelor\'s'],
    deadline: 'Ongoing applications',
    funding: 'Partial',
    fundingDetails: 'Educational support, books, and some living expenses.',
    returnHome: 'No',
    website: 'https://satyarthi.org.in/our-work/education/',
    notes: 'Focus on child rights and education for marginalized communities.',
    eligibility: 'Children from disadvantaged backgrounds in India.',
    applicationProcess: 'Contact foundation directly or through partner organizations.'
  }
];

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

// API Routes
router.get('/api/scholarships', async (req, res) => {
  try {
    // Get approved contributions and convert them to scholarship format
    const contributions = await readContributions();
    const approvedContributions = contributions
      .filter(contribution => contribution.status === 'approved')
      .map(convertContributionToScholarship);
    
    // Combine with mock scholarships for demonstration
    const allScholarships = [...mockScholarships, ...approvedContributions];
    
    console.log(`Returning ${allScholarships.length} scholarships (${approvedContributions.length} approved contributions)`);
    res.json(allScholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ message: 'Error fetching scholarships', error: error.message });
  }
});

router.get('/api/scholarships/:id', async (req, res) => {
  try {
    const scholarshipId = parseInt(req.params.id);
    
    // Check in mock scholarships first
    let scholarship = mockScholarships.find(s => s.id === scholarshipId);
    
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

module.exports = router; 