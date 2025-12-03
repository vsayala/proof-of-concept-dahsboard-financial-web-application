const logger = require('../utils/logger');

// Custom error class for API errors
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

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  try {
    let { statusCode, message } = err;
    
    // Log the error with comprehensive context
    logger.logError(err, {
      module: 'errorHandler',
      operation: 'handle_error',
      url: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId || req.id,
      body: process.env.NODE_ENV === 'development' ? req.body : undefined,
      query: req.query,
      params: req.params
    });

  // If status code is not set, default to 500
  if (!statusCode) {
    statusCode = 500;
  }

  // If message is not set, set default message based on status code
  if (!message) {
    switch (statusCode) {
      case 400:
        message = 'Bad Request';
        break;
      case 401:
        message = 'Unauthorized';
        break;
      case 403:
        message = 'Forbidden';
        break;
      case 404:
        message = 'Not Found';
        break;
      case 409:
        message = 'Conflict';
        break;
      case 422:
        message = 'Unprocessable Entity';
        break;
      case 429:
        message = 'Too Many Requests';
        break;
      case 500:
        message = 'Internal Server Error';
        break;
      case 502:
        message = 'Bad Gateway';
        break;
      case 503:
        message = 'Service Unavailable';
        break;
      default:
        message = 'Something went wrong';
    }
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Add stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Add additional error details for specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error.details = err.details;
    errorResponse.error.type = 'ValidationError';
  }

  if (err.name === 'DatabaseError') {
    errorResponse.error.type = 'DatabaseError';
    errorResponse.error.code = err.code;
  }

  if (err.name === 'AuthenticationError') {
    errorResponse.error.type = 'AuthenticationError';
  }

  if (err.name === 'AuthorizationError') {
    errorResponse.error.type = 'AuthorizationError';
  }

    // Set response status and send error
    try {
      res.status(statusCode).json(errorResponse);
    } catch (responseError) {
      logger.logError(responseError, { 
        module: 'errorHandler', 
        operation: 'send_error_response',
        originalError: err.message
      });
      // Fallback response
      res.status(500).json({
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (handlerError) {
    // Last resort error handling
    logger.logError(handlerError, { 
      module: 'errorHandler', 
      operation: 'error_handler_itself_failed',
      fatal: true
    });
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
};

// Async error wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error handler
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new ApiError(400, message);
};

// Database error handler
const handleDatabaseError = (err) => {
  let message = 'Database error occurred';
  let statusCode = 500;

  if (err.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry found';
    statusCode = 409;
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    message = 'Referenced record not found';
    statusCode = 400;
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    message = 'Cannot delete referenced record';
    statusCode = 400;
  }

  return new ApiError(statusCode, message);
};

// JWT error handler
const handleJWTError = () => new ApiError(401, 'Invalid token');

const handleJWTExpiredError = () => new ApiError(401, 'Token expired');

// Rate limit error handler
const handleRateLimitError = (err) => {
  return new ApiError(429, err.message);
};

// File upload error handler
const handleFileUploadError = (err) => {
  let message = 'File upload error';
  let statusCode = 400;

  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File too large';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field';
  }

  return new ApiError(statusCode, message);
};

// Not found error handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

// Global error handler for unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  handleValidationError,
  handleDatabaseError,
  handleJWTError,
  handleJWTExpiredError,
  handleRateLimitError,
  handleFileUploadError,
  notFound
};
