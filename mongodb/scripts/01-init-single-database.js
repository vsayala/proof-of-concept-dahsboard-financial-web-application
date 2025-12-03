// Initialize single audit_data database based on data folder structure
// This script creates one database with collections for each data category

print('🚀 Starting single database initialization...');

// Create single database
const dbName = 'audit_data';
print(`📊 Creating database: ${dbName}`);

const db = db.getSiblingDB(dbName);

// Define the data structure based on the data folder
const dataStructure = {
  'transactional': {
    'journal_entries': 'sample_journal_entries.json',
    'payments': 'sample_payments.json',
    'trades': 'sample_trades.json'
  },
  'master_data': {
    'customer': 'customer_master.json',
    'vendor': 'vendor_master.json',
    'account_master': 'account_master.json'
  },
  'supporting_docs': {
    'invoices': 'sample_invoices.json',
    'contracts': 'sample_contracts.json',
    'tax_forms': 'sample_tax_forms.json'
  },
  'system_access_logs': {
    'login_records': 'sample_login_records.json',
    'change_history': 'sample_change_history.json'
  },
  'audit_trail': {
    'approval_chains': 'sample_approval_chains.json',
    'change_tracking': 'sample_change_tracking.json'
  },
  'compliance': {
    'kyc_files': 'sample_kyc_files.json',
    'regulatory_filings': 'sample_regulatory_filings.json'
  },
  'operational': {
    'exception_logs': 'sample_exception_logs.json',
    'process_mining_traces': 'sample_process_mining_traces.json'
  },
  'financial_reports': {
    'balance_sheet': 'sample_balance_sheet.json',
    'pl_statement': 'sample_pl_statement.json',
    'cash_flow': 'sample_cash_flow.json'
  },
  'external_data': {
    'audit_reports': 'sample_audit_reports.json',
    'bank_confirms': 'sample_bank_confirms.json'
  },
  'communications': {
    'emails': 'sample_emails.json',
    'meeting_notes': 'sample_meeting_notes.json'
  },
  'metadata': {
    'data_metadata': 'data_metadata.json'
  }
};

// Create collections for each data category
Object.keys(dataStructure).forEach(category => {
  Object.keys(dataStructure[category]).forEach(collection => {
    const collectionName = collection;
    print(`  📁 Creating collection: ${collectionName}`);
    
    // Create the collection
    db.createCollection(collectionName);
    
    // Create basic indexes
    db[collectionName].createIndex({ "created_at": 1 });
    db[collectionName].createIndex({ "updated_at": 1 });
    db[collectionName].createIndex({ "id": 1 });
    
    print(`    ✅ Collection ${collectionName} created with indexes`);
  });
});

// Create database info collection
db.createCollection('database_info');
db.database_info.insertOne({
  database_name: 'audit_data',
  created_at: new Date(),
  description: 'Single Audit Data Database',
  collections: Object.keys(dataStructure),
  total_collections: Object.keys(dataStructure).reduce((acc, category) => acc + Object.keys(dataStructure[category]).length, 0),
  status: 'active'
});

print(`✅ Database ${dbName} initialized successfully with ${Object.keys(dataStructure).reduce((acc, category) => acc + Object.keys(dataStructure[category]).length, 0)} collections!`);
print('📋 Next step: Import data from JSON files');
