// Import all data from JSON files into MongoDB collections
// This script imports data based on the data folder structure

print('🚀 Starting data import process...');

// Define the data structure mapping
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

// Environments to import data into
const environments = ['dev', 'qe', 'stg', 'production'];

// Function to import data for a specific environment
function importDataForEnvironment(environment) {
  print(`📊 Importing data for environment: ${environment}`);
  
  const dbName = `audit_poc_${environment}`;
  const currentDb = db.getSiblingDB(dbName);
  
  let totalImported = 0;
  
  // Import data for each category
  Object.keys(dataStructure).forEach(category => {
    Object.keys(dataStructure[category]).forEach(collection => {
      const collectionName = collection;
      const jsonFile = dataStructure[category][collection];
      const filePath = `/tmp/data/${category}/${collection}/${jsonFile}`;
      
      print(`  📁 Importing ${collectionName} from ${jsonFile}...`);
      
      try {
        // Check if file exists
        const fileContent = cat(filePath);
        if (fileContent) {
          // Parse JSON content
          let jsonData;
          try {
            jsonData = JSON.parse(fileContent);
          } catch (parseError) {
            print(`    ⚠️  JSON parse error for ${jsonFile}: ${parseError.message}`);
            return;
          }
          
          // Handle both array and single object formats
          let documents = [];
          if (Array.isArray(jsonData)) {
            documents = jsonData;
          } else {
            documents = [jsonData];
          }
          
          // Add metadata to each document
          const enrichedDocuments = documents.map(doc => ({
            ...doc,
            imported_at: new Date(),
            environment: environment,
            source_file: jsonFile,
            category: category
          }));
          
          // Insert documents
          if (enrichedDocuments.length > 0) {
            const result = currentDb[collectionName].insertMany(enrichedDocuments);
            print(`    ✅ Imported ${result.insertedIds.length} documents into ${collectionName}`);
            totalImported += result.insertedIds.length;
          }
        } else {
          print(`    ⚠️  File not found: ${filePath}`);
        }
      } catch (error) {
        print(`    ❌ Error importing ${collectionName}: ${error.message}`);
      }
    });
  });
  
  print(`✅ Environment ${environment}: ${totalImported} documents imported`);
  return totalImported;
}

// Import data for all environments
let grandTotal = 0;
environments.forEach(environment => {
  const imported = importDataForEnvironment(environment);
  grandTotal += imported;
});

print('🎉 Data import completed successfully!');
print(`📊 Total documents imported: ${grandTotal}`);
print('📋 Next step: Create additional indexes for performance');
