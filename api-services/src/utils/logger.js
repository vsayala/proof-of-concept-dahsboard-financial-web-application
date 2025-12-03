const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure unified logs directory exists
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan'
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Enhanced format with comprehensive information
const detailedFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0 && meta.constructor === Object) {
      const metaStr = JSON.stringify(meta, null, 2);
      if (metaStr !== '{}') {
        log += `\n${metaStr}`;
      }
    }
    
    return log;
  })
);

// Unified log file - single file for everything
const unifiedLogFile = path.join(logsDir, 'audit-poc.log');

// Create unified logger with single log file
const logger = winston.createLogger({
  level: level(),
  levels,
  format: detailedFormat,
  transports: [
    // Console output with colors
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    }),
    
    // Unified log file - captures everything
    new winston.transports.File({
      filename: unifiedLogFile,
      format: detailedFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10, // Keep 10 rotated files
      tailable: true,
      handleExceptions: true,
      handleRejections: true
    })
  ],
  exitOnError: false
});

// Enhanced logging methods with comprehensive context

/**
 * Log application startup
 */
logger.logStartup = (serviceName, port, environment) => {
  logger.info('='.repeat(80));
  logger.info(`🚀 ${serviceName} STARTING`, {
    service: serviceName,
    port,
    environment,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
  logger.info('='.repeat(80));
};

/**
 * Log application shutdown
 */
logger.logShutdown = (serviceName, reason) => {
  logger.info('='.repeat(80));
  logger.info(`🛑 ${serviceName} SHUTTING DOWN`, {
    service: serviceName,
    reason,
    timestamp: new Date().toISOString()
  });
  logger.info('='.repeat(80));
};

/**
 * Log HTTP requests with full context
 */
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  const requestId = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      query: req.query,
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
  });
  
  if (next) next();
  return logger;
};

/**
 * Log database operations with full context
 */
logger.logDbOperation = (operation, collection, duration, success, error = null, metadata = {}) => {
  const logData = {
    operation,
    collection,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (success) {
    logger.debug(`DB ${operation} on ${collection} - SUCCESS (${duration}ms)`, logData);
  } else {
    logData.error = {
      message: error?.message || String(error),
      stack: error?.stack,
      code: error?.code,
      name: error?.name
    };
    logger.error(`DB ${operation} on ${collection} - FAILED (${duration}ms) - Error: ${error?.message || error}`, logData);
  }
};

/**
 * Log performance metrics
 */
logger.logPerformance = (operation, duration, metadata = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (duration > 5000) {
    logger.error(`PERFORMANCE CRITICAL: ${operation} took ${duration}ms`, logData);
  } else if (duration > 2000) {
    logger.warn(`PERFORMANCE WARNING: ${operation} took ${duration}ms`, logData);
  } else if (duration > 1000) {
    logger.warn(`PERFORMANCE SLOW: ${operation} took ${duration}ms`, logData);
  } else if (duration > 500) {
    logger.info(`PERFORMANCE MODERATE: ${operation} took ${duration}ms`, logData);
  } else {
    logger.debug(`PERFORMANCE: ${operation} took ${duration}ms`, logData);
  }
};

/**
 * Log audit events
 */
logger.logAudit = (action, entity, entityId, userId, details = {}) => {
  const auditData = {
    type: 'AUDIT',
    action,
    entity,
    entityId,
    userId,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    requestId: details.requestId,
    additionalInfo: details.additionalInfo || {}
  };
  
  logger.info(`AUDIT: ${action} on ${entity} ${entityId} by user ${userId}`, auditData);
};

/**
 * Log security events
 */
logger.logSecurity = (event, level, details = {}) => {
  const securityData = {
    type: 'SECURITY',
    event,
    level,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  switch (level) {
    case 'critical':
      logger.error(`SECURITY CRITICAL: ${event}`, securityData);
      break;
    case 'high':
      logger.error(`SECURITY HIGH: ${event}`, securityData);
      break;
    case 'medium':
      logger.warn(`SECURITY MEDIUM: ${event}`, securityData);
      break;
    case 'low':
      logger.info(`SECURITY LOW: ${event}`, securityData);
      break;
    default:
      logger.info(`SECURITY: ${event}`, securityData);
  }
};

/**
 * Log business events
 */
logger.logBusiness = (event, category, details = {}) => {
  const businessData = {
    type: 'BUSINESS',
    event,
    category,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  logger.info(`BUSINESS: ${category} - ${event}`, businessData);
};

/**
 * Log errors with full context
 */
logger.logError = (error, context = {}) => {
  const errorData = {
    type: 'ERROR',
    message: error?.message || String(error),
    stack: error?.stack,
    name: error?.name,
    code: error?.code,
    timestamp: new Date().toISOString(),
    ...context
  };
  
  logger.error(`ERROR: ${error?.message || error}`, errorData);
};

/**
 * Log API calls
 */
logger.logApiCall = (method, url, statusCode, duration, metadata = {}) => {
  const apiData = {
    type: 'API_CALL',
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (statusCode >= 500) {
    logger.error(`API CALL FAILED: ${method} ${url} - ${statusCode} (${duration}ms)`, apiData);
  } else if (statusCode >= 400) {
    logger.warn(`API CALL ERROR: ${method} ${url} - ${statusCode} (${duration}ms)`, apiData);
  } else {
    logger.info(`API CALL: ${method} ${url} - ${statusCode} (${duration}ms)`, apiData);
  }
};

/**
 * Log LLM operations
 */
logger.logLLM = (operation, model, duration, success, metadata = {}) => {
  const llmData = {
    type: 'LLM',
    operation,
    model,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (success) {
    logger.info(`LLM: ${operation} using ${model} - SUCCESS (${duration}ms)`, llmData);
  } else {
    logger.error(`LLM: ${operation} using ${model} - FAILED (${duration}ms)`, llmData);
  }
};

/**
 * Log data operations
 */
logger.logDataOperation = (operation, source, recordCount, duration, success, metadata = {}) => {
  const dataData = {
    type: 'DATA_OPERATION',
    operation,
    source,
    recordCount,
    duration: `${duration}ms`,
    success,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (success) {
    logger.info(`DATA: ${operation} from ${source} - ${recordCount} records (${duration}ms)`, dataData);
  } else {
    logger.error(`DATA: ${operation} from ${source} - FAILED (${duration}ms)`, dataData);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.logError(error, {
    type: 'UNCAUGHT_EXCEPTION',
    fatal: true
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.logError(reason, {
    type: 'UNHANDLED_REJECTION',
    promise: promise.toString(),
    fatal: true
  });
});

module.exports = logger;
