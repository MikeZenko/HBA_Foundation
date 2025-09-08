const path = require('path');

// Environment configuration
const env = process.env.NODE_ENV || 'development';

// Base configuration
const config = {
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
  
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  
  // Security
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Static files
  staticFiles: {
    rootPath: path.join(process.cwd(), 'public'),
    options: {
      maxAge: env === 'production' ? '1d' : 0,
      etag: true,
    },
  },
  
  // Logging
  logging: {
    level: env === 'production' ? 'info' : 'debug',
    format: env === 'production' ? 'combined' : 'dev',
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'hba-foundation-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'hba-foundation-jwt-secret',
    expiresIn: '1d',
  },
};

module.exports = config; 