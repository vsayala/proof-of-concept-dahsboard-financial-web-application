const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Import services
const sqlService = require('../services/sql/sqlService');
const mongoService = require('../services/mongodb/mongoService');
const deltaLakeService = require('../services/deltalake/deltaLakeService');
const flatFileService = require('../services/flatfiles/flatFileService');

const router = express.Router();

/**
 * @route GET /api/transactional/journal-entries
 * @desc Get journal entries from multiple data sources
 * @access Public
 */
router.get('/journal-entries', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      source = 'mongodb', 
      limit = 100, 
      offset = 0,
      startDate,
      endDate,
      status,
      createdBy,
      sourceConfig = {}
    } = req.query;

    let data = [];
    let sourceInfo = {};

    // Get data from specified source
    switch (source.toLowerCase()) {
      case 'sql':
        logger.logBusiness('Fetching journal entries from SQL Server', 'transactional', {
          filters: { startDate, endDate, status, createdBy },
          pagination: { limit, offset }
        });
        
        try {
          data = await sqlService.getJournalEntries(
            { startDate, endDate, status, createdBy },
            parseInt(limit),
            parseInt(offset)
          );
          sourceInfo = { type: 'SQL Server', connection: 'active' };
        } catch (sqlError) {
          logger.warn('SQL Server unavailable, falling back to MongoDB', sqlError.message);
          
          // Fallback to MongoDB if SQL Server is unavailable
          data = await mongoService.find('journal_entries', 
            { 
              ...(startDate && { date: { $gte: new Date(startDate) } }),
              ...(endDate && { date: { $lte: new Date(endDate) } }),
              ...(status && { status }),
              ...(createdBy && { created_by: createdBy })
            },
            { 
              limit: parseInt(limit), 
              skip: parseInt(offset),
              sort: { date: -1 }
            }
          );
          sourceInfo = { 
            type: 'MongoDB (Fallback)', 
            connection: 'active',
            fallbackReason: 'SQL Server unavailable'
          };
        }
        break;

      case 'mongodb':
        logger.logBusiness('Fetching journal entries from MongoDB', 'transactional', {
          filters: { startDate, endDate, status, createdBy },
          pagination: { limit, offset }
        });
        
        data = await mongoService.find('journal_entries', 
          { 
            ...(startDate && { date: { $gte: new Date(startDate) } }),
            ...(endDate && { date: { $lte: new Date(endDate) } }),
            ...(status && { status }),
            ...(createdBy && { created_by: createdBy })
          },
          { 
            limit: parseInt(limit), 
            skip: parseInt(offset),
            sort: { date: -1 }
          }
        );
        sourceInfo = { type: 'MongoDB', connection: 'active' };
        break;

      case 'deltalake':
        logger.logBusiness('Fetching journal entries from Delta Lake', 'transactional', {
          filters: { startDate, endDate, status, createdBy },
          pagination: { limit, offset }
        });
        
        // Note: Delta Lake would need specific table structure
        data = await deltaLakeService.executeQuery(`
          SELECT * FROM journal_entries 
          WHERE 1=1
          ${startDate ? `AND date >= '${startDate}'` : ''}
          ${endDate ? `AND date <= '${endDate}'` : ''}
          ${status ? `AND status = '${status}'` : ''}
          ${createdBy ? `AND created_by = '${createdBy}'` : ''}
          ORDER BY date DESC
          LIMIT ${limit} OFFSET ${offset}
        `);
        sourceInfo = { type: 'Delta Lake', connection: 'active' };
        break;

      case 'flatfiles':
        logger.logBusiness('Fetching journal entries from flat files', 'transactional', {
          filters: { startDate, endDate, status, createdBy },
          pagination: { limit, offset }
        });
        
        data = await flatFileService.getSupportingDocuments(
          { startDate, endDate, status, createdBy },
          sourceConfig.storageType || 'local',
          sourceConfig
        );
        sourceInfo = { type: 'Flat Files', connection: 'active' };
        break;

      default:
        return res.status(400).json({
          error: 'Invalid source specified',
          allowedSources: ['sql', 'mongodb', 'deltalake', 'flatfiles']
        });
    }

    // Transform data to match our JSON schema if needed
    const transformedData = data.map(item => ({
      entry_id: item.entry_id || item.entryId || item.id,
      date: item.date,
      description: item.description,
      debit_account: item.debit_account || item.debitAccount,
      credit_account: item.credit_account || item.creditAccount,
      amount: parseFloat(item.amount) || 0,
      currency: item.currency || 'USD',
      status: item.status,
      created_by: item.created_by || item.createdBy,
      created_at: item.created_at || item.createdAt,
      approved_by: item.approved_by || item.approvedBy,
      approved_at: item.approved_at || item.approvedAt
    }));

    const duration = Date.now() - startTime;
    logger.logPerformance('Journal entries API call', duration, {
      source,
      recordCount: transformedData.length,
      filters: { startDate, endDate, status, createdBy }
    });

    res.json({
      success: true,
      data: transformedData,
      metadata: {
        source: sourceInfo,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transformedData.length
        },
        filters: {
          startDate,
          endDate,
          status,
          createdBy
        },
        performance: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Failed to fetch journal entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch journal entries',
      message: error.message
    });
  }
}));

