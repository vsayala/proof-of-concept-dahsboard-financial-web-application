const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { initMongoClient } = require('./config/database');

// Import existing routes with error handling
let transactionalRoutes, complianceRoutes, riskAssessmentRoutes, chatbotRoutes;

try {
  transactionalRoutes = require('./controllers/transactionalController');
  logger.debug('✅ Transactional controller loaded');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'load_transactional_controller' });
  transactionalRoutes = express.Router();
}

try {
  complianceRoutes = require('./controllers/complianceController');
  logger.debug('✅ Compliance controller loaded');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'load_compliance_controller' });
  complianceRoutes = express.Router();
}

try {
  riskAssessmentRoutes = require('./controllers/riskAssessmentController');
  logger.debug('✅ Risk assessment controller loaded');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'load_risk_controller' });
  riskAssessmentRoutes = express.Router();
}

try {
  chatbotRoutes = require('./controllers/chatbotController');
  logger.debug('✅ Chatbot controller loaded');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'load_chatbot_controller' });
  chatbotRoutes = express.Router();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
try {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));
  logger.debug('✅ Helmet security middleware configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_helmet' });
}

// Rate limiting
try {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  logger.debug('✅ Rate limiting configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_rate_limit' });
}

// CORS configuration
try {
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  logger.debug('✅ CORS configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_cors' });
}

// Body parsing middleware
try {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  logger.debug('✅ Body parsing middleware configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_body_parser' });
}

// Compression middleware
try {
  app.use(compression());
  logger.debug('✅ Compression middleware configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_compression' });
}

// Logging middleware
try {
  app.use(morgan('combined', { 
    stream: { 
      write: (message) => {
        try {
          logger.info(message.trim());
        } catch (logError) {
          console.error('Logging error:', logError);
        }
      }
    } 
  }));
  app.use(requestLogger);
  logger.debug('✅ Logging middleware configured');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'configure_logging' });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };
    
    logger.debug('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
    res.status(200).json(healthData);
  } catch (error) {
    logger.logError(error, { module: 'app.js', operation: 'health_check' });
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes with error handling
try {
  app.use('/api/transactional', transactionalRoutes);
  logger.debug('✅ Transactional routes registered');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'register_transactional_routes' });
}

try {
  app.use('/api/compliance', complianceRoutes);
  logger.debug('✅ Compliance routes registered');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'register_compliance_routes' });
}

try {
  app.use('/api/risk-assessment', riskAssessmentRoutes);
  logger.debug('✅ Risk assessment routes registered');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'register_risk_routes' });
}

try {
  app.use('/api/chatbot', chatbotRoutes);
  logger.debug('✅ Chatbot routes registered');
} catch (error) {
  logger.logError(error, { module: 'app.js', operation: 'register_chatbot_routes' });
}

// Placeholder routes for missing controllers
app.use('/api/master-data', (req, res) => {
  res.json({ message: 'Master Data API - Coming Soon', status: 'placeholder' });
});

app.use('/api/supporting-docs', (req, res) => {
  res.json({ message: 'Supporting Docs API - Coming Soon', status: 'placeholder' });
});

app.use('/api/system-logs', (req, res) => {
  res.json({ message: 'System Logs API - Coming Soon', status: 'placeholder' });
});

app.use('/api/audit-trail', (req, res) => {
  res.json({ message: 'Audit Trail API - Coming Soon', status: 'placeholder' });
});

// Compliance API is now implemented above - placeholder removed

app.use('/api/operational', (req, res) => {
  res.json({ message: 'Operational API - Coming Soon', status: 'placeholder' });
});

app.use('/api/financial-reports', (req, res) => {
  res.json({ message: 'Financial Reports API - Coming Soon', status: 'placeholder' });
});

app.use('/api/external-data', (req, res) => {
  res.json({ message: 'External Data API - Coming Soon', status: 'placeholder' });
});

app.use('/api/communications', (req, res) => {
  res.json({ message: 'Communications API - Coming Soon', status: 'placeholder' });
});

app.use('/api/metadata', (req, res) => {
  res.json({ message: 'Metadata API - Coming Soon', status: 'placeholder' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Audit POC API Services',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      transactional: '/api/transactional',
      masterData: '/api/master-data',
      supportingDocs: '/api/supporting-docs',
      systemLogs: '/api/system-logs',
      auditTrail: '/api/audit-trail',
      compliance: '/api/compliance',
      operational: '/api/operational',
      financialReports: '/api/financial-reports',
      externalData: '/api/external-data',
      communications: '/api/communications',
      metadata: '/api/metadata'
    },
    status: 'running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/transactional',
      '/api/master-data',
      '/api/supporting-docs',
      '/api/system-logs',
      '/api/audit-trail',
      '/api/compliance',
      '/api/operational',
      '/api/financial-reports',
      '/api/external-data',
      '/api/communications',
      '/api/metadata'
    ]
  });
});

// Global error handling middleware
app.use(errorHandler);

// Initialize database connections and start server
async function startServer() {
  const startTime = Date.now();
  
  try {
    logger.logStartup('Audit POC API Server', PORT, process.env.NODE_ENV || 'development');
    
    // Initialize MongoDB connection
    try {
      const mongoStartTime = Date.now();
      await initMongoClient();
      const mongoDuration = Date.now() - mongoStartTime;
      logger.logPerformance('MongoDB initialization', mongoDuration, { success: true });
      logger.info('✅ MongoDB connection initialized');
    } catch (mongoError) {
      logger.logError(mongoError, { 
        module: 'app.js', 
        operation: 'init_mongodb',
        retry: true
      });
      logger.warn('⚠️  MongoDB connection failed, will retry on first request');
    }

    // Start server
    try {
      const server = app.listen(PORT, () => {
        const startupDuration = Date.now() - startTime;
        logger.logPerformance('Server startup', startupDuration, { success: true });
        logger.info(`🚀 Audit POC API Server started on port ${PORT}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
        logger.info(`📝 Logs: logs/audit-poc.log`);
      });

      // Graceful shutdown handlers
      const gracefulShutdown = async (signal) => {
        logger.logShutdown('Audit POC API Server', signal);
        try {
          server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
          });
          
          // Force close after 10 seconds
          setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
          }, 10000);
        } catch (error) {
          logger.logError(error, { module: 'app.js', operation: 'graceful_shutdown' });
          process.exit(1);
        }
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      
    } catch (serverError) {
      logger.logError(serverError, { module: 'app.js', operation: 'start_server' });
      throw serverError;
    }
  } catch (error) {
    const startupDuration = Date.now() - startTime;
    logger.logError(error, { 
      module: 'app.js', 
      operation: 'start_server',
      duration: startupDuration,
      fatal: true
    });
    logger.error('❌ Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
