// Initialize databases based on data folder structure
// This script creates databases and collections for each data category

print('🚀 Starting database initialization...');

// Create databases for different environments
const environments = ['dev', 'qe', 'stg', 'production'];

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

// Create databases and collections for each environment
environments.forEach(environment => {
  const dbName = `audit_poc_${environment}`;
  print(`📊 Creating database: ${dbName}`);
  
  const currentDb = db.getSiblingDB(dbName);
  
  // Create collections for each data category
  Object.keys(dataStructure).forEach(category => {
    Object.keys(dataStructure[category]).forEach(collection => {
      const collectionName = collection;
      print(`  📁 Creating collection: ${collectionName}`);
      
      // Create the collection
      currentDb.createCollection(collectionName);
      
      // Create basic indexes
      currentDb[collectionName].createIndex({ "created_at": 1 });
      currentDb[collectionName].createIndex({ "updated_at": 1 });
      currentDb[collectionName].createIndex({ "id": 1 });
      
      print(`    ✅ Collection ${collectionName} created with indexes`);
    });
  });
  
  // Create environment configuration collection
  currentDb.createCollection('environment_config');
  currentDb.environment_config.insertOne({
    environment: environment,
    created_at: new Date(),
    description: `Audit POC ${environment} environment`,
    collections: Object.keys(dataStructure),
    status: 'active'
  });
  
  print(`✅ Database ${dbName} initialized successfully`);
});

print('🎉 All databases and collections initialized successfully!');
print('📋 Next step: Import data from JSON files');
