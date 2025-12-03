"""
FastAPI RAG Service - Main entry point
Provides REST API endpoints for RAG-based question answering
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import logging
import os
from dotenv import load_dotenv

from .rag_pipeline import answer_query, retrieve_top_k
from .model_clients import verify_ollama_available, get_embed_model

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RAG Service API",
    description="Retrieval-Augmented Generation service for audit data",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    query: str
    k: Optional[int] = 6
    verify_numbers: Optional[bool] = True
    filter: Optional[Dict] = None
    tenant_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    answer: str
    sources: List
    hits: List[Dict]
    retrieval_count: int
    query: str
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    ollama_available: bool
    qdrant_available: bool
    embedding_model: str
    embedding_dimension: Optional[int] = None

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        ollama_ok = verify_ollama_available()
        qdrant_ok = True  # Will be checked in retrieve_top_k if needed
        embed_model = get_embed_model()
        embed_dim = embed_model.get_sentence_embedding_dimension()
        
        return HealthResponse(
            status="healthy" if ollama_ok else "degraded",
            ollama_available=ollama_ok,
            qdrant_available=qdrant_ok,
            embedding_model=os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2"),
            embedding_dimension=embed_dim
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            ollama_available=False,
            qdrant_available=False,
            embedding_model=os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main RAG endpoint - answers questions using retrieved context
    
    Args:
        request: ChatRequest with query and optional parameters
    
    Returns:
        ChatResponse with answer, sources, and metadata
    """
    try:
        logger.info(f"Processing RAG query: {request.query[:100]}...")
        
        # Validate query
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Execute RAG pipeline
        result = answer_query(
            query=request.query,
            k=request.k or 6,
            verify_numbers=request.verify_numbers,
            filter_dict=request.filter
        )
        
        logger.info(f"RAG query completed. Retrieved {result['retrieval_count']} documents")
        
        return ChatResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process query: {str(e)}"
        )

@app.get("/api/search")
async def search_endpoint(query: str, k: int = 6):
    """
    Search endpoint - returns raw retrieved documents without LLM generation
    
    Useful for debugging and understanding what documents are retrieved
    """
    try:
        hits = retrieve_top_k(query, k=k)
        return {
            "query": query,
            "results": hits,
            "count": len(hits)
        }
    except Exception as e:
        logger.error(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting RAG Service...")
    
    # Pre-load embedding model
    try:
        embed_model = get_embed_model()
        logger.info(f"Embedding model loaded: {embed_model.get_sentence_embedding_dimension()} dimensions")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
    
    # Check Ollama
    if verify_ollama_available():
        logger.info("Ollama is available")
    else:
        logger.warning("Ollama is not available - LLM generation will fail")
    
    logger.info("RAG Service started successfully")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("RAG_SERVICE_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

