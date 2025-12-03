#!/bin/bash

# MongoDB Setup Script for Audit POC
# This script sets up MongoDB with multiple environments and imports JSON data

set -e

echo "🚀 Starting MongoDB Setup for Audit POC..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use. Please free up the port and try again."
        return 1
    fi
    return 0
}

print_status "Checking port availability..."
check_port 27017 || exit 1
check_port 8081 || exit 1
check_port 6379 || exit 1

print_success "Ports are available"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data/backups

# Start MongoDB services
print_status "Starting MongoDB services with Docker Compose..."
docker-compose up -d

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
sleep 30

# Check if MongoDB is running
if ! docker exec audit-poc-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_error "MongoDB is not responding. Please check the logs with 'docker-compose logs mongodb'"
    exit 1
fi

print_success "MongoDB is running and responding"

# Wait a bit more for MongoDB to fully initialize
print_status "Waiting for MongoDB to fully initialize..."
sleep 10

# Run initialization scripts
print_status "Running database initialization scripts..."

# Initialize databases and collections
print_status "Step 1: Initializing databases and collections..."
docker exec audit-poc-mongodb mongosh --eval "$(cat scripts/01-init-databases.js)"

# Import JSON data
print_status "Step 2: Importing JSON data from data folder..."
docker exec audit-poc-mongodb mongosh --eval "$(cat scripts/02-import-json-data.js)"

# Create performance indexes
print_status "Step 3: Creating performance indexes..."
docker exec audit-poc-mongodb mongosh --eval "$(cat scripts/03-create-indexes.js)"

# Create users and roles
print_status "Step 4: Creating users and roles..."
docker exec audit-poc-mongodb mongosh --eval "$(cat scripts/04-create-users.js)"

print_success "MongoDB setup completed successfully!"

# Display connection information
echo ""
echo "📊 MongoDB Setup Complete!"
echo "=========================="
echo "🌐 MongoDB Server: localhost:27017"
echo "🔑 Username: admin"
echo "🔐 Password: admin123"
echo "📱 MongoDB Express UI: http://localhost:8081"
echo "🔑 Express UI Login: admin/admin123"
echo ""
echo "🗄️  Databases Created:"
echo "  - audit_poc_dev"
echo "  - audit_poc_qe"
echo "  - audit_poc_stg"
echo "  - audit_poc_production"
echo ""
echo "👥 Default Users (password: username123):"
echo "  - admin (System Administrator)"
echo "  - auditor1 (John Auditor)"
echo "  - analyst1 (Sarah Analyst)"
echo "  - compliance1 (Mike Compliance)"
echo "  - finance1 (Lisa Finance)"
echo ""
echo "📁 Collections Created:"
echo "  - journal_entries, payments, trades"
echo "  - customers, vendors, accounts"
echo "  - invoices, contracts, tax_forms"
echo "  - login_records, change_history"
echo "  - approval_chains, change_tracking"
echo "  - kyc_files, regulatory_filings"
echo "  - exception_logs, process_mining_traces"
echo "  - balance_sheet, pl_statement, cash_flow"
echo "  - audit_reports, bank_confirms"
echo "  - emails, meeting_notes"
echo "  - data_metadata, users, roles"
echo ""
echo "🚀 Next Steps:"
echo "  1. Test connections with MongoDB Compass or mongosh"
echo "  2. Run sample queries to verify data"
echo "  3. Configure your application to connect to MongoDB"
echo "  4. Set up monitoring and backup procedures"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose logs -f mongodb"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Access MongoDB shell: docker exec -it audit-poc-mongodb mongosh -u admin -p admin123"
echo ""

# Create a connection test script
cat > test-connection.js << 'EOF'
// Test MongoDB Connection
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = 'mongodb://admin:admin123@localhost:27017/audit_poc_dev?authSource=admin';
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB');
        
        const db = client.db('audit_poc_dev');
        const collections = await db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections`);
        
        // Test a simple query
        const journalCount = await db.collection('journal_entries').countDocuments();
        console.log(`📝 Journal entries count: ${journalCount}`);
        
        const customerCount = await db.collection('customers').countDocuments();
        console.log(`👥 Customers count: ${customerCount}`);
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await client.close();
    }
}

testConnection();
EOF

print_status "Created test-connection.js for testing the connection"

print_success "Setup complete! Your MongoDB instance is ready for use."
