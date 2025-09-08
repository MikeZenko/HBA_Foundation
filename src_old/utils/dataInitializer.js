const fs = require('fs').promises;
const path = require('path');
const Scholarship = require('../models/Scholarship');
const { readJsonFile, writeJsonFile } = require('../config/database');
const logger = require('./logger');

/**
 * Initialize scholarships from script.js file
 */
const initializeScholarships = async () => {
  try {
    // Check if scholarships.json already exists
    const scholarshipsFile = path.join(process.cwd(), 'data', 'scholarships.json');
    try {
      await fs.access(scholarshipsFile);
      logger.info('Scholarships data already initialized');
      return;
    } catch (error) {
      // File doesn't exist, continue with initialization
    }

    // Read script.js file
    const scriptPath = path.join(process.cwd(), 'script.js');
    let scriptContent;
    
    try {
      scriptContent = await fs.readFile(scriptPath, 'utf8');
    } catch (error) {
      // Try the public/js path if not found in root
      const publicScriptPath = path.join(process.cwd(), 'public', 'js', 'script.js');
      try {
        scriptContent = await fs.readFile(publicScriptPath, 'utf8');
      } catch (err) {
        logger.error('Could not find script.js file');
        return;
      }
    }
    
    // Extract scholarshipData array from script.js
    const match = scriptContent.match(/const scholarshipData = (\[[\s\S]*?\]);/);
    if (!match) {
      logger.error('Could not find scholarshipData array in script.js');
      return;
    }
    
    // Create a temporary file to store just the scholarshipData array
    const tempFile = path.join(process.cwd(), 'temp_data.js');
    
    try {
      // Write to temp file as a proper Node.js module
      await fs.writeFile(tempFile, `module.exports = ${match[1].replace(/'/g, '"')}`);
      
      // Load the array using require (which properly evaluates JavaScript)
      delete require.cache[require.resolve(tempFile)]; // Clear cache
      const scholarships = require(tempFile);
      
      // Fix any issues with the data
      const fixedScholarships = scholarships.map(scholarship => {
        // Ensure level is an array
        if (typeof scholarship.level === 'string') {
          scholarship.level = [scholarship.level];
        }
        
        return scholarship;
      });
      
      // Save to scholarships.json
      await writeJsonFile('scholarships.json', fixedScholarships);
      
      // Clean up the temp file
      await fs.unlink(tempFile);
      
      logger.info(`Initialized ${fixedScholarships.length} scholarships from script.js`);
    } catch (error) {
      logger.error('Error initializing scholarships:', error);
    }
  } catch (error) {
    logger.error('Error in initializeScholarships:', error);
  }
};

/**
 * Initialize all data
 */
const initializeData = async () => {
  try {
    await initializeScholarships();
    logger.info('Data initialization complete');
  } catch (error) {
    logger.error('Error initializing data:', error);
  }
};

module.exports = {
  initializeData,
}; 