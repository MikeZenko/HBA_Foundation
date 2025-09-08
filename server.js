const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;

// Import configuration
const appConfig = require('./src/config/app');
const { connectDatabase } = require('./src/config/database');

// Import routes
const routes = require('./src/routes');

// Import middleware
const { errorConverter, errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import utilities
const logger = require('./src/utils/logger');
const { initializeData } = require('./src/utils/dataInitializer');
const { createInitialAdmin } = require('./src/controllers/authController');

// Create Express app
const app = express();

// Trust proxy for Vercel serverless environment
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, enable in production
}));

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors(appConfig.cors));

// Request logging
app.use(morgan(appConfig.logging.format, { stream: logger.stream }));

// Gzip compression
app.use(compression());

// Rate limiting
const limiter = rateLimit(appConfig.rateLimit);
app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve static files from root directory (for backward compatibility)
app.use(express.static(process.cwd(), {
  index: false // Prevent serving index.html from root
}));

// Mount API routes
app.use(routes);

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Serve admin.html for the /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin.html'));
});

// Handle 404 errors
app.use(notFound);

// Convert errors to ApiError
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

// Initialize data when app starts
const initializeAppData = async () => {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });
    
    // Connect to database
    await connectDatabase();
    
    // Initialize data
    await initializeData();
    
    // Create initial admin user if none exists
    await createInitialAdmin();
  } catch (error) {
    logger.error('Failed to initialize application data:', error);
  }
};

// Initialize data
initializeAppData();

// Export the app for Vercel (serverless)
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = appConfig.port;
  const HOST = appConfig.host;
  
  app.listen(PORT, HOST, () => {
    logger.info(`Server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    
    // Print available endpoints
    logger.info('Available API endpoints:');
    logger.info('- GET    /api/scholarships');
    logger.info('- GET    /api/scholarships/:id');
    logger.info('- GET    /api/scholarships/search');
    logger.info('- GET    /api/scholarships/filter');
    logger.info('- POST   /api/contributions');
    logger.info('- POST   /api/auth/login');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
} 