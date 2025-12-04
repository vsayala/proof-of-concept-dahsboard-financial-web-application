"""
RAG Pipeline - Retrieval-Augmented Generation implementation
Handles document retrieval from Qdrant, prompt building, and LLM generation
"""
import os
import re
from typing import List, Dict, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np
from .model_clients import get_embed_model, call_local_llama
import logging

logger = logging.getLogger(__name__)

# Qdrant configuration
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "audit_documents")

# Initialize Qdrant client
qclient = None
try:
    qclient = QdrantClient(url=QDRANT_URL, timeout=10.0)
    # Test connection by checking collections
    try:
        collections = qclient.get_collections()
        logger.info(f"Connected to Qdrant at {QDRANT_URL}. Collections: {len(collections.collections)}")
    except Exception as test_error:
        logger.warning(f"Qdrant connection test failed: {test_error}. Will attempt connection on first query.")
except Exception as e:
    logger.error(f"Failed to initialize Qdrant client: {e}")
    logger.warning("Qdrant client will be None. Vector search will not work until Qdrant is available.")
    qclient = None

def retrieve_top_k(query: str, k: int = 6, filter_dict: Optional[Dict] = None) -> List[Dict]:
    """
    Retrieve top-k most relevant documents from Qdrant
    
    Args:
        query: User query string
        k: Number of documents to retrieve
        filter_dict: Optional metadata filter
    
    Returns:
        List of retrieved documents with id, score, and payload
    """
    if qclient is None:
        logger.warning("Qdrant client not available, attempting to reconnect...")
        try:
            # Reinitialize global qclient
            global qclient
            qclient = QdrantClient(url=QDRANT_URL, timeout=10.0)
            # Test connection
            qclient.get_collections()
            logger.info("Successfully reconnected to Qdrant")
        except Exception as reconnect_error:
            logger.error(f"Failed to reconnect to Qdrant: {reconnect_error}")
            return []
    
    try:
        # Get embedding model and encode query
        embed_model = get_embed_model()
        query_vector = embed_model.encode([query], convert_to_numpy=True)[0].tolist()
        
        # Build query filter if provided
        query_filter = None
        if filter_dict:
            # Convert filter_dict to Qdrant filter format
            conditions = []
            for key, value in filter_dict.items():
                conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchValue(value=value)
                    )
                )
            if conditions:
                query_filter = models.Filter(must=conditions)
        
        # Search Qdrant
        hits = qclient.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=k,
            query_filter=query_filter
        )
        
        # Format results
        results = []
        for hit in hits:
            payload = hit.payload or {}
            results.append({
                "id": hit.id,
                "score": hit.score,
                "payload": payload
            })
        
        logger.info(f"Retrieved {len(results)} documents for query: {query[:50]}...")
        return results
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {e}")
        return []

def build_prompt(query: str, hits: List[Dict], max_context_length: int = 2000) -> str:
    """
    Build RAG prompt with retrieved context
    
    Args:
        query: User query
        hits: Retrieved documents
        max_context_length: Maximum characters for context
    
    Returns:
        Formatted prompt string
    """
    # Build context from retrieved documents
    context_parts = []
    current_length = 0
    
    for i, hit in enumerate(hits):
        payload = hit.get("payload", {})
        
        # Extract text from various possible fields
        text = (
            payload.get("text") or 
            payload.get("narration") or 
            payload.get("description") or 
            payload.get("content") or 
            ""
        )
        
        # Build context entry with metadata
        metadata_parts = []
        if payload.get("amount"):
            metadata_parts.append(f"amount: {payload['amount']}")
        if payload.get("date"):
            metadata_parts.append(f"date: {payload['date']}")
        if payload.get("account_id"):
            metadata_parts.append(f"account: {payload['account_id']}")
        if payload.get("transaction_id"):
            metadata_parts.append(f"transaction_id: {payload['transaction_id']}")
        if payload.get("collection"):
            metadata_parts.append(f"source: {payload['collection']}")
        
        metadata_str = ", ".join(metadata_parts)
        entry = f"[Source {i+1}] id:{hit['id']}"
        if metadata_str:
            entry += f" {metadata_str}"
        entry += f"\n{text}"
        
        # Check if adding this entry would exceed max length
        if current_length + len(entry) > max_context_length and context_parts:
            break
            
        context_parts.append(entry)
        current_length += len(entry)
    
    context = "\n\n".join(context_parts)
    
    # Build final prompt
    prompt = f"""You are an expert AI Audit Assistant. Use ONLY the CONTEXT below to answer the QUESTION.

If the answer is not present in the context, reply "I don't know" or "The information is not available in the provided context."

CONTEXT:
{context}

QUESTION:
{query}

INSTRUCTIONS:
- Answer concisely and accurately based ONLY on the context provided
- If you reference numbers, amounts, or dates, ensure they match the context
- At the end, list the source IDs you used (e.g., "Sources: [Source 1, Source 2]")
- If the context doesn't contain relevant information, say so clearly

RESPONSE:
"""
    
    return prompt

