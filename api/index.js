const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Create Express app
const app = express();

// Trust proxy for Vercel serverless environment
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Gzip compression
app.use(compression());

// Simplified rate limiting for serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// In-memory storage for contributions (since Vercel serverless is stateless)
let contributionsCache = null;

// Initialize contributions from file
function initializeContributions() {
  if (contributionsCache === null) {
    contributionsCache = readContributionsFromFile();
  }
  return contributionsCache;
}

// Read contributions from file (initial load only)
function readContributionsFromFile() {
  try {
    const contributionsPath = path.join(process.cwd(), 'contributions.json');
    if (fs.existsSync(contributionsPath)) {
      const data = fs.readFileSync(contributionsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading contributions from file:', error);
    return [];
  }
}

// Read scholarships from the main data file
function readScholarshipsFromFile() {
  try {
    const scholarshipsPath = path.join(process.cwd(), 'data', 'scholarships.json');
    if (fs.existsSync(scholarshipsPath)) {
      const data = fs.readFileSync(scholarshipsPath, 'utf8');
      return JSON.parse(data);
    }
    
    // Fallback to embedded data if file doesn't exist (for serverless deployment)
    console.log('Falling back to embedded scholarship data');
    return getEmbeddedScholarshipData();
  } catch (error) {
    console.error('Error reading scholarships from file:', error);
    console.log('Falling back to embedded scholarship data');
    return getEmbeddedScholarshipData();
  }
}

// Embedded scholarship data as fallback for serverless deployment
function getEmbeddedScholarshipData() {
  return [
    {
      "id": 1,
      "name": "University of the People Afghan Women's Fund",
      "organization": "University of the People (UoPeople)",
      "hostCountry": "Online",
      "region": "Online",
      "targetGroup": "Afghan Women",
      "level": ["Bachelor's"],
      "deadline": "Ongoing (apply for admission first)",
      "funding": "Yes",
      "fundingDetails": "Full tuition coverage. UoPeople is tuition-free but has assessment fees per course, which this scholarship covers.",
      "returnHome": "No",
      "website": "https://www.uopeople.edu/tuition-free/our-scholarships/afghan-womens-scholarship-fund/",
      "notes": "This is a highly accessible option as it is online and specifically targets Afghan women. The key is to first secure admission to UoPeople.",
      "eligibility": "Must be a female Afghan citizen, demonstrate financial need, and gain admission to UoPeople.",
      "applicationProcess": "1. Apply for admission to UoPeople. 2. Once accepted, request the scholarship via the student portal."
    },
    {
      "id": 2,
      "name": "L.E.A.R.N. Initiative",
      "organization": "Embrace Relief",
      "hostCountry": "Online",
      "region": "Online",
      "targetGroup": "Afghan Girls",
      "level": ["High School", "Bachelor's"],
      "deadline": "Currently Accepting Applications",
      "funding": "Partial",
      "fundingDetails": "Provides financial aid covering at minimum tuition. 'Full Support' options can include internet, materials, and mentorship.",
      "returnHome": "No",
      "website": "https://www.embracerelief.org/l-e-a-r-n-initiative-empowering-afghan-girls-through-education/",
      "notes": "Offers a structured pathway from high school (GED) to a Bachelor's degree online. The 'full support' option is particularly valuable.",
      "eligibility": "Afghan girls eligible for high school (grades 10-12) or Bachelor's studies. An interview is part of the selection process.",
      "applicationProcess": "Complete the online application via the Embrace Relief website and participate in an interview if shortlisted."
    },
    {
      "id": 3,
      "name": "Shafia Fund – Right to Learn",
      "organization": "Right to Learn Afghanistan",
      "hostCountry": "Canada (Administered)",
      "region": "North America",
      "targetGroup": "Afghan Women/Girls (in Afghanistan & region)",
      "level": ["Bachelor's"],
      "deadline": "Check website",
      "funding": "Partial",
      "fundingDetails": "Up to 47,000 AFN for education expenses like tuition, transport, books, devices. Prioritizes most urgent needs.",
      "returnHome": "No",
      "website": "https://righttolearn.ca/programs/",
      "notes": "Highly relevant due to its flexibility, supporting students within Afghanistan and the surrounding region. The 'in the region' eligibility is a significant advantage.",
      "eligibility": "Afghan women and girls of any age, accepted or enrolled in an educational program. Can apply once a year.",
      "applicationProcess": "Submit the application via the designated Google Form on their website. Shortlisted applicants will be interviewed."
    },
    {
      "id": 8,
      "name": "Qatar Scholarship for Afghans Project (QSAP)",
      "organization": "IIE, Education Above All, Qatar Fund for Development",
      "hostCountry": "USA",
      "region": "North America",
      "targetGroup": "Displaced Afghan Students (esp. at-risk, women)",
      "level": ["Bachelor's"],
      "deadline": "Managed by IIE (specific intake cycles)",
      "funding": "Yes",
      "fundingDetails": "Full scholarship for study at approximately 50 partner colleges and universities in the United States.",
      "returnHome": "No",
      "website": "https://www.iie.org/news/qsap-welcomes-100-new-refugee-students-to-us-colleges/",
      "notes": "A major and highly relevant initiative. Focuses on Afghans who were at risk, with 50% of scholarships for women. Opportunity is for study in the US.",
      "eligibility": "Displaced Afghan students. Selection is managed through IIE and its partners.",
      "applicationProcess": "The program is managed by the Institute of International Education (IIE). Check the IIE website for information on new application cycles."
    },
    {
      "id": 9,
      "name": "University of Toronto At-Risk Awards",
      "organization": "University of Toronto",
      "hostCountry": "Canada",
      "region": "North America",
      "targetGroup": "Students impacted by conflict (incl. Afghans)",
      "level": ["Bachelor's"],
      "deadline": "Varies (e.g., Jan 15, Feb 28)",
      "funding": "Partial",
      "fundingDetails": "Non-repayable bursary support up to $10,000 CAD to assist with educational costs.",
      "returnHome": "No",
      "website": "https://future.utoronto.ca/finances/scholarships/",
      "notes": "This is not a full scholarship but a bursary to help with costs for students already admitted or applying to U of T.",
      "eligibility": "Undergraduate students at U of T whose education has been disrupted by conflict or war, including those from Afghanistan. Must demonstrate financial need.",
      "applicationProcess": "Apply through the University of Toronto's financial aid system after being admitted."
    },
    {
      "id": 10,
      "name": "Türkiye Bursları",
      "organization": "Turkish Government",
      "hostCountry": "Turkey",
      "region": "Asia",
      "targetGroup": "International Students",
      "level": ["Bachelor's"],
      "deadline": "Jan 10 - Feb 20",
      "funding": "Yes",
      "fundingDetails": "Tuition, monthly stipend, round-trip travel, health insurance, accommodation, and a mandatory one-year Turkish language course.",
      "returnHome": "No",
      "website": "https://www.turkiyeburslari.gov.tr/",
      "notes": "A very comprehensive scholarship. The mandatory Turkish language course is a key feature, as many programs are taught in Turkish.",
      "eligibility": "Non-Turkish citizens meeting age limits (e.g., under 21 for undergrad) and academic merit requirements (e.g., 70-75% min grades).",
      "applicationProcess": "Apply online via the Türkiye Bursları website. The process includes document evaluation and an interview for shortlisted candidates."
    },
    {
      "id": 11,
      "name": "KNB Scholarship",
      "organization": "Indonesian Government",
      "hostCountry": "Indonesia",
      "region": "Asia",
      "targetGroup": "Students from Developing Countries",
      "level": ["Bachelor's"],
      "deadline": "Annually (~Feb-March)",
      "funding": "Yes",
      "fundingDetails": "Settlement allowance, monthly living allowances, research/book allowances, health insurance, and round-trip airfare.",
      "returnHome": "No",
      "website": "http://knb.kemdikbud.go.id/",
      "notes": "Requires a recommendation letter from the Indonesian Embassy in your country of residence, which is a crucial step.",
      "eligibility": "Citizen of a developing country, meet age limits, and prove English proficiency (e.g., IELTS 5.5).",
      "applicationProcess": "Obtain a recommendation letter from the Indonesian Embassy, then apply online through the KNB portal."
    }
  ];
}

// Helper function to convert contribution to scholarship format
function convertContributionToScholarship(contribution) {
  return {
    id: contribution.id + 1000, // Offset to avoid ID conflicts
    name: contribution.scholarshipName,
    organization: contribution.organization,
    website: contribution.website,
    level: Array.isArray(contribution.level) ? contribution.level : [contribution.level],
    hostCountry: contribution.hostCountry,
    targetGroup: contribution.targetGroup,
    deadline: contribution.deadline,
    funding: contribution.fundingType === 'Yes' ? 'Yes' : (contribution.fundingType === 'No' ? 'No' : 'Partial'),
    fundingDetails: contribution.fundingDetails,
    eligibility: contribution.eligibility,
    applicationProcess: contribution.applicationProcess,
    notes: contribution.additionalNotes || 'Community contribution',
    returnHome: 'No', // Default value
    region: getRegionFromCountry(contribution.hostCountry)
  };
}

// Helper function to determine region from country
function getRegionFromCountry(country) {
  if (!country) return 'Global';
  
  const countryLower = country.toLowerCase();
  
  if (countryLower.includes('online') || countryLower.includes('virtual')) {
    return 'Online';
  }
  
  // North America
  if (countryLower.includes('usa') || countryLower.includes('united states') || 
      countryLower.includes('canada') || countryLower.includes('mexico')) {
    return 'North America';
  }
  
  // Europe
  if (countryLower.includes('uk') || countryLower.includes('united kingdom') || 
      countryLower.includes('germany') || countryLower.includes('france') || 
      countryLower.includes('italy') || countryLower.includes('spain') ||
      countryLower.includes('netherlands') || countryLower.includes('sweden') ||
      countryLower.includes('norway') || countryLower.includes('denmark') ||
      countryLower.includes('finland') || countryLower.includes('belgium') ||
      countryLower.includes('austria') || countryLower.includes('switzerland') ||
      countryLower.includes('turkey') || countryLower.includes('türkiye')) {
    return 'Europe';
  }
  
  // Asia
  if (countryLower.includes('china') || countryLower.includes('japan') || 
      countryLower.includes('korea') || countryLower.includes('india') ||
      countryLower.includes('singapore') || countryLower.includes('malaysia') ||
      countryLower.includes('thailand') || countryLower.includes('indonesia') ||
      countryLower.includes('philippines') || countryLower.includes('vietnam') ||
      countryLower.includes('pakistan') || countryLower.includes('bangladesh')) {
    return 'Asia';
  }
  
  // Australia/Oceania
  if (countryLower.includes('australia') || countryLower.includes('new zealand') ||
      countryLower.includes('fiji') || countryLower.includes('papua')) {
    return 'Oceania';
  }
  
  // Africa
  if (countryLower.includes('south africa') || countryLower.includes('kenya') ||
      countryLower.includes('nigeria') || countryLower.includes('ghana') ||
      countryLower.includes('egypt') || countryLower.includes('morocco') ||
      countryLower.includes('tanzania') || countryLower.includes('uganda')) {
    return 'Africa';
  }
  
  return 'Global';
}

// Read contributions (from in-memory cache)
function readContributions() {
  return initializeContributions();
}

// Write contributions (to in-memory cache)
function writeContributions(contributions) {
  try {
    contributionsCache = contributions;
    console.log('Successfully updated contributions in memory');
    return true;
  } catch (error) {
    console.error('Error updating contributions in memory:', error);
    return false;
  }
}

// API Routes
app.get('/api/scholarships', (req, res) => {
  try {
    // Load scholarships from the main data file
    const scholarships = readScholarshipsFromFile();
    
    // Load approved contributions and convert them (exclude hidden ones)
    const contributions = readContributions();
    const approvedContributions = contributions
      .filter(contribution => contribution.status === 'approved')
      .map(convertContributionToScholarship);
    
    // Combine both sources
    const allScholarships = [...scholarships, ...approvedContributions];
    
    console.log(`Returning ${allScholarships.length} scholarships (${scholarships.length} from data file, ${approvedContributions.length} approved contributions)`);
    res.json(allScholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/contributions', (req, res) => {
  try {
    const contributions = readContributions();
    console.log(`Returning ${contributions.length} contributions`);
    res.json(contributions);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint for new contributions
app.post('/api/contributions', (req, res) => {
  try {
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

    // Basic validation
    if (!scholarshipName || !organization || !submitterEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['scholarshipName', 'organization', 'submitterEmail']
      });
    }

    const contributions = readContributions();
    const newId = Math.max(0, ...contributions.map(c => c.id || 0)) + 1;

    const newContribution = {
      id: newId,
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
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    contributions.push(newContribution);
    
    if (writeContributions(contributions)) {
      console.log(`New contribution added with ID: ${newId}`);
      res.status(201).json({
        message: 'Contribution submitted successfully',
        id: newId
      });
    } else {
      res.status(500).json({ error: 'Failed to save contribution' });
    }
  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve contribution
app.post('/api/approve-scholarship', (req, res) => {
  try {
    const { id } = req.body;
    const contributions = readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'approved';
      if (writeContributions(contributions)) {
        console.log(`Contribution ${id} approved`);
        res.json({ message: 'Scholarship approved successfully', success: true });
      } else {
        res.status(500).json({ message: 'Failed to save changes', success: false });
      }
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error approving contribution:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Reject contribution
app.post('/api/reject-scholarship', (req, res) => {
  try {
    const { id } = req.body;
    const contributions = readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'rejected';
      if (writeContributions(contributions)) {
        console.log(`Contribution ${id} rejected`);
        res.json({ message: 'Scholarship rejected successfully', success: true });
      } else {
        res.status(500).json({ message: 'Failed to save changes', success: false });
      }
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Delete contribution
app.post('/api/delete-scholarship', (req, res) => {
  try {
    const { id } = req.body;
    const contributions = readContributions();
    const index = contributions.findIndex(c => c.id == id);
    
    if (index !== -1) {
      contributions.splice(index, 1);
      if (writeContributions(contributions)) {
        console.log(`Contribution ${id} deleted`);
        res.json({ message: 'Scholarship deleted successfully', success: true });
      } else {
        res.status(500).json({ message: 'Failed to save changes', success: false });
      }
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Admin login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication - you should use proper authentication in production
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

// Remove scholarship from public view (set status to 'hidden')
app.post('/api/remove-scholarship', (req, res) => {
  try {
    const { id } = req.body;
    const contributions = readContributions();
    const contribution = contributions.find(c => c.id == id);
    
    if (contribution) {
      contribution.status = 'hidden';
      if (writeContributions(contributions)) {
        console.log(`Contribution ${id} removed from public view`);
        res.json({ message: 'Scholarship removed from public view successfully', success: true });
      } else {
        res.status(500).json({ message: 'Failed to save changes', success: false });
      }
    } else {
      res.status(404).json({ message: 'Contribution not found', success: false });
    }
  } catch (error) {
    console.error('Error removing scholarship:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app; 