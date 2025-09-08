"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scholarship = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const scholarshipSchema = new mongoose_1.Schema({
    scholarshipId: {
        type: Number,
        required: [true, 'Scholarship ID is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Scholarship name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters'],
        index: 'text'
    },
    organization: {
        type: String,
        required: [true, 'Organization is required'],
        trim: true,
        maxlength: [150, 'Organization name cannot exceed 150 characters'],
        index: 'text'
    },
    hostCountry: {
        type: String,
        required: [true, 'Host country is required'],
        trim: true,
        maxlength: [100, 'Host country cannot exceed 100 characters']
    },
    region: {
        type: String,
        required: [true, 'Region is required'],
        trim: true,
        maxlength: [100, 'Region cannot exceed 100 characters']
    },
    targetGroup: {
        type: String,
        required: [true, 'Target group is required'],
        trim: true,
        maxlength: [150, 'Target group cannot exceed 150 characters'],
        index: 'text'
    },
    level: [{
            type: String,
            required: true,
            trim: true,
            enum: {
                values: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Certificate', 'Diploma', 'Other'],
                message: 'Please select a valid education level'
            }
        }],
    deadline: {
        type: String,
        required: [true, 'Deadline is required'],
        trim: true,
        maxlength: [100, 'Deadline cannot exceed 100 characters']
    },
    funding: {
        type: String,
        required: [true, 'Funding type is required'],
        enum: {
            values: Object.values(types_1.FundingType),
            message: 'Please select a valid funding type'
        }
    },
    fundingDetails: {
        type: String,
        trim: true,
        maxlength: [1000, 'Funding details cannot exceed 1000 characters']
    },
    returnHome: {
        type: String,
        enum: {
            values: Object.values(types_1.YesNo),
            message: 'Return home must be Yes or No'
        },
        default: types_1.YesNo.NO
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid URL starting with http:// or https://'
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    eligibility: {
        type: String,
        trim: true,
        maxlength: [2000, 'Eligibility requirements cannot exceed 2000 characters']
    },
    applicationProcess: {
        type: String,
        trim: true,
        maxlength: [2000, 'Application process cannot exceed 2000 characters']
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [50, 'Each tag cannot exceed 50 characters']
        }],
    isActive: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0,
        min: [0, 'View count cannot be negative']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
scholarshipSchema.index({ region: 1, funding: 1 });
scholarshipSchema.index({ hostCountry: 1, level: 1 });
scholarshipSchema.index({ targetGroup: 1, funding: 1 });
scholarshipSchema.index({ isActive: 1, createdAt: -1 });
scholarshipSchema.index({ viewCount: -1 });
scholarshipSchema.index({ lastUpdated: -1 });
scholarshipSchema.index({
    name: 'text',
    organization: 'text',
    targetGroup: 'text',
    hostCountry: 'text',
    region: 'text',
    notes: 'text',
    eligibility: 'text'
}, {
    weights: {
        name: 10,
        organization: 8,
        targetGroup: 6,
        hostCountry: 4,
        region: 3,
        notes: 2,
        eligibility: 1
    },
    name: 'scholarship_text_index'
});
scholarshipSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdated = new Date();
    }
    next();
});
scholarshipSchema.pre('save', async function (next) {
    if (!this.scholarshipId) {
        try {
            const ScholarshipModel = this.constructor;
            const lastScholarship = await ScholarshipModel.findOne({}, {}, { sort: { scholarshipId: -1 } });
            this.scholarshipId = lastScholarship ? lastScholarship.scholarshipId + 1 : 1;
        }
        catch (error) {
            return next(error);
        }
    }
    next();
});
scholarshipSchema.statics.searchScholarships = async function (query, filters = {}, options = {}) {
    const startTime = Date.now();
    try {
        const searchQuery = {
            isActive: true,
            ...filters
        };
        if (query) {
            searchQuery.$text = { $search: query };
        }
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const sortOptions = {};
        if (query && searchQuery.$text) {
            sortOptions.score = { $meta: 'textScore' };
        }
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const [scholarships, total] = await Promise.all([
            this.find(searchQuery, query ? { score: { $meta: 'textScore' } } : {})
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            this.countDocuments(searchQuery)
        ]);
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('search', 'scholarships', duration);
        return {
            scholarships,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('search', 'scholarships', duration, error);
        throw error;
    }
};
scholarshipSchema.statics.getPopularScholarships = async function (limit = 10) {
    const startTime = Date.now();
    try {
        const scholarships = await this.find({ isActive: true })
            .sort({ viewCount: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getPopular', 'scholarships', duration);
        return scholarships;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getPopular', 'scholarships', duration, error);
        throw error;
    }
};
scholarshipSchema.statics.getRecentScholarships = async function (limit = 10) {
    const startTime = Date.now();
    try {
        const scholarships = await this.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getRecent', 'scholarships', duration);
        return scholarships;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getRecent', 'scholarships', duration, error);
        throw error;
    }
};
scholarshipSchema.statics.getStatistics = async function () {
    const startTime = Date.now();
    try {
        const [total, active, byFunding, byRegion, byLevel, totalViews] = await Promise.all([
            this.countDocuments(),
            this.countDocuments({ isActive: true }),
            this.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$funding', count: { $sum: 1 } } }
            ]),
            this.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$region', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            this.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$level' },
                { $group: { _id: '$level', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            this.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
            ])
        ]);
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getStatistics', 'scholarships', duration);
        return {
            total,
            active,
            inactive: total - active,
            byFunding: byFunding.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byRegion: byRegion.slice(0, 10),
            byLevel: byLevel,
            totalViews: totalViews[0]?.totalViews || 0
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, logger_1.logDatabaseOperation)('getStatistics', 'scholarships', duration, error);
        throw error;
    }
};
scholarshipSchema.methods.incrementViewCount = async function () {
    try {
        this.viewCount += 1;
        await this.save();
        (0, logger_1.logDatabaseOperation)('incrementViewCount', 'scholarships');
    }
    catch (error) {
        (0, logger_1.logDatabaseOperation)('incrementViewCount', 'scholarships', undefined, error);
        throw error;
    }
};
exports.Scholarship = (0, mongoose_1.model)('Scholarship', scholarshipSchema);
exports.default = exports.Scholarship;
//# sourceMappingURL=Scholarship.js.map