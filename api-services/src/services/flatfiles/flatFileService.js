const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { BlobServiceClient } = require('@azure/storage-blob');
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const logger = require('../../utils/logger');

class FlatFileService {
  constructor() {
    this.azureBlobService = null;
    this.s3Client = null;
    this.gcpStorage = null;
    this.initializeCloudClients();
  }

  /**
   * Initialize cloud storage clients
   */
  initializeCloudClients() {
    // Azure Blob Storage
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      this.azureBlobService = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      );
    }

    // AWS S3
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
    }

    // Google Cloud Storage
    if (process.env.GCP_PROJECT_ID) {
      this.gcpStorage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GCP_KEY_FILENAME
      });
    }
  }

  /**
   * Read CSV file from local filesystem
   * @param {string} filePath - Path to the CSV file
   * @param {Object} options - CSV parsing options
   * @returns {Promise<Array>} Parsed CSV data
   */
  async readLocalCSV(filePath, options = {}) {
    const startTime = Date.now();
    
    try {
      const results = [];
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Parse CSV content
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          results.push(row);
        }
      }
      
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read local CSV: ${filePath}`, duration, { rows: results.length });
      
      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read local CSV failed: ${filePath}`, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Read Excel file from local filesystem
   * @param {string} filePath - Path to the Excel file
   * @param {Object} options - Excel reading options
   * @returns {Promise<Array>} Parsed Excel data
   */
  async readLocalExcel(filePath, options = {}) {
    const startTime = Date.now();
    
    try {
      const workbook = XLSX.readFile(filePath, options);
      const sheetNames = workbook.SheetNames;
      const results = {};
      
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        results[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      });
      
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read local Excel: ${filePath}`, duration, { sheets: sheetNames.length });
      
      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read local Excel failed: ${filePath}`, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Read file from Azure Blob Storage
   * @param {string} containerName - Container name
   * @param {string} blobName - Blob name
   * @param {Object} options - Reading options
   * @returns {Promise<Array>} File data
   */
  async readAzureBlob(containerName, blobName, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.azureBlobService) {
        throw new Error('Azure Blob Storage not configured');
      }
      
      const containerClient = this.azureBlobService.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      
      const downloadResponse = await blobClient.download();
      const chunks = [];
      
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      const fileExtension = path.extname(blobName).toLowerCase();
      
      let data;
      if (fileExtension === '.csv') {
        data = await this.parseCSVBuffer(buffer);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = await this.parseExcelBuffer(buffer);
      } else {
        data = buffer.toString('utf8');
      }
      
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read Azure blob: ${containerName}/${blobName}`, duration, { size: buffer.length });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read Azure blob failed: ${containerName}/${blobName}`, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Read file from AWS S3
   * @param {string} bucketName - S3 bucket name
   * @param {string} key - S3 object key
   * @param {Object} options - Reading options
   * @returns {Promise<Array>} File data
   */
  async readS3Object(bucketName, key, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.s3Client) {
        throw new Error('AWS S3 not configured');
      }
      
      const params = {
        Bucket: bucketName,
        Key: key
      };
      
      const response = await this.s3Client.getObject(params).promise();
      const buffer = response.Body;
      const fileExtension = path.extname(key).toLowerCase();
      
      let data;
      if (fileExtension === '.csv') {
        data = await this.parseCSVBuffer(buffer);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = await this.parseExcelBuffer(buffer);
      } else {
        data = buffer.toString('utf8');
      }
      
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read S3 object: ${bucketName}/${key}`, duration, { size: buffer.length });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read S3 object failed: ${bucketName}/${key}`, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Read file from Google Cloud Storage
   * @param {string} bucketName - GCS bucket name
   * @param {string} fileName - GCS file name
   * @param {Object} options - Reading options
   * @returns {Promise<Array>} File data
   */
  async readGCSFile(bucketName, fileName, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.gcpStorage) {
        throw new Error('Google Cloud Storage not configured');
      }
      
      const bucket = this.gcpStorage.bucket(bucketName);
      const file = bucket.file(fileName);
      
      const [buffer] = await file.download();
      const fileExtension = path.extname(fileName).toLowerCase();
      
      let data;
      if (fileExtension === '.csv') {
        data = await this.parseCSVBuffer(buffer);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        data = await this.parseExcelBuffer(buffer);
      } else {
        data = buffer.toString('utf8');
      }
      
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read GCS file: ${bucketName}/${fileName}`, duration, { size: buffer.length });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logPerformance(`Read GCS file failed: ${bucketName}/${fileName}`, duration, { error: error.message });
      throw error;
    }
  }

  /**
   * Parse CSV buffer
   * @param {Buffer} buffer - CSV file buffer
   * @returns {Promise<Array>} Parsed CSV data
   */
  async parseCSVBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(buffer);
      readable.push(null);
      
      readable
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Parse Excel buffer
   * @param {Buffer} buffer - Excel file buffer
   * @returns {Promise<Object>} Parsed Excel data
   */
  async parseExcelBuffer(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const results = {};
    
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      results[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    });
    
    return results;
  }

  /**
   * Get supporting documents from flat files
   * @param {Object} filters - Query filters
   * @param {string} source - Data source (local, azure, s3, gcs)
   * @param {Object} sourceConfig - Source configuration
   * @returns {Promise<Array>} Supporting documents
   */
  async getSupportingDocuments(filters = {}, source = 'local', sourceConfig = {}) {
    try {
      let data;
      
      switch (source) {
        case 'local':
          if (sourceConfig.filePath) {
            const fileExtension = path.extname(sourceConfig.filePath).toLowerCase();
            if (fileExtension === '.csv') {
              data = await this.readLocalCSV(sourceConfig.filePath);
            } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
              data = await this.readLocalExcel(sourceConfig.filePath);
            }
          }
          break;
          
        case 'azure':
          if (sourceConfig.containerName && sourceConfig.blobName) {
            data = await this.readAzureBlob(sourceConfig.containerName, sourceConfig.blobName);
          }
          break;
          
        case 's3':
          if (sourceConfig.bucketName && sourceConfig.key) {
            data = await this.readS3Object(sourceConfig.bucketName, sourceConfig.key);
          }
          break;
          
        case 'gcs':
          if (sourceConfig.bucketName && sourceConfig.fileName) {
            data = await this.readGCSFile(sourceConfig.bucketName, sourceConfig.fileName);
          }
          break;
          
        default:
          throw new Error(`Unsupported source: ${source}`);
      }
      
      // Apply filters if data is an array
      if (Array.isArray(data)) {
        return this.applyFilters(data, filters);
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to get supporting documents:', error);
      throw error;
    }
  }

  /**
   * Get invoices from flat files
   * @param {Object} filters - Query filters
   * @param {string} source - Data source
   * @param {Object} sourceConfig - Source configuration
   * @returns {Promise<Array>} Invoice data
   */
  async getInvoices(filters = {}, source = 'local', sourceConfig = {}) {
    try {
      const data = await this.getSupportingDocuments(filters, source, sourceConfig);
      
      // If data is an object with multiple sheets, look for invoices sheet
      if (typeof data === 'object' && !Array.isArray(data)) {
        const sheetNames = Object.keys(data);
        const invoiceSheet = sheetNames.find(name => 
          name.toLowerCase().includes('invoice') || 
          name.toLowerCase().includes('invoices')
        );
        
        if (invoiceSheet) {
          return this.applyFilters(data[invoiceSheet], filters);
        }
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to get invoices:', error);
      throw error;
    }
  }

  /**
   * Get contracts from flat files
   * @param {Object} filters - Query filters
   * @param {string} source - Data source
   * @param {Object} sourceConfig - Source configuration
   * @returns {Promise<Array>} Contract data
   */
  async getContracts(filters = {}, source = 'local', sourceConfig = {}) {
    try {
      const data = await this.getSupportingDocuments(filters, source, sourceConfig);
      
      // If data is an object with multiple sheets, look for contracts sheet
      if (typeof data === 'object' && !Array.isArray(data)) {
        const sheetNames = Object.keys(data);
        const contractSheet = sheetNames.find(name => 
          name.toLowerCase().includes('contract') || 
          name.toLowerCase().includes('contracts')
        );
        
        if (contractSheet) {
          return this.applyFilters(data[contractSheet], filters);
        }
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to get contracts:', error);
      throw error;
    }
  }

  /**
   * Get tax forms from flat files
   * @param {Object} filters - Query filters
   * @param {string} source - Data source
   * @param {Object} sourceConfig - Source configuration
   * @returns {Promise<Array>} Tax form data
   */
  async getTaxForms(filters = {}, source = 'local', sourceConfig = {}) {
    try {
      const data = await this.getSupportingDocuments(filters, source, sourceConfig);
      
      // If data is an object with multiple sheets, look for tax forms sheet
      if (typeof data === 'object' && !Array.isArray(data)) {
        const sheetNames = Object.keys(data);
        const taxSheet = sheetNames.find(name => 
          name.toLowerCase().includes('tax') || 
          name.toLowerCase().includes('forms')
        );
        
        if (taxSheet) {
          return this.applyFilters(data[taxSheet], filters);
        }
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to get tax forms:', error);
      throw error;
    }
  }

  /**
   * Apply filters to data
   * @param {Array} data - Data array
   * @param {Object} filters - Filters to apply
   * @returns {Array} Filtered data
   */
  applyFilters(data, filters) {
    if (!Array.isArray(data) || Object.keys(filters).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (item[key] === undefined || item[key] !== value) {
            return false;
          }
        }
      }
      return true;
    });
  }

  /**
   * List files in Azure Blob Storage container
   * @param {string} containerName - Container name
   * @returns {Promise<Array>} List of blobs
   */
  async listAzureBlobs(containerName) {
    try {
      if (!this.azureBlobService) {
        throw new Error('Azure Blob Storage not configured');
      }
      
      const containerClient = this.azureBlobService.getContainerClient(containerName);
      const blobs = [];
      
      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push({
          name: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          contentType: blob.properties.contentType
        });
      }
      
      return blobs;
    } catch (error) {
      logger.error('Failed to list Azure blobs:', error);
      throw error;
    }
  }

  /**
   * List objects in S3 bucket
   * @param {string} bucketName - Bucket name
   * @param {string} prefix - Object prefix
   * @returns {Promise<Array>} List of objects
   */
  async listS3Objects(bucketName, prefix = '') {
    try {
      if (!this.s3Client) {
        throw new Error('AWS S3 not configured');
      }
      
      const params = {
        Bucket: bucketName,
        Prefix: prefix
      };
      
      const response = await this.s3Client.listObjectsV2(params).promise();
      
      return response.Contents.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        storageClass: obj.StorageClass
      }));
    } catch (error) {
      logger.error('Failed to list S3 objects:', error);
      throw error;
    }
  }

  /**
   * List files in GCS bucket
   * @param {string} bucketName - Bucket name
   * @param {string} prefix - File prefix
   * @returns {Promise<Array>} List of files
   */
  async listGCSFiles(bucketName, prefix = '') {
    try {
      if (!this.gcpStorage) {
        throw new Error('Google Cloud Storage not configured');
      }
      
      const bucket = this.gcpStorage.bucket(bucketName);
      const [files] = await bucket.getFiles({ prefix });
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        lastModified: file.metadata.updated,
        contentType: file.metadata.contentType
      }));
    } catch (error) {
      logger.error('Failed to list GCS files:', error);
      throw error;
    }
  }

  /**
   * Test file service connections
   * @returns {Promise<Object>} Connection status for each service
   */
  async testConnections() {
    const results = {
      local: true,
      azure: false,
      s3: false,
      gcs: false
    };
    
    try {
      // Test Azure connection
      if (this.azureBlobService) {
        const containers = this.azureBlobService.listContainers();
        await containers.next();
        results.azure = true;
      }
    } catch (error) {
      logger.error('Azure connection test failed:', error);
    }
    
    try {
      // Test S3 connection
      if (this.s3Client) {
        await this.s3Client.listBuckets().promise();
        results.s3 = true;
      }
    } catch (error) {
      logger.error('S3 connection test failed:', error);
    }
    
    try {
      // Test GCS connection
      if (this.gcpStorage) {
        const [buckets] = await this.gcpStorage.getBuckets();
        results.gcs = true;
      }
    } catch (error) {
      logger.error('GCS connection test failed:', error);
    }
    
    return results;
  }
}

module.exports = new FlatFileService();
