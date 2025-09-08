const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const { AppError } = require('../middleware/error');

// Helper function to read scholarships
async function readScholarships() {
    try {
        const content = await fs.readFile(config.filePaths.scholarships, 'utf8');
        const match = content.match(/const scholarshipData = (\[[\s\S]*?\]);/);
        if (!match) {
            throw new AppError('Could not find scholarshipData array in file', 500);
        }
        return JSON.parse(match[1]);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new AppError('Scholarships file not found', 500);
        }
        throw error;
    }
}

// Helper function to write scholarships
async function writeScholarships(data) {
    try {
        const content = await fs.readFile(config.filePaths.scholarships, 'utf8');
        const scholarshipsString = JSON.stringify(data, null, 4)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"/g, "'");

        const updatedContent = content.replace(
            /const scholarshipData = \[[\s\S]*?\];/,
            `const scholarshipData = ${scholarshipsString};`
        );

        await fs.writeFile(config.filePaths.scholarships, updatedContent);
    } catch (error) {
        throw new AppError('Failed to write scholarships file', 500);
    }
}

// Get all scholarships
router.get('/', async (req, res, next) => {
    try {
        const scholarships = await readScholarships();
        res.json(scholarships);
    } catch (error) {
        next(error);
    }
});

// Add new scholarship (admin only)
router.post('/', async (req, res, next) => {
    try {
        const {
            name,
            organization,
            hostCountry,
            region,
            targetGroup,
            level,
            deadline,
            funding,
            fundingDetails,
            returnHome,
            website,
            notes,
            eligibility,
            applicationProcess
        } = req.body;

        // Validate required fields
        const requiredFields = ['name', 'organization', 'hostCountry', 'level'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new AppError(`Missing required field: ${field}`, 400);
            }
        }

        const scholarships = await readScholarships();
        const newScholarship = {
            id: scholarships.length + 1,
            name,
            organization,
            hostCountry,
            region: region || hostCountry,
            targetGroup: targetGroup || 'All',
            level: Array.isArray(level) ? level : [level],
            deadline,
            funding: funding || 'Partial',
            fundingDetails: fundingDetails || '',
            returnHome: returnHome || 'No',
            website: website || '',
            notes: notes || '',
            eligibility: eligibility || '',
            applicationProcess: applicationProcess || ''
        };

        scholarships.push(newScholarship);
        await writeScholarships(scholarships);

        res.json({
            success: true,
            message: 'Scholarship added successfully',
            scholarship: newScholarship
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 