const { getSqlConnection } = require('../../config/database');
const logger = require('../../utils/logger');

class SqlService {
  constructor() {
    this.pool = null;
  }

  /**
   * Execute a SQL query with parameters
   * @param {string} query - SQL query string
   * @param {Array} params - Query parameters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Query results
   */
  async executeQuery(query, params = [], options = {}) {
    const startTime = Date.now();
    let connection;
    
    try {
      connection = await getSqlConnection();
      
      // Check if connection is still alive
      if (!connection.connected) {
        logger.warn('SQL connection lost, attempting to reconnect...');
        connection = await getSqlConnection();
      }
      
      const request = connection.request();
      
      // Add parameters to the request
      params.forEach((param, index) => {
        if (param.type && param.value !== undefined) {
          request.input(`param${index}`, param.type, param.value);
        } else {
          request.input(`param${index}`, param);
        }
      });

      // Execute query
      const result = await request.query(query);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'SQL', duration, true);
      
      return result.recordset;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'SQL', duration, false, error);
      
      // Handle specific SQL Server errors
      if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
        logger.error('SQL Server connection error - service may be unavailable');
        throw new Error('Database service temporarily unavailable. Please try again later.');
      }
      
      throw error;
    }
  }

  /**
   * Execute a stored procedure
   * @param {string} procedureName - Name of the stored procedure
   * @param {Array} params - Procedure parameters
   * @returns {Promise<Object>} Procedure results
   */
  async executeStoredProcedure(procedureName, params = []) {
    const startTime = Date.now();
    let connection;
    
    try {
      connection = await getSqlConnection();
      
      const request = connection.request();
      
      // Add parameters to the request
      params.forEach((param, index) => {
        if (param.type && param.value !== undefined) {
          request.input(`param${index}`, param.type, param.value);
        } else {
          request.input(`param${index}`, param);
        }
      });

      // Execute stored procedure
      const result = await request.execute(procedureName);
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('EXEC', procedureName, duration, true);
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('EXEC', procedureName, duration, false, error);
      throw error;
    }
  }

  /**
   * Execute a transaction with multiple queries
   * @param {Array} queries - Array of query objects
   * @returns {Promise<Array>} Results from all queries
   */
  async executeTransaction(queries) {
    const startTime = Date.now();
    let connection;
    let transaction;
    
    try {
      connection = await getSqlConnection();
      transaction = new connection.Transaction(connection);
      await transaction.begin();
      
      const results = [];
      
      for (const queryObj of queries) {
        const request = new connection.Request(transaction);
        
        // Add parameters if they exist
        if (queryObj.params) {
          queryObj.params.forEach((param, index) => {
            if (param.type && param.value !== undefined) {
              request.input(`param${index}`, param.type, param.value);
            } else {
              request.input(`param${index}`, param);
            }
          });
        }
        
        const result = await request.query(queryObj.query);
        results.push(result.recordset);
      }
      
      await transaction.commit();
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('TRANSACTION', 'SQL', duration, true);
      
      return results;
      
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      
      const duration = Date.now() - startTime;
      logger.logDbOperation('TRANSACTION', 'SQL', duration, false, error);
      throw error;
    }
  }

  /**
   * Get journal entries from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Journal entries
   */
  async getJournalEntries(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        entry_id,
        date,
        description,
        debit_account,
        credit_account,
        amount,
        currency,
        status,
        created_by,
        created_at,
        approved_by,
        approved_at
      FROM journal_entries
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND date >= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.startDate });
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND date <= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.endDate });
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = @param${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters.createdBy) {
      query += ` AND created_by = @param${paramIndex}`;
      params.push(filters.createdBy);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY date DESC, entry_id DESC
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Get payments from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Payments
   */
  async getPayments(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        p.payment_id,
        p.date,
        p.payment_type,
        p.vendor_id,
        p.customer_id,
        p.invoice_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.reference_number,
        p.status,
        p.payment_status,
        p.processed_by,
        p.processed_at,
        v.vendor_name,
        c.customer_name
      FROM payments p
      LEFT JOIN vendors v ON p.vendor_id = v.vendor_id
      LEFT JOIN customers c ON p.customer_id = c.customer_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND p.date >= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.startDate });
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND p.date <= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.endDate });
      paramIndex++;
    }
    
    if (filters.paymentType) {
      query += ` AND p.payment_type = @param${paramIndex}`;
      params.push(filters.paymentType);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND p.status = @param${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY p.date DESC, p.payment_id DESC
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Get trades from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Trades
   */
  async getTrades(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        trade_id,
        date,
        instrument_type,
        symbol,
        quantity,
        price,
        trade_type,
        total_amount,
        currency,
        broker,
        account_id,
        status,
        executed_at,
        trader_id
      FROM trades
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND date >= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.startDate });
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND date <= @param${paramIndex}`;
      params.push({ type: sql.Date, value: filters.endDate });
      paramIndex++;
    }
    
    if (filters.instrumentType) {
      query += ` AND instrument_type = @param${paramIndex}`;
      params.push(filters.instrumentType);
      paramIndex++;
    }
    
    if (filters.symbol) {
      query += ` AND symbol = @param${paramIndex}`;
      params.push(filters.symbol);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = @param${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY date DESC, trade_id DESC
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Get customer master data from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Customer data
   */
  async getCustomers(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        customer_id,
        customer_name,
        customer_type,
        industry,
        contact_person,
        email,
        phone,
        address_street,
        address_city,
        address_state,
        address_zip,
        address_country,
        tax_id,
        credit_limit,
        payment_terms,
        status,
        created_date,
        last_updated
      FROM customers
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.customerType) {
      query += ` AND customer_type = @param${paramIndex}`;
      params.push(filters.customerType);
      paramIndex++;
    }
    
    if (filters.industry) {
      query += ` AND industry = @param${paramIndex}`;
      params.push(filters.industry);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = @param${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters.search) {
      query += ` AND (customer_name LIKE @param${paramIndex} OR contact_person LIKE @param${paramIndex})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY customer_name
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Get vendor master data from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Vendor data
   */
  async getVendors(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        vendor_id,
        vendor_name,
        vendor_type,
        category,
        contact_person,
        email,
        phone,
        address_street,
        address_city,
        address_state,
        address_zip,
        address_country,
        tax_id,
        payment_terms,
        credit_rating,
        status,
        contract_start_date,
        contract_end_date,
        created_date,
        last_updated
      FROM vendors
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.vendorType) {
      query += ` AND vendor_type = @param${paramIndex}`;
      params.push(filters.vendorType);
      paramIndex++;
    }
    
    if (filters.category) {
      query += ` AND category = @param${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND status = @param${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters.search) {
      query += ` AND (vendor_name LIKE @param${paramIndex} OR contact_person LIKE @param${paramIndex})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY vendor_name
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Get account master data from SQL Server
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Account data
   */
  async getAccounts(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        account_id,
        account_name,
        account_type,
        account_category,
        account_subcategory,
        normal_balance,
        account_level,
        parent_account,
        is_active,
        description,
        created_date,
        last_updated
      FROM accounts
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 0;
    
    // Add filters
    if (filters.accountType) {
      query += ` AND account_type = @param${paramIndex}`;
      params.push(filters.accountType);
      paramIndex++;
    }
    
    if (filters.accountCategory) {
      query += ` AND account_category = @param${paramIndex}`;
      params.push(filters.accountCategory);
      paramIndex++;
    }
    
    if (filters.isActive !== undefined) {
      query += ` AND is_active = @param${paramIndex}`;
      params.push(filters.isActive);
      paramIndex++;
    }
    
    if (filters.search) {
      query += ` AND (account_name LIKE @param${paramIndex} OR description LIKE @param${paramIndex})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY account_id
                OFFSET @param${paramIndex} ROWS
                FETCH NEXT @param${paramIndex + 1} ROWS ONLY`;
    
    params.push(offset);
    params.push(limit);
    
    return await this.executeQuery(query, params);
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const result = await this.executeQuery('SELECT 1 as test');
      return result.length > 0 && result[0].test === 1;
    } catch (error) {
      logger.error('SQL connection test failed:', error);
      return false;
    }
  }
}

module.exports = new SqlService();
