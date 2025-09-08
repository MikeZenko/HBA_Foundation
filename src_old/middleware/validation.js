const { AppError } = require('./error');

const validateContribution = (req, res, next) => {
    const {
        scholarshipName,
        organization,
        website,
        level,
        hostCountry,
        submitterName,
        submitterEmail
    } = req.body;

    // Required fields
    if (!scholarshipName || !organization || !website || !level || !hostCountry) {
        return next(new AppError('Missing required fields', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (submitterEmail && !emailRegex.test(submitterEmail)) {
        return next(new AppError('Invalid email format', 400));
    }

    // Validate website format
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(website)) {
        return next(new AppError('Invalid website URL', 400));
    }

    // Validate level
    const validLevels = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'All levels'];
    if (!validLevels.includes(level)) {
        return next(new AppError('Invalid study level', 400));
    }

    next();
};

const validateScholarship = (req, res, next) => {
    const {
        name,
        organization,
        hostCountry,
        level,
        website
    } = req.body;

    // Required fields
    if (!name || !organization || !hostCountry || !level) {
        return next(new AppError('Missing required fields', 400));
    }

    // Validate website format if provided
    if (website) {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(website)) {
            return next(new AppError('Invalid website URL', 400));
        }
    }

    // Validate level
    const validLevels = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'All levels'];
    if (!Array.isArray(level)) {
        if (!validLevels.includes(level)) {
            return next(new AppError('Invalid study level', 400));
        }
    } else {
        for (const l of level) {
            if (!validLevels.includes(l)) {
                return next(new AppError('Invalid study level in array', 400));
            }
        }
    }

    next();
};

module.exports = {
    validateContribution,
    validateScholarship
}; 