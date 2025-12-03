#!/bin/bash

# Setup Single MongoDB Database
# This script creates one audit_data database with all collections

set -e

echo "🚀 Setting up single audit_data database"
echo "========================================="

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
if ! docker ps | grep -q "mongodb"; then
    print_status $BLUE "📊 Starting MongoDB..."
    docker-compose up -d
    print_status $YELLOW "⏳ Waiting for MongoDB to be ready..."
    sleep 20
else
    print_status $GREEN "✅ MongoDB is already running"
fi

# Wait for MongoDB to be healthy
print_status $BLUE "🔍 Checking MongoDB health..."
until docker exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
    print_status $YELLOW "⏳ Waiting for MongoDB to be ready..."
    sleep 5
done
print_status $GREEN "✅ MongoDB is healthy and responding"

# Copy data folder to MongoDB container
print_status $BLUE "📁 Copying data folder to MongoDB container..."
docker cp ../data mongodb:/tmp/
print_status $GREEN "✅ Data folder copied successfully"

# Initialize database and collections
print_status $BLUE "🗄️ Initializing audit_data database and collections..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/01-init-single-database.js)"
print_status $GREEN "✅ Database and collections created successfully"

# Import data from JSON files
print_status $BLUE "📥 Importing data from JSON files..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/02-import-single-database.js)"
print_status $GREEN "✅ Data import completed successfully"

# Create additional indexes for performance
print_status $BLUE "🔍 Creating performance indexes..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/03-create-indexes.js)"
print_status $GREEN "✅ Performance indexes created successfully"

# Final verification
print_status $BLUE "🔍 Final verification..."
echo ""
print_status $BLUE "📊 Database Status:"
docker exec mongodb mongosh -u admin -p admin123 --eval "
  const db = db.getSiblingDB('audit_data');
  const collections = db.getCollectionNames();
  print('Database: audit_data - Collections: ' + collections.length);
  collections.forEach(col => {
    const count = db[col].countDocuments();
    print('  - ' + col + ': ' + count + ' documents');
  });
"

echo ""
print_status $GREEN "🎉 Single audit_data database setup completed successfully!"
echo ""
print_status $BLUE "🌐 Access Points:"
echo "  • MongoDB: localhost:27017"
echo "  • MongoDB Express: http://localhost:8081 (admin/admin123)"
echo ""
print_status $BLUE "📋 Database Created:"
echo "  • audit_data (single database with all collections)"
echo ""
print_status $YELLOW "📁 All data categories are now in one clean database"
print_status $GREEN "🚀 Your simplified MongoDB structure is ready!"
