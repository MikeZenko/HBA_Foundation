const mongoose = require('mongoose');
const { readJsonFile, writeJsonFile, config } = require('../config/database');

// MongoDB Schema
const scholarshipSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
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
    required: true,
    trim: true,
  },
  targetGroup: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: [String],
    required: true,
  },
  deadline: {
    type: String,
    required: true,
    trim: true,
  },
  funding: {
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
  website: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  eligibility: {
    type: String,
    default: '',
  },
  applicationProcess: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// MongoDB Model
const ScholarshipModel = mongoose.model('Scholarship', scholarshipSchema);

// File-based operations
const SCHOLARSHIPS_FILE = 'scholarships.json';

// Scholarship class for both MongoDB and file-based operations
class Scholarship {
  // Get all scholarships
  static async getAll() {
    if (config.useMongoDb) {
      return ScholarshipModel.find().sort({ id: 1 });
    } else {
      return readJsonFile(SCHOLARSHIPS_FILE);
    }
  }

  // Get scholarship by ID
  static async getById(id) {
    if (config.useMongoDb) {
      return ScholarshipModel.findOne({ id: parseInt(id, 10) });
    } else {
      const scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      return scholarships.find(s => s.id === parseInt(id, 10));
    }
  }

  // Create a new scholarship
  static async create(scholarshipData) {
    if (config.useMongoDb) {
      const scholarship = new ScholarshipModel(scholarshipData);
      return scholarship.save();
    } else {
      const scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      
      // Generate ID if not provided
      if (!scholarshipData.id) {
        const maxId = scholarships.length > 0 ? Math.max(...scholarships.map(s => s.id)) : 0;
        scholarshipData.id = maxId + 1;
      }
      
      scholarships.push(scholarshipData);
      await writeJsonFile(SCHOLARSHIPS_FILE, scholarships);
      return scholarshipData;
    }
  }

  // Update a scholarship
  static async update(id, scholarshipData) {
    if (config.useMongoDb) {
      return ScholarshipModel.findOneAndUpdate(
        { id: parseInt(id, 10) },
        scholarshipData,
        { new: true, runValidators: true }
      );
    } else {
      const scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      const index = scholarships.findIndex(s => s.id === parseInt(id, 10));
      
      if (index === -1) {
        return null;
      }
      
      scholarships[index] = { ...scholarships[index], ...scholarshipData };
      await writeJsonFile(SCHOLARSHIPS_FILE, scholarships);
      return scholarships[index];
    }
  }

  // Delete a scholarship
  static async delete(id) {
    if (config.useMongoDb) {
      return ScholarshipModel.findOneAndDelete({ id: parseInt(id, 10) });
    } else {
      const scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      const index = scholarships.findIndex(s => s.id === parseInt(id, 10));
      
      if (index === -1) {
        return null;
      }
      
      const deleted = scholarships.splice(index, 1)[0];
      await writeJsonFile(SCHOLARSHIPS_FILE, scholarships);
      return deleted;
    }
  }

  // Search scholarships
  static async search(query) {
    if (config.useMongoDb) {
      return ScholarshipModel.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { organization: { $regex: query, $options: 'i' } },
          { hostCountry: { $regex: query, $options: 'i' } },
          { region: { $regex: query, $options: 'i' } },
          { targetGroup: { $regex: query, $options: 'i' } },
        ]
      });
    } else {
      const scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      const lowerQuery = query.toLowerCase();
      
      return scholarships.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) ||
        s.organization.toLowerCase().includes(lowerQuery) ||
        s.hostCountry.toLowerCase().includes(lowerQuery) ||
        s.region.toLowerCase().includes(lowerQuery) ||
        s.targetGroup.toLowerCase().includes(lowerQuery)
      );
    }
  }

  // Filter scholarships
  static async filter(filters) {
    let scholarships;
    
    if (config.useMongoDb) {
      const query = {};
      
      if (filters.region && filters.region !== 'all') {
        query.region = filters.region;
      }
      
      if (filters.level && filters.level !== 'all') {
        query.level = filters.level;
      }
      
      if (filters.funding && filters.funding !== 'all') {
        query.funding = filters.funding;
      }
      
      scholarships = await ScholarshipModel.find(query);
    } else {
      scholarships = await readJsonFile(SCHOLARSHIPS_FILE);
      
      if (filters.region && filters.region !== 'all') {
        scholarships = scholarships.filter(s => s.region === filters.region);
      }
      
      if (filters.level && filters.level !== 'all') {
        scholarships = scholarships.filter(s => s.level.includes(filters.level));
      }
      
      if (filters.funding && filters.funding !== 'all') {
        scholarships = scholarships.filter(s => s.funding === filters.funding);
      }
    }
    
    // Handle online/in-person filter
    if (filters.mode && filters.mode !== 'all') {
      if (filters.mode === 'Online') {
        scholarships = scholarships.filter(s => s.region === 'Online');
      } else {
        scholarships = scholarships.filter(s => s.region !== 'Online');
      }
    }
    
    return scholarships;
  }
}

module.exports = Scholarship; 