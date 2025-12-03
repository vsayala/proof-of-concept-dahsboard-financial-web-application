const axios = require('axios');
const logger = require('../../utils/logger');

class DeltaLakeService {
  constructor() {
    this.config = {
      host: process.env.DATABRICKS_HOST,
      token: process.env.DATABRICKS_TOKEN,
      workspaceId: process.env.DATABRICKS_WORKSPACE_ID,
      catalog: process.env.DATABRICKS_CATALOG || 'hive_metastore',
      schema: process.env.DATABRICKS_SCHEMA || 'default'
    };
    
    this.baseUrl = `https://${this.config.host}`;
    this.apiUrl = `${this.baseUrl}/api/2.0`;
  }

  /**
   * Create authenticated headers for Databricks API
   * @returns {Object} Headers with authentication
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Execute a SQL query on Delta Lake
   * @param {string} query - SQL query string
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(query, options = {}) {
    const startTime = Date.now();
    
    try {
      const payload = {
        query: query,
        ...options
      };

      const response = await axios.post(
        `${this.apiUrl}/sql/endpoints/${this.config.workspaceId}/query`,
        payload,
        { headers: this.getAuthHeaders() }
      );

      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', 'DeltaLake', duration, true);
      
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('QUERY', 'DeltaLake', duration, false, error);
      throw error;
    }
  }

  /**
   * Get financial reports from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Financial reports
   */
  async getFinancialReports(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        report_id,
        report_type,
        report_date,
        fiscal_period,
        currency,
        company_name,
        prepared_by,
        approved_by
      FROM ${this.config.catalog}.${this.config.schema}.financial_reports
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.reportType) {
      query += ` AND report_type = $${paramIndex}`;
      params.push(filters.reportType);
      paramIndex++;
    }
    
