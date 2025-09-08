const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { AppError } = require('../middleware/error');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// Helper function to read contributions
async function readContributions() {
    try {
        const data = await fs.readFile(config.filePaths.contributions, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Helper function to write contributions
async function writeContributions(data) {
    await fs.writeFile(
        config.filePaths.contributions,
        JSON.stringify(data, null, 2)
    );
}

// Get all contributions (admin only)
router.get('/', adminAuth, async (req, res, next) => {
    try {
        const contributions = await readContributions();
        res.json(contributions);
    } catch (error) {
        next(error);
    }
});

// Submit new contribution
router.post('/', async (req, res, next) => {
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

        // Validate required fields
        const requiredFields = ['scholarshipName', 'organization', 'website', 'level', 'hostCountry'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new AppError(`Missing required field: ${field}`, 400);
            }
        }

        const contribution = {
            id: `contribution-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending',
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
        };

        const contributions = await readContributions();
        contributions.push(contribution);
        await writeContributions(contributions);

        res.json({
            success: true,
            message: 'Contribution submitted successfully',
            contribution
        });
    } catch (error) {
        next(error);
    }
});

// Approve contribution (admin only)
router.post('/:id/approve', adminAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const contributions = await readContributions();
        const contribution = contributions.find(c => c.id === id);

        if (!contribution) {
            throw new AppError('Contribution not found', 404);
        }

        contribution.status = 'approved';
        await writeContributions(contributions);

        res.json({
            success: true,
            message: 'Contribution approved successfully',
            contribution
        });
    } catch (error) {
        next(error);
    }
});

// Reject contribution (admin only)
router.post('/:id/reject', adminAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const contributions = await readContributions();
        const contribution = contributions.find(c => c.id === id);

        if (!contribution) {
            throw new AppError('Contribution not found', 404);
        }

        contribution.status = 'rejected';
        await writeContributions(contributions);

        res.json({
            success: true,
            message: 'Contribution rejected successfully',
            contribution
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 