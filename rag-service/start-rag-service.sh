#!/bin/bash

# Start RAG Service
# This script starts the Python RAG service

cd "$(dirname "$0")"

echo "🚀 Starting RAG Service..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your configuration"
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check Qdrant
echo "🔍 Checking Qdrant connection..."
if curl -s http://localhost:6333/health > /dev/null 2>&1; then
    echo "✅ Qdrant is running"
else
    echo "⚠️  Qdrant is not running. Start it with: cd ../infra/qdrant && docker-compose up -d"
fi

# Check Ollama
echo "🔍 Checking Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama is not running. Install and start Ollama first."
fi

echo ""
echo "🌐 Starting RAG Service on port ${RAG_SERVICE_PORT:-8001}..."
echo ""

# Start the service
uvicorn app.main:app --reload --host 0.0.0.0 --port ${RAG_SERVICE_PORT:-8001}

