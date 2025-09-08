const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

// Configuration
const config = {
  useMongoDb: process.env.USE_MONGODB === 'true',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hba_foundation',
  dataDir: path.join(process.cwd(), 'data'),
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(config.dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Initialize database connection
async function connectDatabase() {
  if (config.useMongoDb) {
    try {
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  } else {
    await ensureDataDir();
    console.log('Using JSON file-based storage');
  }
}

// File-based database operations
async function readJsonFile(filename) {
  try {
    const filePath = path.join(config.dataDir, filename);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create it with empty array
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    return [];
  }
}

async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(config.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error);
    return false;
  }
}

module.exports = {
  config,
  connectDatabase,
  readJsonFile,
  writeJsonFile,
};
