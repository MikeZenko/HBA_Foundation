import { Schema, model } from 'mongoose';
import { IScholarship, IScholarshipDocument, FundingType, YesNo } from '../types';
import { logDatabaseOperation } from '../utils/logger';

const scholarshipSchema = new Schema<IScholarshipDocument>({
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
      values: Object.values(FundingType),
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
      values: Object.values(YesNo),
      message: 'Return home must be Yes or No'
    },
    default: YesNo.NO
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty strings
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
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for better query performance
scholarshipSchema.index({ region: 1, funding: 1 });
scholarshipSchema.index({ hostCountry: 1, level: 1 });
scholarshipSchema.index({ targetGroup: 1, funding: 1 });
scholarshipSchema.index({ isActive: 1, createdAt: -1 });
scholarshipSchema.index({ viewCount: -1 });
scholarshipSchema.index({ lastUpdated: -1 });

// Text index for search functionality
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

// Pre-save middleware to update lastUpdated
scholarshipSchema.pre('save', function(this: IScholarshipDocument, next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Pre-save middleware to generate scholarshipId if not provided
scholarshipSchema.pre('save', async function(this: IScholarshipDocument, next) {
  if (!this.scholarshipId) {
    try {
      const ScholarshipModel = this.constructor as any;
      const lastScholarship = await ScholarshipModel.findOne({}, {}, { sort: { scholarshipId: -1 } });
      this.scholarshipId = lastScholarship ? lastScholarship.scholarshipId + 1 : 1;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

// Static method to search scholarships
scholarshipSchema.statics.searchScholarships = async function(query: string, filters: any = {}, options: any = {}) {
  const startTime = Date.now();
  
  try {
    const searchQuery: any = {
      isActive: true,
      ...filters
    };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const sortOptions: any = {};
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
    logDatabaseOperation('search', 'scholarships', duration);

    return {
      scholarships,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logDatabaseOperation('search', 'scholarships', duration, error as Error);
    throw error;
  }
};

// Static method to get popular scholarships
scholarshipSchema.statics.getPopularScholarships = async function(limit: number = 10) {
  const startTime = Date.now();
  
  try {
    const scholarships = await this.find({ isActive: true })
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const duration = Date.now() - startTime;
    logDatabaseOperation('getPopular', 'scholarships', duration);

    return scholarships;
  } catch (error) {
    const duration = Date.now() - startTime;
    logDatabaseOperation('getPopular', 'scholarships', duration, error as Error);
    throw error;
  }
};

// Static method to get recent scholarships
scholarshipSchema.statics.getRecentScholarships = async function(limit: number = 10) {
  const startTime = Date.now();
  
  try {
    const scholarships = await this.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const duration = Date.now() - startTime;
    logDatabaseOperation('getRecent', 'scholarships', duration);

    return scholarships;
  } catch (error) {
    const duration = Date.now() - startTime;
    logDatabaseOperation('getRecent', 'scholarships', duration, error as Error);
    throw error;
  }
};

// Static method to get statistics
scholarshipSchema.statics.getStatistics = async function() {
  const startTime = Date.now();
  
  try {
    const [
      total,
      active,
      byFunding,
      byRegion,
      byLevel,
      totalViews
    ] = await Promise.all([
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
    logDatabaseOperation('getStatistics', 'scholarships', duration);

    return {
      total,
      active,
      inactive: total - active,
      byFunding: byFunding.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byRegion: byRegion.slice(0, 10),
      byLevel: byLevel,
      totalViews: totalViews[0]?.totalViews || 0
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logDatabaseOperation('getStatistics', 'scholarships', duration, error as Error);
    throw error;
  }
};

// Instance method to increment view count
scholarshipSchema.methods.incrementViewCount = async function(this: IScholarshipDocument) {
  try {
    this.viewCount += 1;
    await this.save();
    logDatabaseOperation('incrementViewCount', 'scholarships');
  } catch (error) {
    logDatabaseOperation('incrementViewCount', 'scholarships', undefined, error as Error);
    throw error;
  }
};

export const Scholarship = model<IScholarshipDocument>('Scholarship', scholarshipSchema);
export default Scholarship; 