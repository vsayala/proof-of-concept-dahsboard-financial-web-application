const sql = require('mssql');
const { MongoClient } = require('mongodb');
const Redis = require('redis');
const logger = require('../utils/logger');

// SQL Server Configuration (Disabled by default)
const sqlConfig = {
  user: process.env.SQL_USER || 'sa',
  password: process.env.SQL_PASSWORD || 'YourStrong@Passw0rd',
  database: process.env.SQL_DATABASE || 'FinancialDashboard',
  server: process.env.SQL_SERVER || 'localhost',
  port: parseInt(process.env.SQL_PORT) || 1433,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.SQL_TRUST_CERT === 'true' || true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    // Additional options for containerized SQL Server
    instanceName: process.env.SQL_INSTANCE || undefined,
    connectionRetryInterval: 1000,
    maxRetriesOnFailure: 3
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
};

// Check if SQL Server is enabled
const SQL_ENABLED = process.env.SQL_ENABLED === 'true';

// MongoDB Configuration
const mongoConfig = {
  url: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/audit_data',
  database: process.env.MONGO_DATABASE || 'audit_data',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
};

// Redis Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3
};

// Delta Lake/Unity Catalog Configuration
const databricksConfig = {
  host: process.env.DATABRICKS_HOST,
  token: process.env.DATABRICKS_TOKEN,
  workspaceId: process.env.DATABRICKS_WORKSPACE_ID,
  catalog: process.env.DATABRICKS_CATALOG || 'hive_metastore',
  schema: process.env.DATABRICKS_SCHEMA || 'default'
};

// Azure Storage Configuration
const azureConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  containerName: process.env.AZURE_STORAGE_CONTAINER || 'audit-data'
};

// AWS S3 Configuration
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucketName: process.env.AWS_S3_BUCKET || 'audit-poc-data'
};

// Google Cloud Storage Configuration
const gcpConfig = {
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILENAME,
  bucketName: process.env.GCP_BUCKET_NAME || 'audit-poc-data'
};

// Database connection pools
let sqlPool = null;
let mongoClient = null;
let redisClient = null;

