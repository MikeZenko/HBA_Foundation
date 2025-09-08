const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJsonFile, writeJsonFile, config } = require('../config/database');
const appConfig = require('../config/app');

// MongoDB Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const user = this;
  const token = jwt.sign(
    { id: user._id.toString(), username: user.username, role: user.role },
    appConfig.jwt.secret,
    { expiresIn: appConfig.jwt.expiresIn }
  );
  
  return token;
};

// MongoDB Model
const UserModel = mongoose.model('User', userSchema);

// File-based operations
const USERS_FILE = 'users.json';

// User class for both MongoDB and file-based operations
class User {
  // Get all users
  static async getAll() {
    if (config.useMongoDb) {
      return UserModel.find().select('-password');
    } else {
      const users = await readJsonFile(USERS_FILE);
      return users.map(({ password, ...user }) => user);
    }
  }

  // Get user by ID
  static async getById(id) {
    if (config.useMongoDb) {
      return UserModel.findById(id).select('-password');
    } else {
      const users = await readJsonFile(USERS_FILE);
      const user = users.find(u => u.id === id);
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    }
  }

  // Get user by username
  static async getByUsername(username) {
    if (config.useMongoDb) {
      return UserModel.findOne({ username });
    } else {
      const users = await readJsonFile(USERS_FILE);
      return users.find(u => u.username === username);
    }
  }

  // Create a new user
  static async create(userData) {
    if (config.useMongoDb) {
      const user = new UserModel(userData);
      await user.save();
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } else {
      const users = await readJsonFile(USERS_FILE);
      
      // Check if username already exists
      const existingUser = users.find(u => u.username === userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      // Generate ID if not provided
      if (!userData.id) {
        userData.id = `user-${Date.now()}`;
      }
      
      // Hash password
      userData.password = await bcrypt.hash(userData.password, 10);
      
      // Add timestamps
      userData.createdAt = new Date().toISOString();
      userData.updatedAt = new Date().toISOString();
      
      users.push(userData);
      await writeJsonFile(USERS_FILE, users);
      
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    }
  }

  // Update a user
  static async update(id, userData) {
    if (config.useMongoDb) {
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const user = await UserModel.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
      if (!user) return null;
      
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } else {
      const users = await readJsonFile(USERS_FILE);
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      // Update timestamp
      userData.updatedAt = new Date().toISOString();
      
      users[index] = { ...users[index], ...userData };
      await writeJsonFile(USERS_FILE, users);
      
      const { password, ...userWithoutPassword } = users[index];
      return userWithoutPassword;
    }
  }

  // Delete a user
  static async delete(id) {
    if (config.useMongoDb) {
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) return null;
      
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } else {
      const users = await readJsonFile(USERS_FILE);
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        return null;
      }
      
      const deleted = users.splice(index, 1)[0];
      await writeJsonFile(USERS_FILE, users);
      
      const { password, ...userWithoutPassword } = deleted;
      return userWithoutPassword;
    }
  }

  // Authenticate user
  static async authenticate(username, password) {
    let user;
    
    if (config.useMongoDb) {
      user = await UserModel.findOne({ username });
    } else {
      const users = await readJsonFile(USERS_FILE);
      user = users.find(u => u.username === username);
    }
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Update last login
    const lastLogin = new Date();
    
    if (config.useMongoDb) {
      await UserModel.updateOne({ _id: user._id }, { lastLogin });
      user.lastLogin = lastLogin;
    } else {
      user.lastLogin = lastLogin.toISOString();
      await this.update(user.id, { lastLogin: user.lastLogin });
    }
    
    // Generate token
    let token;
    if (config.useMongoDb) {
      token = user.generateAuthToken();
    } else {
      token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        appConfig.jwt.secret,
        { expiresIn: appConfig.jwt.expiresIn }
      );
    }
    
    return {
      success: true,
      token,
      user: config.useMongoDb ? 
        { id: user._id, username: user.username, role: user.role } :
        { id: user.id, username: user.username, role: user.role }
    };
  }
}

module.exports = User; 