/**
 * @route GET /api/transactional/payments
 * @desc Get payments from multiple data sources
 * @access Public
 */
router.get('/payments', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      source = 'mongodb', 
      limit = 100, 
      offset = 0,
      startDate,
      endDate,
      paymentType,
      status,
      sourceConfig = {}
    } = req.query;

    let data = [];
    let sourceInfo = {};

    // Get data from specified source
    switch (source.toLowerCase()) {
      case 'sql':
        logger.logBusiness('Fetching payments from SQL Server', 'transactional', {
          filters: { startDate, endDate, paymentType, status },
          pagination: { limit, offset }
        });
        
        data = await sqlService.getPayments(
          { startDate, endDate, paymentType, status },
          parseInt(limit),
          parseInt(offset)
        );
        sourceInfo = { type: 'SQL Server', connection: 'active' };
        break;

      case 'mongodb':
        logger.logBusiness('Fetching payments from MongoDB', 'transactional', {
          filters: { startDate, endDate, paymentType, status },
          pagination: { limit, offset }
        });
        
        data = await mongoService.find('payments', 
          { 
            ...(startDate && { date: { $gte: new Date(startDate) } }),
            ...(endDate && { date: { $lte: new Date(endDate) } }),
            ...(paymentType && { payment_type: paymentType }),
            ...(status && { status })
          },
          { 
            limit: parseInt(limit), 
            skip: parseInt(offset),
            sort: { date: -1 }
          }
        );
        sourceInfo = { type: 'MongoDB', connection: 'active' };
        break;

      case 'flatfiles':
        logger.logBusiness('Fetching payments from flat files', 'transactional', {
          filters: { startDate, endDate, paymentType, status },
          pagination: { limit, offset }
        });
        
        data = await flatFileService.getSupportingDocuments(
          { startDate, endDate, paymentType, status },
          sourceConfig.storageType || 'local',
          sourceConfig
        );
        sourceInfo = { type: 'Flat Files', connection: 'active' };
        break;

      default:
        return res.status(400).json({
          error: 'Invalid source specified',
          allowedSources: ['sql', 'mongodb', 'flatfiles']
        });
    }

    // Transform data to match our JSON schema
    const transformedData = data.map(item => ({
      payment_id: item.payment_id || item.paymentId || item.id,
      date: item.date,
      payment_type: item.payment_type || item.paymentType,
      vendor_id: item.vendor_id || item.vendorId,
      customer_id: item.customer_id || item.customerId,
      invoice_id: item.invoice_id || item.invoiceId,
      amount: parseFloat(item.amount) || 0,
      currency: item.currency || 'USD',
      payment_method: item.payment_method || item.paymentMethod,
      reference_number: item.reference_number || item.referenceNumber,
      status: item.status,
      payment_status: item.payment_status || item.paymentStatus,
      processed_by: item.processed_by || item.processedBy,
      processed_at: item.processed_at || item.processedAt
    }));

    const duration = Date.now() - startTime;
    logger.logPerformance('Payments API call', duration, {
      source,
      recordCount: transformedData.length,
      filters: { startDate, endDate, paymentType, status }
    });

    res.json({
      success: true,
      data: transformedData,
      metadata: {
        source: sourceInfo,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transformedData.length
        },
        filters: {
          startDate,
          endDate,
          paymentType,
          status
        },
        performance: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Failed to fetch payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
}));

/**
 * @route GET /api/transactional/trades
 * @desc Get trades from multiple data sources
 * @access Public
 */