// Initialize SQL Server connection pool with retry logic
const initSqlPool = async (retryCount = 0, maxRetries = 5) => {
  const startTime = Date.now();
  
  try {
    if (!SQL_ENABLED) {
      const error = new Error('SQL Server is disabled. Set SQL_ENABLED=true to enable.');
      logger.logError(error, { module: 'database.js', operation: 'init_sql_pool', disabled: true });
      throw error;
    }
    
    if (!sqlPool) {
      logger.info(`🔄 Attempting to connect to SQL Server (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      try {
        sqlPool = await sql.connect(sqlConfig);
        const duration = Date.now() - startTime;
        logger.logPerformance('SQL Server connection', duration, { success: true, attempt: retryCount + 1 });
        logger.info('✅ SQL Server connection pool initialized');
      } catch (connectError) {
        logger.logError(connectError, { 
          module: 'database.js', 
          operation: 'sql_connect',
          attempt: retryCount + 1,
          maxRetries
        });
        throw connectError;
      }
    }
    return sqlPool;
  } catch (error) {
    logger.logError(error, { 
      module: 'database.js', 
      operation: 'init_sql_pool',
      attempt: retryCount + 1,
      maxRetries
    });
    
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      logger.warn(`⏳ Retrying SQL Server connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initSqlPool(retryCount + 1, maxRetries);
    }
    
    logger.error('❌ SQL Server connection failed after all retries');
    throw error;
  }
};

// Initialize MongoDB connection
const initMongoClient = async () => {
  const startTime = Date.now();
  
  try {
    if (!mongoClient) {
      try {
        logger.info(`🔄 Connecting to MongoDB at ${mongoConfig.url}...`);
        mongoClient = new MongoClient(mongoConfig.url, mongoConfig.options);
        
        await mongoClient.connect();
        const duration = Date.now() - startTime;
        logger.logPerformance('MongoDB connection', duration, { 
          success: true,
          url: mongoConfig.url,
          database: mongoConfig.database
        });
        logger.info('✅ MongoDB connection initialized');
      } catch (connectError) {
        const duration = Date.now() - startTime;
        logger.logError(connectError, { 
          module: 'database.js', 
          operation: 'mongodb_connect',
          url: mongoConfig.url,
          duration
        });
        throw connectError;
      }
    }
    
    try {
      const db = mongoClient.db(mongoConfig.database);
      // Test connection
      await db.admin().ping();
      logger.debug('MongoDB ping successful', { database: mongoConfig.database });
      return db;
    } catch (dbError) {
      logger.logError(dbError, { 
        module: 'database.js', 
        operation: 'mongodb_get_database',
        database: mongoConfig.database
      });
      throw dbError;
    }
  } catch (error) {
    logger.logError(error, { 
      module: 'database.js', 
      operation: 'init_mongodb',
      url: mongoConfig.url
    });
    throw error;
  }
};

// Initialize Redis connection
const initRedisClient = async () => {
  const startTime = Date.now();
  
  try {
    if (!redisClient) {
      try {
        logger.info(`🔄 Connecting to Redis at ${redisConfig.host}:${redisConfig.port}...`);
        redisClient = Redis.createClient(redisConfig);
        await redisClient.connect();
        const duration = Date.now() - startTime;
        logger.logPerformance('Redis connection', duration, { 
          success: true,
          host: redisConfig.host,
          port: redisConfig.port
        });
        logger.info('✅ Redis connection initialized');
      } catch (connectError) {
        const duration = Date.now() - startTime;
        logger.logError(connectError, { 
          module: 'database.js', 
          operation: 'redis_connect',
          host: redisConfig.host,
          port: redisConfig.port,
          duration
        });
        throw connectError;
      }
    }
    return redisClient;
  } catch (error) {
    logger.logError(error, { 
      module: 'database.js', 
      operation: 'init_redis',
      host: redisConfig.host,
      port: redisConfig.port
    });
    throw error;
  }
};

// Get SQL Server connection
const getSqlConnection = async () => {
  try {
    if (!sqlPool) {
      await initSqlPool();
    }
    return sqlPool;
  } catch (error) {
    logger.logError(error, { module: 'database.js', operation: 'get_sql_connection' });
    throw error;
  }
};

// Get MongoDB database
const getMongoDb = async () => {
  try {
    if (!mongoClient) {
      await initMongoClient();
    }
    const db = mongoClient.db(mongoConfig.database);
    return db;
  } catch (error) {
    logger.logError(error, { 
      module: 'database.js', 
      operation: 'get_mongodb',
      database: mongoConfig.database
    });
    throw error;
  }
};

// Get Redis client
const getRedisClient = async () => {
  try {
    if (!redisClient) {
      await initRedisClient();
    }
    return redisClient;
  } catch (error) {
    logger.logError(error, { module: 'database.js', operation: 'get_redis_client' });
    throw error;
  }
};

// Close all connections
const closeConnections = async () => {
  const startTime = Date.now();
  
  try {
    const closePromises = [];
    
    if (sqlPool) {
      try {
        closePromises.push(
          sqlPool.close().then(() => {
            logger.info('✅ SQL Server connections closed');
          }).catch(err => {
            logger.logError(err, { module: 'database.js', operation: 'close_sql' });
          })
        );
      } catch (error) {
        logger.logError(error, { module: 'database.js', operation: 'close_sql' });
      }
    }
    
    if (mongoClient) {
      try {
        closePromises.push(
          mongoClient.close().then(() => {
            logger.info('✅ MongoDB connections closed');
          }).catch(err => {
            logger.logError(err, { module: 'database.js', operation: 'close_mongodb' });
          })
        );
      } catch (error) {
        logger.logError(error, { module: 'database.js', operation: 'close_mongodb' });
      }
    }
    
    if (redisClient) {
      try {
        closePromises.push(
          redisClient.quit().then(() => {
            logger.info('✅ Redis connections closed');
          }).catch(err => {
            logger.logError(err, { module: 'database.js', operation: 'close_redis' });
          })
        );
      } catch (error) {
        logger.logError(error, { module: 'database.js', operation: 'close_redis' });
      }
    }
    
    await Promise.allSettled(closePromises);
    const duration = Date.now() - startTime;
    logger.logPerformance('Close all connections', duration, { success: true });
  } catch (error) {
    logger.logError(error, { module: 'database.js', operation: 'close_connections' });
  }
};

// Health check for all databases
const healthCheck = async () => {
  const startTime = Date.now();
  const results = {
    sql: false,
    mongodb: false,
    redis: false,
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Test SQL Server
  if (SQL_ENABLED) {
    try {
      const sqlStartTime = Date.now();
      const sqlConn = await getSqlConnection();
      await sqlConn.request().query('SELECT 1');
      const sqlDuration = Date.now() - sqlStartTime;
      results.sql = true;
      results.checks.sql = { status: 'healthy', duration: `${sqlDuration}ms` };
      logger.debug('SQL Server health check passed', { duration: sqlDuration });
    } catch (error) {
      logger.logError(error, { module: 'database.js', operation: 'health_check_sql' });
      results.checks.sql = { status: 'unhealthy', error: error.message };
    }
  } else {
    results.checks.sql = { status: 'disabled' };
  }

  // Test MongoDB
  try {
    const mongoStartTime = Date.now();
    const mongoDb = await getMongoDb();
    await mongoDb.admin().ping();
    const mongoDuration = Date.now() - mongoStartTime;
    results.mongodb = true;
    results.checks.mongodb = { status: 'healthy', duration: `${mongoDuration}ms` };
    logger.debug('MongoDB health check passed', { duration: mongoDuration });
  } catch (error) {
    logger.logError(error, { module: 'database.js', operation: 'health_check_mongodb' });
    results.checks.mongodb = { status: 'unhealthy', error: error.message };
  }

  // Test Redis
  try {
    const redisStartTime = Date.now();
    const redis = await getRedisClient();
    await redis.ping();
    const redisDuration = Date.now() - redisStartTime;
    results.redis = true;
    results.checks.redis = { status: 'healthy', duration: `${redisDuration}ms` };
    logger.debug('Redis health check passed', { duration: redisDuration });
  } catch (error) {
    logger.logError(error, { module: 'database.js', operation: 'health_check_redis' });
    results.checks.redis = { status: 'unhealthy', error: error.message };
  }

  const totalDuration = Date.now() - startTime;
  logger.logPerformance('Database health check', totalDuration, { results });
  
  return results;
};

module.exports = {
  // Configurations
  sqlConfig,
  mongoConfig,
  redisConfig,
  databricksConfig,
  azureConfig,
  awsConfig,
  gcpConfig,
  
  // Connection functions
  getSqlConnection,
  getMongoDb,
  getRedisClient,
  
  // Initialization
  initSqlPool,
  initMongoClient,
  initRedisClient,
  
  // Utility functions
  closeConnections,
  healthCheck
};