def verify_numeric_claims(answer: str, hits: List[Dict]) -> tuple:
    """
    Verify that numeric claims in the answer exist in retrieved sources
    
    Args:
        answer: LLM-generated answer
        hits: Retrieved documents
    
    Returns:
        Tuple of (is_valid, warning_message)
    """
    # Extract amounts/numbers from answer
    amount_pattern = r'\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)'
    amounts_in_answer = re.findall(amount_pattern, answer)
    
    if not amounts_in_answer:
        return True, ""  # No numeric claims to verify
    
    # Extract amounts from hits
    hit_amounts = []
    for hit in hits:
        payload = hit.get("payload", {})
        amount = payload.get("amount")
        if amount is not None:
            hit_amounts.append(str(amount).replace(",", "").replace("$", ""))
    
    # Check if amounts in answer match hits
    mismatches = []
    for ans_amount in amounts_in_answer:
        ans_clean = ans_amount.replace(",", "").replace("$", "")
        if ans_clean not in [h.replace(",", "").replace("$", "") for h in hit_amounts]:
            mismatches.append(ans_amount)
    
    if mismatches:
        warning = f"\n\n[VERIFICATION WARNING] Some numeric claims ({', '.join(mismatches)}) could not be verified from retrieved sources."
        return False, warning
    
    return True, ""

def answer_query(
    query: str, 
    k: int = 6, 
    verify_numbers: bool = True,
    filter_dict: Optional[Dict] = None
) -> Dict:
    """
    Complete RAG pipeline: retrieve, build prompt, generate answer
    
    Args:
        query: User query
        k: Number of documents to retrieve
        verify_numbers: Whether to verify numeric claims
        filter_dict: Optional metadata filter for retrieval
    
    Returns:
        Dictionary with answer, sources, hits, and metadata
    """
    try:
        # Step 1: Retrieve relevant documents
        hits = retrieve_top_k(query, k=k, filter_dict=filter_dict)
        
        if not hits:
            return {
                "answer": "I couldn't find any relevant information in the database to answer your query. Please try rephrasing your question or check if the data has been ingested.",
                "sources": [],
                "hits": [],
                "retrieval_count": 0
            }
        
        # Step 2: Build prompt with context
        prompt = build_prompt(query, hits)
        
        # Step 3: Generate answer using LLM
        try:
            answer = call_local_llama(prompt, max_tokens=512, temperature=0.0)
            
            # Ensure answer is a valid string
            if not answer or not isinstance(answer, str) or not answer.strip():
                logger.warning("LLM returned empty or invalid response, using fallback")
                answer = "I couldn't generate a response based on the retrieved context. Please try rephrasing your question."
        except Exception as llm_error:
            logger.error(f"LLM generation failed: {llm_error}")
            answer = f"I encountered an error while generating a response: {str(llm_error)}. However, I found {len(hits)} relevant document(s) that might help answer your question."
        
        # Step 4: Verify numeric claims (optional)
        if verify_numbers and answer:
            try:
                is_valid, warning = verify_numeric_claims(answer, hits)
                if not is_valid:
                    answer += warning
            except Exception as verify_error:
                logger.warning(f"Number verification failed: {verify_error}")
                # Continue without verification
        
        # Step 5: Extract source IDs
        source_ids = [h["id"] for h in hits]
        
        return {
            "answer": answer,
            "sources": source_ids,
            "hits": hits,
            "retrieval_count": len(hits),
            "query": query
        }
        
    except Exception as e:
        logger.error(f"Error in RAG pipeline: {e}", exc_info=True)
        # Provide more helpful error messages based on error type
        error_message = str(e)
        if "Qdrant" in error_message or "connection" in error_message.lower():
            error_message = "I couldn't connect to the vector database. Please ensure Qdrant is running and accessible."
        elif "Ollama" in error_message or "LLM" in error_message:
            error_message = "I couldn't connect to the language model. Please ensure Ollama is running and the model is available."
        elif "embedding" in error_message.lower():
            error_message = "I encountered an error while processing your query. Please try again."
        
        return {
            "answer": f"I encountered an error while processing your query: {error_message}",
            "sources": [],
            "hits": [],
            "retrieval_count": 0,
            "query": query,
            "error": str(e)
        }

