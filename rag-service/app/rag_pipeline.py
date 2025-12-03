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
try:
    qclient = QdrantClient(url=QDRANT_URL)
    logger.info(f"Connected to Qdrant at {QDRANT_URL}")
except Exception as e:
    logger.error(f"Failed to connect to Qdrant: {e}")
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
        logger.warning("Qdrant client not available, returning empty results")
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
        answer = call_local_llama(prompt, max_tokens=512, temperature=0.0)
        
        # Step 4: Verify numeric claims (optional)
        if verify_numbers:
            is_valid, warning = verify_numeric_claims(answer, hits)
            if not is_valid:
                answer += warning
        
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
        logger.error(f"Error in RAG pipeline: {e}")
        return {
            "answer": f"I encountered an error while processing your query: {str(e)}",
            "sources": [],
            "hits": [],
            "retrieval_count": 0,
            "error": str(e)
        }

