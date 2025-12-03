#!/usr/bin/env python3
"""
MongoDB to Qdrant Ingestion Script
Reads documents from MongoDB collections and indexes them in Qdrant for RAG retrieval
"""
import os
import sys
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import logging
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "audit_data")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "audit_documents")
EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
BATCH_SIZE = 100

# Collections to ingest from MongoDB
COLLECTIONS_TO_INGEST = [
    "journal_entries",
    "payments",
    "trades",
    "regulatory_filings",
    "audit_reports",
    "exception_logs",
    "customers",
    "vendors"
]

def extract_text_from_document(doc: Dict, collection_name: str) -> str:
    """
    Extract searchable text from a MongoDB document
    
    Args:
        doc: MongoDB document
        collection_name: Name of the collection
    
    Returns:
        Concatenated text string for embedding
    """
    text_parts = []
    
    # Common fields that contain text
    text_fields = [
        "narration", "description", "notes", "comment", "remarks",
        "text", "content", "summary", "details", "name", "title"
    ]
    
    for field in text_fields:
        if field in doc and doc[field]:
            text_parts.append(str(doc[field]))
    
    # Add metadata as text
    if "amount" in doc:
        text_parts.append(f"amount {doc['amount']}")
    if "date" in doc:
        text_parts.append(f"date {doc['date']}")
    if "account_id" in doc:
        text_parts.append(f"account {doc['account_id']}")
    if "transaction_id" in doc:
        text_parts.append(f"transaction {doc['transaction_id']}")
    
    # If no text found, create a summary from all fields
    if not text_parts:
        text_parts.append(json.dumps(doc, default=str)[:500])
    
    return " ".join(text_parts)

def create_collection_if_not_exists(qclient: QdrantClient, collection_name: str, vector_size: int):
    """Create Qdrant collection if it doesn't exist"""
    try:
        collections = qclient.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if collection_name not in collection_names:
            logger.info(f"Creating Qdrant collection: {collection_name} with vector size {vector_size}")
            qclient.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Collection {collection_name} created successfully")
        else:
            logger.info(f"Collection {collection_name} already exists")
    except Exception as e:
        logger.error(f"Error creating collection: {e}")
        raise

def ingest_collection(
    mongo_client: MongoClient,
    qclient: QdrantClient,
    embed_model: SentenceTransformer,
    collection_name: str,
    db_name: str
):
    """Ingest a single MongoDB collection into Qdrant"""
    try:
        db = mongo_client[db_name]
        collection = db[collection_name]
        
        # Count documents
        total_docs = collection.count_documents({})
        if total_docs == 0:
            logger.warning(f"Collection {collection_name} is empty, skipping")
            return 0
        
        logger.info(f"Ingesting {total_docs} documents from {collection_name}...")
        
        # Process in batches
        batch = []
        ingested_count = 0
        point_id = 0
        
        # Get existing max ID from Qdrant to avoid conflicts
        try:
            existing_points = qclient.scroll(
                collection_name=COLLECTION_NAME,
                limit=1,
                with_payload=True
            )[0]
            if existing_points:
                point_id = max([p.id for p in existing_points]) + 1
        except:
            point_id = 0
        
        for doc in collection.find({}):
            try:
                # Extract text
                text = extract_text_from_document(doc, collection_name)
                
                # Create payload
                payload = {
                    "collection": collection_name,
                    "text": text,
                    "original_id": str(doc.get("_id", "")),
                    "ingested_at": datetime.utcnow().isoformat()
                }
                
                # Copy relevant fields to payload
                for field in ["amount", "date", "account_id", "transaction_id", "narration", 
                             "description", "status", "type", "name", "title"]:
                    if field in doc:
                        payload[field] = doc[field]
                
                # Generate embedding
                embedding = embed_model.encode([text], convert_to_numpy=True)[0].tolist()
                
                # Add to batch
                batch.append(models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                ))
                
                point_id += 1
                
                # Upsert batch when full
                if len(batch) >= BATCH_SIZE:
                    qclient.upsert(
                        collection_name=COLLECTION_NAME,
                        points=batch
                    )
                    ingested_count += len(batch)
                    logger.info(f"  Ingested {ingested_count}/{total_docs} documents...")
                    batch = []
                    
            except Exception as e:
                logger.error(f"Error processing document {doc.get('_id')}: {e}")
                continue
        
        # Upsert remaining batch
        if batch:
            qclient.upsert(
                collection_name=COLLECTION_NAME,
                points=batch
            )
            ingested_count += len(batch)
        
        logger.info(f"✓ Ingested {ingested_count} documents from {collection_name}")
        return ingested_count
        
    except Exception as e:
        logger.error(f"Error ingesting collection {collection_name}: {e}")
        return 0

def main():
    """Main ingestion function"""
    logger.info("Starting MongoDB to Qdrant ingestion...")
    
    # Connect to MongoDB
    try:
        mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        mongo_client.server_info()  # Test connection
        logger.info(f"Connected to MongoDB: {MONGODB_URI}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Connect to Qdrant
    try:
        qclient = QdrantClient(url=QDRANT_URL)
        logger.info(f"Connected to Qdrant: {QDRANT_URL}")
    except Exception as e:
        logger.error(f"Failed to connect to Qdrant: {e}")
        sys.exit(1)
    
    # Load embedding model
    try:
        logger.info(f"Loading embedding model: {EMBED_MODEL_NAME}")
        embed_model = SentenceTransformer(EMBED_MODEL_NAME)
        vector_size = embed_model.get_sentence_embedding_dimension()
        logger.info(f"Embedding model loaded. Vector size: {vector_size}")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        sys.exit(1)
    
    # Create collection if needed
    try:
        create_collection_if_not_exists(qclient, COLLECTION_NAME, vector_size)
    except Exception as e:
        logger.error(f"Failed to create collection: {e}")
        sys.exit(1)
    
    # Ingest each collection
    total_ingested = 0
    for collection_name in COLLECTIONS_TO_INGEST:
        try:
            count = ingest_collection(
                mongo_client,
                qclient,
                embed_model,
                collection_name,
                MONGODB_DB
            )
            total_ingested += count
        except Exception as e:
            logger.error(f"Failed to ingest {collection_name}: {e}")
            continue
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Ingestion complete! Total documents ingested: {total_ingested}")
    logger.info(f"{'='*60}")
    
    # Close connections
    mongo_client.close()

if __name__ == "__main__":
    main()

