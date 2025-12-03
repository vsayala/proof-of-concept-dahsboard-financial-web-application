const { getMongoDb } = require('../../config/database');
const logger = require('../../utils/logger');

class MongoService {
  constructor() {
    this.db = null;
  }

  /**
   * Get MongoDB database instance
   * @returns {Promise<Object>} MongoDB database
   */
  async getDatabase() {
    if (!this.db) {
      this.db = await getMongoDb();
    }
    return this.db;
  }

  /**
   * Execute a MongoDB aggregation pipeline
   * @param {string} collection - Collection name
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(collection, pipeline, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).aggregate(pipeline, options).toArray();
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('AGGREGATE', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('AGGREGATE', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Find documents in a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Query results
   */
  async find(collection, filter = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).find(filter, options).toArray();
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('FIND', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('FIND', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Find one document in a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query result
   */
  async findOne(collection, filter = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).findOne(filter, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('FINDONE', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('FINDONE', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Insert one document into a collection
   * @param {string} collection - Collection name
   * @param {Object} document - Document to insert
   * @param {Object} options - Insert options
   * @returns {Promise<Object>} Insert result
   */
  async insertOne(collection, document, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).insertOne(document, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERTONE', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERTONE', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Insert multiple documents into a collection
   * @param {string} collection - Collection name
   * @param {Array} documents - Documents to insert
   * @param {Object} options - Insert options
   * @returns {Promise<Object>} Insert result
   */
  async insertMany(collection, documents, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).insertMany(documents, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERTMANY', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('INSERTMANY', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Update one document in a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} update - Update operations
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateOne(collection, filter, update, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).updateOne(filter, update, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATEONE', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATEONE', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Update multiple documents in a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} update - Update operations
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateMany(collection, filter, update, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).updateMany(filter, update, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATEMANY', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('UPDATEMANY', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Delete one document from a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteOne(collection, filter, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).deleteOne(filter, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('DELETEONE', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('DELETEONE', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Delete multiple documents from a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(collection, filter, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).deleteMany(filter, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('DELETEMANY', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('DELETEMANY', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Count documents in a collection
   * @param {string} collection - Collection name
   * @param {Object} filter - Query filter
   * @param {Object} options - Count options
   * @returns {Promise<number>} Document count
   */
  async countDocuments(collection, filter = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      const db = await this.getDatabase();
      const result = await db.collection(collection).countDocuments(filter, options);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('COUNT', collection, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('COUNT', collection, duration, false, error);
      throw error;
    }
  }

  /**
   * Get system access logs from MongoDB
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} System access logs
   */
  async getSystemAccessLogs(filters = {}, limit = 100, offset = 0) {
    const pipeline = [];
    
    // Add match stage for filters
    const matchStage = {};
    if (filters.startDate || filters.endDate) {
      matchStage.timestamp = {};
      if (filters.startDate) {
        matchStage.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.userId) {
      matchStage.user_id = filters.userId;
    }
    
    if (filters.status) {
      matchStage.status = filters.status;
    }
    
    if (filters.ipAddress) {
      matchStage.ip_address = filters.ipAddress;
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add sort stage
    pipeline.push({ $sort: { timestamp: -1 } });
    
    // Add pagination stages
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    return await this.aggregate('system_access_logs', pipeline);
  }

  /**
   * Get audit trail data from MongoDB
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Audit trail data
   */
  async getAuditTrail(filters = {}, limit = 100, offset = 0) {
    const pipeline = [];
    
    // Add match stage for filters
    const matchStage = {};
    if (filters.startDate || filters.endDate) {
      matchStage.change_timestamp = {};
      if (filters.startDate) {
        matchStage.change_timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.change_timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.entityType) {
      matchStage.entity_type = filters.entityType;
    }
    
    if (filters.entityId) {
      matchStage.entity_id = filters.entityId;
    }
    
    if (filters.changedBy) {
      matchStage.changed_by = filters.changedBy;
    }
    
    if (filters.changeType) {
      matchStage.change_type = filters.changeType;
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add sort stage
    pipeline.push({ $sort: { change_timestamp: -1 } });
    
    // Add pagination stages
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    return await this.aggregate('audit_trail', pipeline);
  }

  /**
   * Get exception logs from MongoDB
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Exception logs
   */
  async getExceptionLogs(filters = {}, limit = 100, offset = 0) {
    const pipeline = [];
    
    // Add match stage for filters
    const matchStage = {};
    if (filters.startDate || filters.endDate) {
      matchStage.timestamp = {};
      if (filters.startDate) {
        matchStage.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.severity) {
      matchStage.severity = filters.severity;
    }
    
    if (filters.exceptionType) {
      matchStage.exception_type = filters.exceptionType;
    }
    
    if (filters.component) {
      matchStage.component = filters.component;
    }
    
    if (filters.status) {
      matchStage.resolved = filters.status === 'resolved';
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add sort stage
    pipeline.push({ $sort: { timestamp: -1 } });
    
    // Add pagination stages
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    return await this.aggregate('exception_logs', pipeline);
  }

  /**
   * Get process mining traces from MongoDB
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Process mining traces
   */
  async getProcessMiningTraces(filters = {}, limit = 100, offset = 0) {
    const pipeline = [];
    
    // Add match stage for filters
    const matchStage = {};
    if (filters.startDate || filters.endDate) {
      matchStage.start_time = {};
      if (filters.startDate) {
        matchStage.start_time.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.start_time.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.processName) {
      matchStage.process_name = filters.processName;
    }
    
    if (filters.status) {
      matchStage.status = filters.status;
    }
    
    if (filters.userId) {
      matchStage.user_id = filters.userId;
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add sort stage
    pipeline.push({ $sort: { start_time: -1 } });
    
    // Add pagination stages
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    return await this.aggregate('process_mining_traces', pipeline);
  }

  /**
   * Get communications data from MongoDB
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Communications data
   */
  async getCommunications(filters = {}, limit = 100, offset = 0) {
    const pipeline = [];
    
    // Add match stage for filters
    const matchStage = {};
    if (filters.startDate || filters.endDate) {
      matchStage.sent_date = {};
      if (filters.startDate) {
        matchStage.sent_date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.sent_date.$lte = new Date(filters.endDate);
      }
    }
    
    if (filters.type) {
      matchStage.type = filters.type;
    }
    
    if (filters.fromAddress) {
      matchStage.from_address = filters.fromAddress;
    }
    
    if (filters.toAddress) {
      matchStage.to_addresses = { $in: [filters.toAddress] };
    }
    
    if (filters.priority) {
      matchStage.priority = filters.priority;
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add sort stage
    pipeline.push({ $sort: { sent_date: -1 } });
    
    // Add pagination stages
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });
    
    return await this.aggregate('communications', pipeline);
  }

  /**
   * Test MongoDB connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const db = await this.getDatabase();
      await db.admin().ping();
      return true;
    } catch (error) {
      logger.error('MongoDB connection test failed:', error);
      return false;
    }
  }
}

module.exports = new MongoService();
