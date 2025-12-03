#!/bin/bash

# Stop All Services Script for Audit POC
# This script stops all services that were started directly (without Docker)

set -e

echo "🛑 Stopping Audit POC - Complete System"
echo "======================================="

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

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop Backend API
print_status $BLUE "🔧 Stopping Backend API..."
if [ -f "logs/api.pid" ]; then
    API_PID=$(cat logs/api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        kill $API_PID 2>/dev/null || true
        print_status $GREEN "✅ Backend API stopped (PID: $API_PID)"
    else
        print_status $YELLOW "⚠️  Backend API process not found"
    fi
    rm -f logs/api.pid
else
    print_status $YELLOW "⚠️  API PID file not found, trying to find process..."
    pkill -f "node.*api-services.*app.js" 2>/dev/null && print_status $GREEN "✅ Backend API stopped" || print_status $YELLOW "⚠️  No API process found"
fi

# Stop Frontend
print_status $BLUE "🎨 Stopping Frontend Application..."
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status $GREEN "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        print_status $YELLOW "⚠️  Frontend process not found"
    fi
    rm -f logs/frontend.pid
else
    print_status $YELLOW "⚠️  Frontend PID file not found, trying to find process..."
    pkill -f "next.*dev" 2>/dev/null && print_status $GREEN "✅ Frontend stopped" || print_status $YELLOW "⚠️  No Frontend process found"
fi

# Kill any remaining Node processes on ports 3000 and 3001
print_status $BLUE "🧹 Cleaning up any remaining processes on ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

print_status $GREEN "🎉 All services stopped successfully!"
echo ""
print_status $BLUE "📋 To start all services again, run:"
echo "  ./start-all-services.sh"
echo ""
