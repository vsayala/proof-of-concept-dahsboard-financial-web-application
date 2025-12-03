#!/bin/bash

# Master Startup Script for Audit POC
# This script starts all services directly (without Docker)

set -e

echo "🚀 Starting Audit POC - Complete System"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if MongoDB is running
print_status $BLUE "📊 Checking MongoDB..."
MONGODB_RUNNING=false

# Try to connect to MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status $GREEN "✅ MongoDB is running"
        MONGODB_RUNNING=true
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_status $GREEN "✅ MongoDB is running"
        MONGODB_RUNNING=true
    fi
fi

# Try to connect via Node.js as fallback
if [ "$MONGODB_RUNNING" = false ]; then
    if node -e "require('mongodb').MongoClient.connect('mongodb://localhost:27017', {serverSelectionTimeoutMS: 2000}).then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; then
        print_status $GREEN "✅ MongoDB is running (verified via Node.js)"
        MONGODB_RUNNING=true
    fi
fi

if [ "$MONGODB_RUNNING" = false ]; then
    print_status $YELLOW "⚠️  MongoDB is not running or not accessible"
    print_status $YELLOW "   The API will start but MongoDB operations may fail"
    print_status $YELLOW "   To start MongoDB:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Or run: mongod --dbpath /path/to/data"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js
print_status $BLUE "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status $GREEN "✅ Node.js is installed: $NODE_VERSION"
else
    print_status $RED "❌ Node.js is not installed"
    print_status $YELLOW "   Please install Node.js 18+: https://nodejs.org/"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Backend API
print_status $BLUE "🔧 Starting Backend API..."
cd api-services

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status $YELLOW "📦 Installing API dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        print_status $YELLOW "📝 Creating .env from env.example..."
        cp env.example .env
    fi
fi

# Start API in background
print_status $GREEN "🚀 Starting API server on port 3000..."
npm start > ../logs/api.log 2>&1 &
API_PID=$!
echo $API_PID > ../logs/api.pid
print_status $GREEN "✅ Backend API started (PID: $API_PID)"

# Wait for API to be ready
print_status $YELLOW "⏳ Waiting for API to be ready..."
sleep 5

# Check API health
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status $GREEN "✅ Backend API is healthy and responding"
        break
    fi
    if [ $i -eq 10 ]; then
        print_status $YELLOW "⚠️  API health check failed (may still be starting)"
        print_status $YELLOW "📋 Check logs: tail -f logs/api.log"
    else
        sleep 2
    fi
done

cd ..

# Start Frontend
print_status $BLUE "🎨 Starting Frontend Application..."
cd frontend-service

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status $YELLOW "📦 Installing Frontend dependencies..."
    npm install
fi

# Start Frontend in background
print_status $GREEN "🚀 Starting Frontend server on port 3001..."
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
print_status $GREEN "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for Frontend to be ready
print_status $YELLOW "⏳ Waiting for Frontend to be ready..."
sleep 10

# Check Frontend health
for i in {1..10}; do
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        print_status $GREEN "✅ Frontend is healthy and responding"
        break
    fi
    if [ $i -eq 10 ]; then
        print_status $YELLOW "⚠️  Frontend health check failed (may still be starting)"
        print_status $YELLOW "📋 Check logs: tail -f logs/frontend.log"
    else
        sleep 2
    fi
done

cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Final status
echo ""
print_status $GREEN "🎉 All services started successfully!"
echo ""
print_status $BLUE "🌐 Access Points:"
echo "  • Frontend Application: http://localhost:3001"
echo "  • Backend API: http://localhost:3000"
echo "  • API Health Check: http://localhost:3000/health"
echo "  • MongoDB: localhost:27017"
echo ""
print_status $BLUE "📋 Process IDs:"
echo "  • Backend API PID: $API_PID (saved to logs/api.pid)"
echo "  • Frontend PID: $FRONTEND_PID (saved to logs/frontend.pid)"
echo ""
print_status $YELLOW "📋 Useful Commands:"
echo "  • View API logs: tail -f logs/api.log"
echo "  • View Frontend logs: tail -f logs/frontend.log"
echo "  • Stop all services: ./stop-all-services.sh"
echo "  • Check API health: curl http://localhost:3000/health"
echo ""
print_status $GREEN "🚀 Your Audit POC system is now running!"
