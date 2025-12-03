#!/bin/bash

# Setup New MongoDB Databases
# This script recreates the MongoDB databases based on the data folder structure

set -e

echo "🚀 Setting up new MongoDB databases based on data folder structure"
echo "=================================================================="

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

# Initialize databases and collections
print_status $BLUE "🗄️ Initializing databases and collections..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/01-init-databases-new.js)"
print_status $GREEN "✅ Databases and collections created successfully"

# Import data from JSON files
print_status $BLUE "📥 Importing data from JSON files..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/02-import-all-data-new.js)"
print_status $GREEN "✅ Data import completed successfully"

# Create additional indexes for performance
print_status $BLUE "🔍 Creating performance indexes..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/03-create-indexes.js)"
print_status $GREEN "✅ Performance indexes created successfully"

# Create users and roles
print_status $BLUE "👥 Creating users and roles..."
docker exec mongodb mongosh -u admin -p admin123 --eval "$(cat scripts/04-create-users.js)"
print_status $GREEN "✅ Users and roles created successfully"

# Final verification
print_status $BLUE "🔍 Final verification..."
echo ""
print_status $BLUE "📊 Database Status:"
docker exec mongodb mongosh -u admin -p admin123 --eval "
  const environments = ['dev', 'qe', 'stg', 'production'];
  environments.forEach(env => {
    const dbName = 'audit_poc_' + env;
    const currentDb = db.getSiblingDB(dbName);
    const collections = currentDb.getCollectionNames();
    print('Database: ' + dbName + ' - Collections: ' + collections.length);
    collections.forEach(col => {
      const count = currentDb[col].countDocuments();
      print('  - ' + col + ': ' + count + ' documents');
    });
  });
"

echo ""
print_status $GREEN "🎉 New MongoDB databases setup completed successfully!"
echo ""
print_status $BLUE "🌐 Access Points:"
echo "  • MongoDB: localhost:27017"
echo "  • MongoDB Express: http://localhost:8081 (admin/admin123)"
echo ""
print_status $BLUE "📋 Databases Created:"
echo "  • audit_poc_dev"
echo "  • audit_poc_qe"
echo "  • audit_poc_stg"
echo "  • audit_poc_production"
echo ""
print_status $YELLOW "�� Each database contains collections based on the data folder structure"
print_status $GREEN "🚀 Your new MongoDB structure is ready!"