router.get('/trades', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      source = 'mongodb', 
      limit = 100, 
      offset = 0,
      startDate,
      endDate,
      instrumentType,
      symbol,
      status,
      sourceConfig = {}
    } = req.query;

    let data = [];
    let sourceInfo = {};

    // Get data from specified source
    switch (source.toLowerCase()) {
      case 'sql':
        logger.logBusiness('Fetching trades from SQL Server', 'transactional', {
          filters: { startDate, endDate, instrumentType, symbol, status },
          pagination: { limit, offset }
        });
        
        data = await sqlService.getTrades(
          { startDate, endDate, instrumentType, symbol, status },
          parseInt(limit),
          parseInt(offset)
        );
        sourceInfo = { type: 'SQL Server', connection: 'active' };
        break;

      case 'mongodb':
        logger.logBusiness('Fetching trades from MongoDB', 'transactional', {
          filters: { startDate, endDate, instrumentType, symbol, status },
          pagination: { limit, offset }
        });
        
        data = await mongoService.find('trades', 
          { 
            ...(startDate && { date: { $gte: new Date(startDate) } }),
            ...(endDate && { date: { $lte: new Date(endDate) } }),
            ...(instrumentType && { instrument_type: instrumentType }),
            ...(symbol && { symbol }),
            ...(status && { status })
          },
          { 
            limit: parseInt(limit), 
            skip: parseInt(offset),
            sort: { date: -1 }
          }
        );
        sourceInfo = { type: 'MongoDB', connection: 'active' };
        break;

      case 'flatfiles':
        logger.logBusiness('Fetching trades from flat files', 'transactional', {
          filters: { startDate, endDate, instrumentType, symbol, status },
          pagination: { limit, offset }
        });
        
        data = await flatFileService.getSupportingDocuments(
          { startDate, endDate, instrumentType, symbol, status },
          sourceConfig.storageType || 'local',
          sourceConfig
        );
        sourceInfo = { type: 'Flat Files', connection: 'active' };
        break;

      default:
        return res.status(400).json({
          error: 'Invalid source specified',
          allowedSources: ['sql', 'mongodb', 'flatfiles']
        });
    }

    // Transform data to match our JSON schema
    const transformedData = data.map(item => ({
      trade_id: item.trade_id || item.tradeId || item.id,
      date: item.date,
      instrument_type: item.instrument_type || item.instrumentType,
      symbol: item.symbol,
      quantity: parseInt(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      trade_type: item.trade_type || item.tradeType,
      total_amount: parseFloat(item.total_amount || item.totalAmount) || 0,
      currency: item.currency || 'USD',
      broker: item.broker,
      account_id: item.account_id || item.accountId,
      status: item.status,
      executed_at: item.executed_at || item.executedAt,
      trader_id: item.trader_id || item.traderId
    }));

    const duration = Date.now() - startTime;
    logger.logPerformance('Trades API call', duration, {
      source,
      recordCount: transformedData.length,
      filters: { startDate, endDate, instrumentType, symbol, status }
    });

    res.json({
      success: true,
      data: transformedData,
      metadata: {
        source: sourceInfo,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: transformedData.length
        },
        filters: {
          startDate,
          endDate,
          instrumentType,
          symbol,
          status
        },
        performance: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Failed to fetch trades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trades',
      message: error.message
    });
  }
}));

/**
 * @route GET /api/transactional/sources
 * @desc Get available data sources and their status
 * @access Public
 */
router.get('/sources', asyncHandler(async (req, res) => {
  try {
    const sources = {
      sql: {
        name: 'SQL Server',
        type: 'relational',
        status: 'unknown',
        capabilities: ['journal_entries', 'payments', 'trades', 'master_data']
      },
      mongodb: {
        name: 'MongoDB',
        type: 'document',
        status: 'unknown',
        capabilities: ['system_logs', 'audit_trail', 'exception_logs', 'process_traces']
      },
      deltalake: {
        name: 'Delta Lake',
        type: 'data_lake',
        status: 'unknown',
        capabilities: ['financial_reports', 'external_data']
      },
      flatfiles: {
        name: 'Flat Files',
        type: 'file_storage',
        status: 'unknown',
        capabilities: ['supporting_docs', 'invoices', 'contracts', 'tax_forms']
      }
    };

    // Test connections for each source
    try {
      sources.sql.status = await sqlService.testConnection() ? 'connected' : 'disconnected';
    } catch (error) {
      sources.sql.status = 'error';
      sources.sql.error = error.message;
    }

    try {
      sources.mongodb.status = await mongoService.testConnection() ? 'connected' : 'disconnected';
    } catch (error) {
      sources.mongodb.status = 'error';
      sources.mongodb.error = error.message;
    }

    try {
      sources.deltalake.status = await deltaLakeService.testConnection() ? 'connected' : 'disconnected';
    } catch (error) {
      sources.deltalake.status = 'error';
      sources.deltalake.error = error.message;
    }

    try {
      const flatFileStatus = await flatFileService.testConnections();
      sources.flatfiles.status = Object.values(flatFileStatus).some(status => status) ? 'connected' : 'disconnected';
      sources.flatfiles.details = flatFileStatus;
    } catch (error) {
      sources.flatfiles.status = 'error';
      sources.flatfiles.error = error.message;
    }

    res.json({
      success: true,
      data: sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get data sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get data sources',
      message: error.message
    });
  }
}));

/**
 * @route GET /api/transactional/health
 * @desc Health check for transactional data sources
 * @access Public
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      sources: {}
    };

    // Check SQL Server
    try {
      health.sources.sql = {
        status: await sqlService.testConnection() ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      health.sources.sql = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }

    // Check MongoDB
    try {
      health.sources.mongodb = {
        status: await mongoService.testConnection() ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      health.sources.mongodb = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }

    // Check Delta Lake
    try {
      health.sources.deltalake = {
        status: await deltaLakeService.testConnection() ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      health.sources.deltalake = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }

    // Check Flat Files
    try {
      const flatFileHealth = await flatFileService.testConnections();
      health.sources.flatfiles = {
        status: Object.values(flatFileHealth).some(status => status) ? 'healthy' : 'unhealthy',
        details: flatFileHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      health.sources.flatfiles = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }

    // Overall status
    const unhealthySources = Object.values(health.sources).filter(source => source.status === 'unhealthy');
    if (unhealthySources.length > 0) {
      health.status = 'degraded';
    }

    res.json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = router;
