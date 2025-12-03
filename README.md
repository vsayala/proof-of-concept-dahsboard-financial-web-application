# FINANCIAL DASHBOARD

## Complete Project Documentation

### Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Quick Start Guide](#quick-start-guide)
5. [Installation & Setup](#installation--setup)
6. [MongoDB Setup](#mongodb-setup)
7. [Data Setup](#data-setup)
8. [Running the Application](#running-the-application)
9. [RAG System Implementation](#rag-system-implementation)
10. [Features](#features)
11. [API Documentation](#api-documentation)
12. [Logging System](#logging-system)
13. [Configuration](#configuration)
14. [Troubleshooting](#troubleshooting)
15. [Development Guide](#development-guide)

---

## Project Overview

This is a **comprehensive Financial Dashboard System** for managing, analyzing, and querying financial data with intelligent AI-powered assistance.

### Key Capabilities

- **Financial Dashboard**: Real-time KPIs, revenue trends, expense analysis with 3D visualizations
- **Compliance Management**: Regulatory compliance tracking, audit reports, KYC management
- **Risk Assessment**: Risk metrics, fraud detection, risk heatmaps with comprehensive reporting
- **AI Chatbot**: Intelligent RAG-powered assistant using Ollama 7b LLM with vector search
- **3D Visualizations**: Interactive 3D charts for data analysis (Plotly.js)
- **Process Mining**: Visual process flow analysis
- **Unified Logging**: Comprehensive logging system tracking all operations

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Plotly.js
- **Backend**: Node.js, Express.js, MongoDB
- **AI/LLM**: Ollama (llama2:7b), RAG (Retrieval-Augmented Generation)
- **Vector Database**: Qdrant (for semantic search)
- **Embeddings**: SentenceTransformers (all-MiniLM-L6-v2 or all-mpnet-base-v2)
- **Database**: MongoDB
- **Logging**: Winston (unified logging system)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│                    Port: 3001                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Compliance│  │   Risk   │  │ Chatbot  │   │
│  │  3D Viz  │  │  Status  │  │Assessment│  │   RAG    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
┌───────────────────────▼─────────────────────────────────────┐
│              Backend API (Express.js)                        │
│                    Port: 3000                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Controllers│ │ Services │  │   RAG    │  │  Logger  │   │
│  │  Routes   │  │ Business │  │ Service  │  │ Unified  │   │
│  │           │  │  Logic   │  │  LLM     │  │  Logging │   │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘   │
└───────────────────────┬────────────┼─────────────────────────┘
                        │            │
                        │            │ HTTP API
                        │            │
┌───────────────────────▼────────────▼─────────────────────────┐
│         Python RAG Service (FastAPI)                         │
│                    Port: 8001                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Embeddings│  │  Qdrant  │  │  Ollama  │  │ Reranker │   │
│  │Sentence- │  │  Vector  │  │   LLM    │  │(optional)│   │
│  │Transform │  │   DB     │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ MongoDB Driver
┌───────────────────────▼─────────────────────────────────────┐
│                    MongoDB Database                          │
│                    Port: 27017                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Customers │  │Journal   │  │Regulatory│  │  Audit   │   │
│  │  KYC     │  │ Entries  │  │ Filings  │  │ Reports  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Core Services

#### `api-services/` - Backend API (Node.js/Express)
- `src/app.js` - Main application entry point
- `src/controllers/` - API route handlers
  - `chatbotController.js` - Chatbot/RAG endpoints
  - `complianceController.js` - Compliance data endpoints
  - `riskAssessmentController.js` - Risk assessment endpoints
  - `transactionalController.js` - Transaction data endpoints
- `src/services/` - Business logic services
  - `mongodb/` - MongoDB service (primary)
  - `rag/` - RAG service for AI chatbot
    - `ragService.js` - Node.js RAG implementation
    - `pythonRAGService.js` - Python RAG service wrapper
  - `sql/` - SQL Server service (optional)
  - `deltalake/` - Delta Lake service (optional)
  - `flatfiles/` - Flat file service (optional)
- `src/middleware/` - Express middleware
  - `errorHandler.js` - Global error handling
  - `requestLogger.js` - Request logging
- `src/config/` - Configuration files
  - `database.js` - Database connections
- `src/utils/` - Utility functions
  - `logger.js` - Unified logging system

#### `frontend-service/` - Frontend Application (Next.js)
- `app/` - Next.js app directory
  - `dashboard/` - Financial dashboard with 3D visualizations
  - `compliance/` - Compliance dashboard
  - `risk-assessment/` - Risk assessment dashboard with comprehensive reports
  - `chatbot/` - AI chatbot interface
  - `landing/` - Landing page
- `components/` - React components
  - `ProcessMiningFlowchart.tsx` - Process mining visualization

#### `rag-service/` - Python RAG Service (FastAPI)
- `app/main.py` - FastAPI application and endpoints
- `app/rag_pipeline.py` - RAG pipeline (retrieve, prompt, generate)
- `app/model_clients.py` - Embedding and LLM client wrappers
- `requirements.txt` - Python dependencies
- `start-rag-service.sh` - Startup script

### Infrastructure

#### `infra/` - Infrastructure as Code
- `qdrant/` - Qdrant vector database setup
  - `docker-compose.yml` - Qdrant Docker configuration

#### `mongodb/` - MongoDB setup scripts
- `scripts/` - Database initialization scripts
- `config/` - MongoDB configuration

#### `neo4j/` - Neo4j graph database (if used)

### Scripts

#### `scripts/` - Utility scripts
- `ingest-mongodb-to-qdrant.py` - MongoDB to Qdrant ingestion
- `test-rag-service.py` - RAG service testing

### Configuration

#### `config/` - Configuration files
- `config.local.yaml` - Local configuration
- `config.prod.yaml` - Production configuration

### Logs

#### `logs/` - Application logs
- `audit-poc.log` - Unified application log (all operations)
- `api-startup.log` - API startup log
- `frontend-startup.log` - Frontend startup log

### Root Files

- `README.md` - This file (complete documentation)
- `start-all-services.sh` - Start all services script
- `stop-all-services.sh` - Stop all services script

---

## Quick Start Guide

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **MongoDB** (v6 or higher)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: `sudo apt-get install mongodb`
   - **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

3. **Ollama** (Optional, for AI chatbot)
   - **macOS**: `brew install ollama`
   - **Linux/Windows**: Download from [ollama.ai](https://ollama.ai)
   - Pull model: `ollama pull llama2:7b`

4. **Python 3.8+** (For RAG service)
   - Verify: `python3 --version`

5. **Docker** (For Qdrant, optional)
   - Download from [docker.com](https://www.docker.com/)

### 3-Step Quick Start

1. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Start All Services**
   ```bash
   ./start-all-services.sh
   ```

3. **Access Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

---

## Installation & Setup

### Step 1: Clone and Navigate

```bash
cd FINANCIAL-DASHBOARD
```

### Step 2: Install Backend Dependencies

```bash
cd api-services
npm install
cd ..
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend-service
npm install
cd ..
```

### Step 4: Configure Environment

```bash
# Backend
cd api-services
cp env.example .env
# Edit .env with your settings
cd ..

# Frontend (usually works with defaults)
# No .env needed for basic setup
```

### Step 5: Install Python RAG Service Dependencies (Optional)

```bash
cd rag-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

---

## MongoDB Setup

### Start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
# Start MongoDB service from Services panel
# Or run: mongod --dbpath C:\data\db
```

### Verify MongoDB is Running

```bash
# Using mongosh
mongosh --eval "db.runCommand('ping')"

# Or using mongo
mongo --eval "db.runCommand('ping')"
```

### Initialize Databases

```bash
cd mongodb
npm install
node scripts/01-init-databases-new.js
```

---

## Data Setup

### Option 1: Import Sample Data

```bash
cd mongodb
node scripts/02-import-all-data-new.js
```

### Option 2: Insert Dummy Data

```bash
cd mongodb
node scripts/insert-dummy-data.js
```

### Verify Data

```bash
cd mongodb
node verify-database.js
```

---

## Running the Application

### Start All Services (Recommended)

```bash
./start-all-services.sh
```

This script will:
- Check MongoDB connection
- Start Backend API (port 3000)
- Start Frontend (port 3001)
- Verify services are healthy

### Start Services Individually

**Backend API:**
```bash
cd api-services
npm start
```

**Frontend:**
```bash
cd frontend-service
npm run dev
```

### Stop All Services

```bash
./stop-all-services.sh
```

### Access Points

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **MongoDB**: localhost:27017

---

## RAG System Implementation

The RAG (Retrieval-Augmented Generation) system provides intelligent question-answering using vector search and local LLM.

### Architecture Overview

```
[Frontend] → [Node.js API] → [Python RAG Service] → [Qdrant + Ollama]
                              ↓
                         [MongoDB (source)]
```

### Components

#### 1. Python RAG Service (`rag-service/`)

FastAPI-based service that handles:
- Document embedding using SentenceTransformers
- Vector search using Qdrant
- LLM inference using Ollama
- Response generation with source citations
- Numeric verification

**Key Files:**
- `app/main.py` - FastAPI application and endpoints
- `app/rag_pipeline.py` - RAG pipeline (retrieve, prompt, generate)
- `app/model_clients.py` - Embedding and LLM client wrappers

#### 2. Qdrant Vector Database

Self-hosted vector database for semantic search.

**Location:** `infra/qdrant/`

**Start:**
```bash
cd infra/qdrant
docker-compose up -d
```

**Verify:**
```bash
curl http://localhost:6333/health
```

#### 3. MongoDB to Qdrant Ingestion

Script to index MongoDB documents in Qdrant.

**Location:** `scripts/ingest-mongodb-to-qdrant.py`

**Run:**
```bash
python scripts/ingest-mongodb-to-qdrant.py
```

#### 4. Node.js Integration

Wrapper service that calls Python RAG service from Node.js.

**Location:** `api-services/src/services/rag/pythonRAGService.js`

### RAG Setup Guide

#### Step 1: Start Qdrant

```bash
cd infra/qdrant
docker-compose up -d
```

Verify: `curl http://localhost:6333/health`

#### Step 2: Install Python Dependencies

```bash
cd rag-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Step 3: Configure Environment

```bash
cd rag-service
cp .env.example .env
# Edit .env with your settings
```

**Key Environment Variables:**
- `QDRANT_URL` - Qdrant server URL (default: http://localhost:6333)
- `QDRANT_COLLECTION` - Collection name (default: audit_documents)
- `EMBED_MODEL` - Embedding model (default: all-MiniLM-L6-v2)
- `OLLAMA_URL` - Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Ollama model name (default: llama2:7b)
- `RAG_SERVICE_PORT` - Service port (default: 8001)

#### Step 4: Ingest MongoDB Data

```bash
# Make sure MongoDB is running and has data
python scripts/ingest-mongodb-to-qdrant.py
```

#### Step 5: Start RAG Service

```bash
cd rag-service
./start-rag-service.sh
```

Or manually:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

#### Step 6: Configure Node.js to Use Python RAG

Add to `api-services/.env`:
```
USE_PYTHON_RAG=true
PYTHON_RAG_SERVICE_URL=http://localhost:8001
```

### RAG API Endpoints

#### POST /api/chat

Main RAG endpoint for question answering.

**Request:**
```json
{
  "query": "Find suspicious transactions above 10000",
  "k": 6,
  "verify_numbers": true,
  "filter": {
    "collection": "journal_entries"
  }
}
```

**Response:**
```json
{
  "answer": "Based on the retrieved documents...",
  "sources": [1, 2, 3],
  "hits": [...],
  "retrieval_count": 3,
  "query": "Find suspicious transactions above 10000"
}
```

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "ollama_available": true,
  "qdrant_available": true,
  "embedding_model": "all-MiniLM-L6-v2",
  "embedding_dimension": 384
}
```

#### GET /api/search

Raw search endpoint (returns documents without LLM generation).

**Query Parameters:**
- `query`: Search query
- `k`: Number of results (default: 6)

### Integration Flow

1. **User Query** → Frontend sends query to Node.js API
2. **Node.js API** → Checks if Python RAG is enabled
3. **Python RAG Service** → 
   - Encodes query using SentenceTransformers
   - Searches Qdrant for relevant documents
   - Builds prompt with retrieved context
   - Calls Ollama for LLM generation
   - Verifies numeric claims
   - Returns answer with sources
4. **Node.js API** → Returns response to frontend

### Fallback Behavior

If Python RAG service is unavailable:
- Node.js falls back to existing RAG implementation
- Uses MongoDB direct queries
- Still uses Ollama for LLM generation
- Maintains backward compatibility

### RAG Troubleshooting

#### Qdrant Connection Issues

```bash
# Check if Qdrant is running
docker ps | grep qdrant

# Check Qdrant logs
docker logs qdrant-audit-poc

# Restart Qdrant
cd infra/qdrant
docker-compose restart
```

#### Python RAG Service Not Starting

```bash
# Check Python version (requires 3.8+)
python3 --version

# Check dependencies
cd rag-service
pip list | grep -E "fastapi|sentence-transformers|qdrant"

# Check logs
uvicorn app.main:app --reload --log-level debug
```

#### No Documents Retrieved

1. Run ingestion script: `python scripts/ingest-mongodb-to-qdrant.py`
2. Check MongoDB has data
3. Verify collection name in Qdrant: `curl http://localhost:6333/collections/audit_documents`

#### Poor Answer Quality

1. **Increase retrieval count:** Set `k` parameter to 10-15
2. **Use better embedding model:** Change `EMBED_MODEL` to `all-mpnet-base-v2`
3. **Add reranker:** Implement cross-encoder reranker (future enhancement)
4. **Check document quality:** Ensure MongoDB documents have searchable text fields

### RAG Performance Optimization

#### Embedding Model Selection

- **all-MiniLM-L6-v2** (384 dims) - Fast, good for PoC
- **all-mpnet-base-v2** (768 dims) - Better quality, slower

#### Batch Processing

For large datasets, process in batches:
```python
# In ingestion script, adjust BATCH_SIZE
BATCH_SIZE = 100  # Increase for faster ingestion
```

#### Caching

Consider adding Redis caching for:
- Frequent queries
- Embedding vectors
- Retrieved documents

---

## Features

### Financial Dashboard

- **Real-time KPIs**: Revenue, profit, expenses, cash flow
- **3D Visualizations**: Interactive 3D charts using Plotly.js
  - 3D Pie Chart for Expense Breakdown
  - 3D Flowing Ribbon for Cash Flow Analysis
  - 3D Bar Chart for Transaction Types Distribution
- **Revenue Trends**: Monthly revenue and profit analysis
- **Recent Transactions**: Latest transaction records

### Compliance Dashboard

- **Compliance KPIs**: Overall compliance rate, audit completion, finding resolution
- **Regulatory Overview**: SOX, GDPR, PCI DSS, HIPAA, ISO 27001, Basel III
- **Status Distribution**: Visual breakdown of compliance status
- **Audit Timeline**: Historical audit events
- **Recent Audits**: Latest audit reports
- **Risk Areas**: Compliance risk identification

### Risk Assessment Dashboard

- **Risk KPIs**: Overall risk score, high/medium/low risk items, critical alerts
- **3D Risk Trends**: Interactive 3D visualization of risk trends over time
- **3D Risk Categories**: Distribution of risk categories
- **3D Fraud Detection**: Fraud detection analysis with detected/prevented metrics
- **3D Risk Heatmap**: Probability vs Impact analysis
- **Comprehensive Risk Reports**: Detailed PDF-ready risk assessment reports with:
  - Executive summary
  - Detailed risk categories analysis
  - 6-month trend analysis
  - Fraud detection analysis
  - Risk heatmap
  - Critical alerts
  - Mitigation strategies
  - Recommendations and action items

### AI Chatbot

- **RAG-Powered**: Uses Retrieval-Augmented Generation for intelligent responses
- **Vector Search**: Semantic search using Qdrant
- **Local LLM**: Uses Ollama (llama2:7b) - no cloud APIs
- **Source Citations**: Provides sources for answers
- **Numeric Verification**: Validates numeric claims against retrieved data
- **Context-Aware**: Understands audit data context

### Process Mining

- **Visual Flowcharts**: Interactive process flow visualization
- **Process Analysis**: Identify bottlenecks and inefficiencies

### Logging System

- **Unified Logging**: All operations logged to `logs/audit-poc.log`
- **Comprehensive Tracking**: Request/response, errors, performance, business events
- **Structured Format**: JSON format for easy parsing
- **Performance Metrics**: Duration tracking for all operations

---

## API Documentation

### Base URL

```
http://localhost:3000
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "used": 50,
    "total": 100,
    "rss": 128
  }
}
```

### Chatbot API

#### POST /api/chatbot/query

Query the AI chatbot.

**Request:**
```json
{
  "query": "How many active customers do I have?",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on the audit data...",
    "query": "How many active customers do I have?",
    "context": {...},
    "usedLLM": "ollama",
    "processingTime": 1234
  },
  "timestamp": "2025-11-26T12:00:00.000Z",
  "requestId": "req_1234567890"
}
```

### Compliance API

#### GET /api/compliance/kpis

Get compliance KPIs.

**Query Parameters:**
- `environment` (optional): Environment name (default: "dev")

**Response:**
```json
{
  "success": true,
  "data": {
    "overallCompliance": 89,
    "auditCompletion": 95,
    "findingResolution": 78,
    "trainingCompletion": 85
  },
  "metadata": {
    "totalRegulatoryFilings": 8,
    "totalKycFiles": 3,
    "totalAudits": 5,
    "totalFindings": 15,
    "resolvedFindings": 12
  }
}
```

#### GET /api/compliance/regulatory-overview

Get regulatory compliance overview.

#### GET /api/compliance/status-distribution

Get compliance status distribution.

#### GET /api/compliance/audit-timeline

Get audit timeline.

#### GET /api/compliance/recent-audits

Get recent audit reports.

#### GET /api/compliance/risk-areas

Get compliance risk areas.

### Risk Assessment API

#### GET /api/risk-assessment/kpis

Get risk assessment KPIs.

**Response:**
```json
{
  "success": true,
  "data": {
    "overallRiskScore": 72,
    "highRiskItems": 8,
    "mediumRiskItems": 15,
    "lowRiskItems": 42,
    "criticalAlerts": 3
  }
}
```

#### GET /api/risk-assessment/risk-trends

Get risk trends over time.

#### GET /api/risk-assessment/risk-categories

Get risk categories distribution.

#### GET /api/risk-assessment/fraud-detection

Get fraud detection analysis.

#### GET /api/risk-assessment/risk-heatmap

Get risk heatmap (probability vs impact).

### Transactional API

#### GET /api/transactional/journal-entries

Get journal entries.

**Query Parameters:**
- `source` (optional): Data source (mongodb, sql, deltalake, flatfiles)
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Pagination offset (default: 0)

#### GET /api/transactional/payments

Get payment records.

#### GET /api/transactional/trades

Get trade records.

---

## Logging System

### Unified Logging

All application logs are written to `logs/audit-poc.log` in JSON format.

### Log Levels

- **error**: Errors and exceptions
- **warn**: Warnings
- **info**: Informational messages
- **debug**: Debug information
- **http**: HTTP requests/responses

### Log Structure

```json
{
  "level": "info",
  "message": "Operation completed",
  "timestamp": "2025-11-26T12:00:00.000Z",
  "module": "controller",
  "operation": "get_data",
  "duration": 123,
  "requestId": "req_1234567890"
}
```

### Viewing Logs

```bash
# View all logs
tail -f logs/audit-poc.log

# View errors only
tail -f logs/audit-poc.log | grep '"level":"error"'

# View specific module
tail -f logs/audit-poc.log | grep '"module":"chatbot"'
```

---

## Configuration

### Backend Configuration

**File:** `api-services/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/audit_data
MONGO_DATABASE=audit_data

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2:7b
USE_OLLAMA=true

# RAG
USE_PYTHON_RAG=true
PYTHON_RAG_SERVICE_URL=http://localhost:8001
RAG_SERVICE_TIMEOUT=30000
RAG_MAX_DOCS=10

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Frontend Configuration

**File:** `frontend-service/.env.local` (optional)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### RAG Service Configuration

**File:** `rag-service/.env`

```env
# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=audit_documents

# Embedding Model
EMBED_MODEL=all-MiniLM-L6-v2

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2:7b

# Service
RAG_SERVICE_PORT=8001

# MongoDB (for ingestion)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=audit_data
```

---

## Troubleshooting

### MongoDB Connection Issues

**Problem:** "MongoServerSelectionError" or "Topology is closed"

**Solutions:**
1. Check MongoDB is running:
   ```bash
   brew services list  # macOS
   sudo systemctl status mongod  # Linux
   ```

2. Restart MongoDB:
   ```bash
   brew services restart mongodb-community  # macOS
   sudo systemctl restart mongod  # Linux
   ```

3. Check connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/audit_data
   ```

### Frontend Not Loading

**Problem:** Frontend shows errors or doesn't compile

**Solutions:**
1. Clear Next.js cache:
   ```bash
   cd frontend-service
   rm -rf .next
   npm run dev
   ```

2. Reinstall dependencies:
   ```bash
   cd frontend-service
   rm -rf node_modules
   npm install
   ```

3. Check for TypeScript errors:
   ```bash
   cd frontend-service
   npm run build
   ```

### Ollama Not Working

**Problem:** Chatbot returns errors or no response

**Solutions:**
1. Check Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Verify model is available:
   ```bash
   ollama list
   ```

3. Pull model if missing:
   ```bash
   ollama pull llama2:7b
   ```

4. Check Ollama URL in `.env`:
   ```env
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama2:7b
   ```

### RAG Service Issues

**Problem:** Python RAG service not responding

**Solutions:**
1. Check Qdrant is running:
   ```bash
   docker ps | grep qdrant
   curl http://localhost:6333/health
   ```

2. Check Python service:
   ```bash
   cd rag-service
   source venv/bin/activate
   python -c "from app.model_clients import get_embed_model; get_embed_model()"
   ```

3. Check logs:
   ```bash
   tail -f logs/audit-poc.log | grep "RAG"
   ```

### Port Already in Use

**Problem:** "Port 3000/3001 already in use"

**Solutions:**
1. Find process using port:
   ```bash
   lsof -ti:3000
   lsof -ti:3001
   ```

2. Kill process:
   ```bash
   kill -9 $(lsof -ti:3000)
   kill -9 $(lsof -ti:3001)
   ```

3. Or use stop script:
   ```bash
   ./stop-all-services.sh
   ```

---

## Development Guide

### Project Structure

See [Project Structure](#project-structure) section above.

### Adding New Features

1. **Backend API Endpoint:**
   - Create controller in `api-services/src/controllers/`
   - Add route in `api-services/src/app.js`
   - Add service logic in `api-services/src/services/`

2. **Frontend Page:**
   - Create page in `frontend-service/app/`
   - Add components in `frontend-service/components/`

3. **RAG Enhancement:**
   - Modify `rag-service/app/rag_pipeline.py`
   - Update ingestion script if needed

### Code Style

- **Backend:** Follow Express.js best practices
- **Frontend:** Follow Next.js and React best practices
- **Python:** Follow PEP 8 style guide
- **Logging:** Use unified logger for all operations
- **Error Handling:** Use try-catch blocks and error middleware

### Testing

**Backend:**
```bash
cd api-services
npm test
```

**Frontend:**
```bash
cd frontend-service
npm run build
```

**RAG Service:**
```bash
python scripts/test-rag-service.py
```

### Deployment

1. **Build Frontend:**
   ```bash
   cd frontend-service
   npm run build
   npm start
   ```

2. **Start Backend:**
   ```bash
   cd api-services
   NODE_ENV=production npm start
   ```

3. **Start RAG Service:**
   ```bash
   cd rag-service
   uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```

### Environment Variables

Set all required environment variables in production:
- MongoDB connection string
- Ollama URL and model
- Qdrant URL
- API URLs
- CORS origins

---

## Support

For issues or questions:

1. Check logs: `tail -f logs/audit-poc.log`
2. Verify all services are running
3. Test each component individually
4. Review this documentation
5. Check troubleshooting section

---

## License

MIT License - See LICENSE file for details

---

## Contributors

Financial Dashboard Team

---

**Last Updated:** November 2025
