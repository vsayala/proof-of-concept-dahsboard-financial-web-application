"""
Model Clients - Embedding and LLM client wrappers
Handles SentenceTransformers for embeddings and Ollama for LLM inference
"""
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import Optional
import httpx
import logging

logger = logging.getLogger(__name__)

# Embedding model (singleton)
_EMBED = None
EMBED_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")  # Faster, smaller model for PoC

def get_embed_model():
    """Get or initialize the embedding model singleton"""
    global _EMBED
    if _EMBED is None:
        try:
            logger.info(f"Loading embedding model: {EMBED_NAME}")
            _EMBED = SentenceTransformer(EMBED_NAME)
            logger.info(f"Embedding model loaded. Dimension: {_EMBED.get_sentence_embedding_dimension()}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    return _EMBED

# Ollama client configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2:7b")

def call_local_llama(prompt: str, max_tokens: int = 512, temperature: float = 0.0) -> str:
    """
    Call local Ollama LLM via HTTP API
    
    Args:
        prompt: The prompt to send to LLM
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature (0.0 for deterministic)
    
    Returns:
        Generated text response
    """
    try:
        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert AI Audit Assistant. Provide accurate, helpful responses based ONLY on the audit data provided in the context. If the answer is not in the context, say 'I don't know'."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract response text
            if data.get("message") and data["message"].get("content"):
                return data["message"]["content"]
            elif data.get("response"):
                return data["response"]
            else:
                logger.warning(f"Unexpected Ollama response format: {data}")
                return "I apologize, but I couldn't generate a response."
                
    except httpx.TimeoutException:
        logger.error(f"Ollama request timed out after 120s")
        return "Request timed out. Please try again."
    except httpx.RequestError as e:
        logger.error(f"Ollama request failed: {e}")
        return f"I encountered an error connecting to the LLM service: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error calling Ollama: {e}")
        return f"An unexpected error occurred: {str(e)}"

def verify_ollama_available() -> bool:
    """Check if Ollama is available and model exists"""
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                logger.info(f"Ollama available. Models: {', '.join(model_names)}")
                return True
    except Exception as e:
        logger.warning(f"Ollama not available: {e}")
    return False

