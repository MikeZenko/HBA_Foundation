const appConfig = require('../config/app');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error converter middleware
 * Converts regular errors to ApiError for consistent handling
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Error handler middleware
 * Handles all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // If in production, don't send stack trace for non-operational errors
  if (appConfig.isProduction && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  const response = {
    error: true,
    code: statusCode,
    message,
    ...(appConfig.isDevelopment && { stack: err.stack }),
  };
  
  // Log error
  console.error(err);
  
  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ApiError,
  errorConverter,
  errorHandler,
  notFound,
}; 