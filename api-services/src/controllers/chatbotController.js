const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const ragService = require('../services/rag/ragService');

const router = express.Router();

/**
 * @route POST /api/chatbot/query
 * @desc Handle chatbot queries using RAG (Retrieval-Augmented Generation)
 * @access Public
 */
router.post('/query', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId || `req_${Date.now()}`;
  
  try {
    const { query, limit = 10 } = req.body;

    logger.info(`Processing RAG query: "${query}"`, {
      requestId,
      query: query?.substring(0, 100), // Log first 100 chars
      limit
    });

    if (!query || typeof query !== 'string' || !query.trim()) {
      logger.warn('Invalid chatbot query received', {
        requestId,
        query: query,
        error: 'Query is required and must be a non-empty string'
      });
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string',
        statusCode: 400,
        requestId
      });
    }

    // Use RAG service to generate intelligent response
    let ragResult;
    try {
      ragResult = await ragService.generateResponse(query, { limit: parseInt(limit) });
    } catch (ragError) {
      logger.logError(ragError, {
        module: 'chatbotController',
        operation: 'rag_generate_response',
        requestId,
        query: query.substring(0, 100)
      });
      throw ragError;
    }

    const duration = Date.now() - startTime;
    
    // Ensure response exists and is a string
    const responseText = ragResult?.response || ragResult?.answer || 'I apologize, but I could not generate a response. Please try again.';
    
    logger.logLLM('RAG Query', ragResult?.model || 'unknown', duration, true, {
      requestId,
      query: query.substring(0, 100),
      usedLLM: ragResult?.usedLLM || false,
      responseLength: responseText?.length || 0
    });

    res.json({
      success: true,
      data: {
        response: responseText,
        query: query,
        context: ragResult?.context || {},
        usedLLM: ragResult?.usedLLM || false,
        processingTime: ragResult?.processingTime || duration,
        model: ragResult?.model || 'fallback'
      },
      timestamp: new Date().toISOString(),
      requestId
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logError(error, {
      module: 'chatbotController',
      operation: 'process_chatbot_query',
      requestId,
      duration,
      query: req.body?.query?.substring(0, 100)
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process chatbot query',
      message: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      statusCode: 500,
      processingTime: duration,
      requestId
    });
  }
}));

module.exports = router;

