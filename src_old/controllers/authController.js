const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      throw new ApiError(400, 'Username and password are required');
    }
    
    // Check if username already exists
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      throw new ApiError(409, 'Username already exists');
    }
    
    // Create user
    const userData = {
      username,
      password,
      name,
      email,
      role: role || 'viewer', // Default role is viewer
    };
    
    const user = await User.create(userData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      throw new ApiError(400, 'Username and password are required');
    }
    
    // Authenticate user
    const result = await User.authenticate(username, password);
    
    if (!result.success) {
      throw new ApiError(401, result.message || 'Invalid credentials');
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Update user
    const userData = {};
    if (name) userData.name = name;
    if (email) userData.email = email;
    if (password) userData.password = password;
    
    const user = await User.update(req.user.id, userData);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create initial admin user if no users exist
 */
const createInitialAdmin = async () => {
  try {
    const users = await User.getAll();
    
    if (users.length === 0) {
      console.log('No users found, creating initial admin user...');
      
      const adminUser = {
        username: 'admin',
        password: 'adminpassword', // This should be changed immediately
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin',
      };
      
      await User.create(adminUser);
      console.log('Initial admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  createInitialAdmin,
}; 