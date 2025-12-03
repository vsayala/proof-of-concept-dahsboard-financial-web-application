#!/bin/bash

# Script to insert dummy data into MongoDB
# This makes the frontend application feel live with realistic data

set -e

echo "🚀 Inserting Dummy Data into MongoDB"
echo "===================================="

# Check if MongoDB is running
echo "📊 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running or not accessible"
        echo ""
        echo "Please start MongoDB first:"
        echo "  macOS: brew services start mongodb-community"
        echo "  Linux: sudo systemctl start mongod"
        echo "  Or run: mongod --dbpath /path/to/data"
        echo ""
        exit 1
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running or not accessible"
        echo ""
        echo "Please start MongoDB first:"
        echo "  macOS: brew services start mongodb-community"
        echo "  Linux: sudo systemctl start mongod"
        echo ""
        exit 1
    fi
else
    echo "⚠️  MongoDB client (mongosh or mongo) not found"
    echo "   Please ensure MongoDB is installed and in your PATH"
    echo ""
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

# Navigate to mongodb directory
cd "$(dirname "$0")/.."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the insertion script
echo ""
echo "📥 Inserting dummy data..."
node scripts/insert-dummy-data.js

echo ""
echo "✅ Dummy data insertion completed!"
echo "🎉 Your frontend application should now show live data!"

