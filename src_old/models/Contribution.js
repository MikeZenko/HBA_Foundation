const mongoose = require('mongoose');
const { readJsonFile, writeJsonFile, config } = require('../config/database');

// MongoDB Schema
const contributionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  scholarshipName: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    required: true,
    trim: true,
  },
  hostCountry: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: String,
    trim: true,
  },
  targetGroup: {
    type: String,
    trim: true,
  },
  deadline: {
    type: String,
    required: true,
    trim: true,
  },
  fundingType: {
    type: String,
    required: true,
    enum: ['Yes', 'Partial', 'No'],
  },
  fundingDetails: {
    type: String,
    default: '',
  },
  returnHome: {
    type: String,
    default: 'No',
    enum: ['Yes', 'No'],
  },
  eligibility: {
    type: String,
    required: true,
  },
  applicationProcess: {
    type: String,
    required: true,
  },
  additionalNotes: {
    type: String,
    default: '',
  },
  submitterName: {
    type: String,
    required: true,
    trim: true,
  },
  submitterEmail: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// MongoDB Model
const ContributionModel = mongoose.model('Contribution', contributionSchema);

// File-based operations
const CONTRIBUTIONS_FILE = 'contributions.json';

// Contribution class for both MongoDB and file-based operations
class Contribution {
  // Get all contributions
  static async getAll() {
    if (config.useMongoDb) {
      return ContributionModel.find().sort({ timestamp: -1 });
    } else {
      return readJsonFile(CONTRIBUTIONS_FILE);
    }
  }

  // Get contribution by ID
  static async getById(id) {
    if (config.useMongoDb) {
      return ContributionModel.findOne({ id });
    } else {
      const contributions = await readJsonFile(CONTRIBUTIONS_FILE);
      return contributions.find(c => c.id === id);
    }
  }

  // Create a new contribution
  static async create(contributionData) {
    // Generate a unique ID if not provided
    if (!contributionData.id) {
      contributionData.id = `contribution-${Date.now()}`;
    }
    
    // Set default status if not provided
    if (!contributionData.status) {
      contributionData.status = 'pending';
    }
    
    // Set timestamp if not provided
    if (!contributionData.timestamp) {
      contributionData.timestamp = new Date().toISOString();
    }
    
    if (config.useMongoDb) {
      const contribution = new ContributionModel(contributionData);
      return contribution.save();
    } else {
      const contributions = await readJsonFile(CONTRIBUTIONS_FILE);
      contributions.push(contributionData);
      await writeJsonFile(CONTRIBUTIONS_FILE, contributions);
      return contributionData;
    }
  }

  // Update a contribution
  static async update(id, contributionData) {
    if (config.useMongoDb) {
      return ContributionModel.findOneAndUpdate(
        { id },
        contributionData,
        { new: true, runValidators: true }
      );
    } else {
      const contributions = await readJsonFile(CONTRIBUTIONS_FILE);
      const index = contributions.findIndex(c => c.id === id);
      
      if (index === -1) {
        return null;
      }
      
      contributions[index] = { ...contributions[index], ...contributionData };
      await writeJsonFile(CONTRIBUTIONS_FILE, contributions);
      return contributions[index];
    }
  }

  // Delete a contribution
  static async delete(id) {
    if (config.useMongoDb) {
      return ContributionModel.findOneAndDelete({ id });
    } else {
      const contributions = await readJsonFile(CONTRIBUTIONS_FILE);
      const index = contributions.findIndex(c => c.id === id);
      
      if (index === -1) {
        return null;
      }
      
      const deleted = contributions.splice(index, 1)[0];
      await writeJsonFile(CONTRIBUTIONS_FILE, contributions);
      return deleted;
    }
  }

  // Get contributions by status
  static async getByStatus(status) {
    if (config.useMongoDb) {
      return ContributionModel.find({ status }).sort({ timestamp: -1 });
    } else {
      const contributions = await readJsonFile(CONTRIBUTIONS_FILE);
      return contributions.filter(c => c.status === status);
    }
  }

  // Approve a contribution
  static async approve(id) {
    return this.update(id, { status: 'approved' });
  }

  // Reject a contribution
  static async reject(id) {
    return this.update(id, { status: 'rejected' });
  }
}

module.exports = Contribution; 