    if (filters.startDate) {
      query += ` AND report_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND report_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    
    if (filters.fiscalPeriod) {
      query += ` AND fiscal_period = $${paramIndex}`;
      params.push(filters.fiscalPeriod);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY report_date DESC, report_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get balance sheet data from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Balance sheet data
   */
  async getBalanceSheet(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        bs.report_id,
        bs.report_type,
        bs.report_date,
        bs.fiscal_period,
        bs.currency,
        bs.company_name,
        bs.prepared_by,
        bs.approved_by,
        bs.total_assets,
        bs.total_liabilities,
        bs.total_equity,
        bs.total_liabilities_and_equity
      FROM ${this.config.catalog}.${this.config.schema}.balance_sheet bs
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND bs.report_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND bs.report_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    
    if (filters.fiscalPeriod) {
      query += ` AND bs.fiscal_period = $${paramIndex}`;
      params.push(filters.fiscalPeriod);
      paramIndex++;
    }
    
    if (filters.companyName) {
      query += ` AND bs.company_name = $${paramIndex}`;
      params.push(filters.companyName);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY bs.report_date DESC, bs.report_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get profit and loss data from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} P&L data
   */
  async getProfitLoss(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        pl.report_id,
        pl.report_type,
        pl.report_date,
        pl.fiscal_period,
        pl.currency,
        pl.company_name,
        pl.prepared_by,
        pl.approved_by,
        pl.net_revenue,
        pl.total_cost_of_goods_sold,
        pl.gross_profit,
        pl.total_operating_expenses,
        pl.operating_income,
        pl.income_before_taxes,
        pl.income_tax_expense,
        pl.net_income
      FROM ${this.config.catalog}.${this.config.schema}.profit_loss pl
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND pl.report_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND pl.report_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    
    if (filters.fiscalPeriod) {
      query += ` AND pl.fiscal_period = $${paramIndex}`;
      params.push(filters.fiscalPeriod);
      paramIndex++;
    }
    
    if (filters.companyName) {
      query += ` AND pl.company_name = $${paramIndex}`;
      params.push(filters.companyName);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY pl.report_date DESC, pl.report_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get cash flow data from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Cash flow data
   */
  async getCashFlow(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        cf.report_id,
        cf.report_type,
        cf.report_date,
        cf.fiscal_period,
        cf.currency,
        cf.company_name,
        cf.prepared_by,
        cf.approved_by,
        cf.net_cash_from_operating_activities,
        cf.net_cash_from_investing_activities,
        cf.net_cash_from_financing_activities,
        cf.net_change_in_cash,
        cf.cash_at_beginning_of_period,
        cf.cash_at_end_of_period
      FROM ${this.config.catalog}.${this.config.schema}.cash_flow cf
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND cf.report_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND cf.report_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    
    if (filters.fiscalPeriod) {
      query += ` AND cf.fiscal_period = $${paramIndex}`;
      params.push(filters.fiscalPeriod);
      paramIndex++;
    }
    
    if (filters.companyName) {
      query += ` AND cf.company_name = $${paramIndex}`;
      params.push(filters.companyName);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY cf.report_date DESC, cf.report_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get external audit reports from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} External audit reports
   */
  async getExternalAuditReports(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        ar.audit_id,
        ar.audit_type,
        ar.audit_period,
        ar.audit_date,
        ar.auditor_firm,
        ar.auditor_name,
        ar.audit_opinion,
        ar.report_date,
        ar.company_name,
        ar.audit_scope,
        ar.key_findings,
        ar.material_weaknesses,
        ar.significant_deficiencies,
        ar.recommendations,
        ar.audit_fees,
        ar.currency,
        ar.next_audit_date,
        ar.status,
        ar.submitted_by,
        ar.submitted_at
      FROM ${this.config.catalog}.${this.config.schema}.external_audit_reports ar
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.auditType) {
      query += ` AND ar.audit_type = $${paramIndex}`;
      params.push(filters.auditType);
      paramIndex++;
    }
    
    if (filters.auditPeriod) {
      query += ` AND ar.audit_period = $${paramIndex}`;
      params.push(filters.auditPeriod);
      paramIndex++;
    }
    
    if (filters.auditorFirm) {
      query += ` AND ar.auditor_firm = $${paramIndex}`;
      params.push(filters.auditorFirm);
      paramIndex++;
    }
    
    if (filters.auditOpinion) {
      query += ` AND ar.audit_opinion = $${paramIndex}`;
      params.push(filters.auditOpinion);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND ar.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters.companyName) {
      query += ` AND ar.company_name = $${paramIndex}`;
      params.push(filters.companyName);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY ar.audit_date DESC, ar.audit_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get bank confirmations from Delta Lake
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Bank confirmations
   */
  async getBankConfirmations(filters = {}, limit = 100, offset = 0) {
    let query = `
      SELECT 
        bc.confirmation_id,
        bc.confirmation_date,
        bc.bank_name,
        bc.account_number,
        bc.account_type,
        bc.customer_name,
        bc.confirmation_type,
        bc.requested_by,
        bc.requested_at,
        bc.response_received,
        bc.response_date,
        bc.account_balance,
        bc.outstanding_balance,
        bc.credit_limit,
        bc.currency,
        bc.status,
        bc.notes
      FROM ${this.config.catalog}.${this.config.schema}.bank_confirmations bc
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters
    if (filters.startDate) {
      query += ` AND bc.confirmation_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND bc.confirmation_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    
    if (filters.bankName) {
      query += ` AND bc.bank_name = $${paramIndex}`;
      params.push(filters.bankName);
      paramIndex++;
    }
    
    if (filters.accountType) {
      query += ` AND bc.account_type = $${paramIndex}`;
      params.push(filters.accountType);
      paramIndex++;
    }
    
    if (filters.confirmationType) {
      query += ` AND bc.confirmation_type = $${paramIndex}`;
      params.push(filters.confirmationType);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND bc.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    
    if (filters.customerName) {
      query += ` AND bc.customer_name = $${paramIndex}`;
      params.push(filters.customerName);
      paramIndex++;
    }
    
    // Add pagination
    query += ` ORDER BY bc.confirmation_date DESC, bc.confirmation_id DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit);
    params.push(offset);
    
    return await this.executeQuery(query, { parameters: params });
  }

  /**
   * Get table metadata from Unity Catalog
   * @param {string} tableName - Name of the table
   * @returns {Promise<Object>} Table metadata
   */
  async getTableMetadata(tableName) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/unity-catalog/tables/${this.config.catalog}.${this.config.schema}.${tableName}`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get table metadata:', error);
      throw error;
    }
  }

  /**
   * List all tables in a schema
   * @returns {Promise<Array>} List of tables
   */
  async listTables() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/unity-catalog/tables?catalog_name=${this.config.catalog}&schema_name=${this.config.schema}`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.tables || [];
    } catch (error) {
      logger.error('Failed to list tables:', error);
      throw error;
    }
  }

  /**
   * Test Delta Lake connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const result = await this.executeQuery('SELECT 1 as test');
      return result && result.results && result.results.length > 0;
    } catch (error) {
      logger.error('Delta Lake connection test failed:', error);
      return false;
    }
  }
}

module.exports = new DeltaLakeService();
