const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  try {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || generateRequestId();
    req.requestId = requestId;
    req.startTime = start;
    
    // Set request ID in response header (before any response is sent)
    if (!res.headersSent) {
      res.setHeader('X-Request-ID', requestId);
    }

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      try {
        const duration = Date.now() - start;
        
        // Log response completion with comprehensive data
        const logData = {
          requestId,
          method: req.method,
          url: req.originalUrl || req.url,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          contentLength: res.get('Content-Length') || '0',
          timestamp: new Date().toISOString()
        };
        
        if (res.statusCode >= 500) {
          logger.error(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        } else if (res.statusCode >= 400) {
          logger.warn(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        } else {
          logger.http(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        }
      } catch (logError) {
        // Don't let logging errors break the response
        console.error('Request logging error:', logError);
      }

      // Call original end method
      originalEnd.call(this, chunk, encoding);
    };

    next();
  } catch (error) {
    logger.logError(error, { module: 'requestLogger', operation: 'request_logging' });
    next(); // Continue even if logging fails
  }
};

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Add request ID to response headers
const addRequestId = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Log request body for debugging (only in development)
const logRequestBody = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body:', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      requestId: req.requestId
    });
  }
  next();
};

// Log query parameters
const logQueryParams = (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug('Query parameters:', {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      requestId: req.requestId
    });
  }
  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    logger.logPerformance(`${req.method} ${req.originalUrl}`, duration, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      requestId: req.requestId
    });
    
    // Alert on slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn(`SLOW REQUEST DETECTED: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`, {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        requestId: req.requestId
      });
    }
  });
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i
  ];
  
  const userInput = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      logger.logSecurity('Suspicious input detected', 'medium', {
        pattern: pattern.source,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId
      });
      break;
    }
  }
  
  next();
};

module.exports = {
  requestLogger,
  addRequestId,
  logRequestBody,
  logQueryParams,
  performanceMonitor,
  securityLogger
};
