/**
 * Python RAG Service Client
 * Wrapper to call the Python FastAPI RAG service from Node.js
 */
const axios = require('axios');
const logger = require('../../utils/logger');

class PythonRAGService {
  constructor() {
    this.ragServiceUrl = process.env.PYTHON_RAG_SERVICE_URL || 'http://localhost:8001';
    this.enabled = process.env.USE_PYTHON_RAG !== 'false'; // Default to enabled if service exists
    this.timeout = parseInt(process.env.RAG_SERVICE_TIMEOUT) || 30000;
  }

  /**
   * Check if Python RAG service is available
   * @returns {Promise<boolean>}
   */
  async checkServiceAvailable() {
    try {
      const response = await axios.get(`${this.ragServiceUrl}/health`, { 
        timeout: 5000 
      });
      return response.status === 200 && response.data.status !== 'unhealthy';
    } catch (error) {
      logger.warn(`Python RAG service not available at ${this.ragServiceUrl}: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate response using Python RAG service
   * @param {string} query - User query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} RAG response
   */
  async generateResponse(query, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check if service is available
      const isAvailable = await this.checkServiceAvailable();
      if (!isAvailable) {
        throw new Error('Python RAG service is not available');
      }

      const requestBody = {
        query: query,
        k: options.k || options.limit || 6,
        verify_numbers: options.verify_numbers !== false,
        filter: options.filter || null,
        tenant_id: options.tenant_id || 'default'
      };

      logger.info(`Calling Python RAG service: ${query.substring(0, 100)}...`, {
        url: this.ragServiceUrl,
        k: requestBody.k
      });

      const response = await axios.post(
        `${this.ragServiceUrl}/api/chat`,
        requestBody,
        { 
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const duration = Date.now() - startTime;
      
      logger.info(`Python RAG service response received`, {
        duration,
        retrievalCount: response.data.retrieval_count,
        sourcesCount: response.data.sources?.length || 0
      });

      // Transform response to match existing RAG service format
      return {
        response: response.data.answer,
        context: {
          sources: response.data.sources,
          hits: response.data.hits,
          retrievalCount: response.data.retrieval_count
        },
        usedLLM: 'ollama',
        model: process.env.OLLAMA_MODEL || 'llama2:7b',
        processingTime: duration,
        sources: response.data.sources,
        hits: response.data.hits
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logError(error, {
        module: 'pythonRAGService',
        operation: 'generate_response',
        duration,
        query: query?.substring(0, 100)
      });

      // Return error response that can be handled by caller
      throw new Error(`Python RAG service error: ${error.message}`);
    }
  }
}

module.exports = new PythonRAGService();

