// MongoDB Initialization Script for Audit POC
// This script creates databases and collections for different environments

print('🚀 Starting MongoDB initialization for Audit POC...');

// Create databases for different environments
const environments = ['dev', 'qe', 'stg', 'production'];

environments.forEach(env => {
  print(`📊 Setting up ${env.toUpperCase()} environment...`);
  
  // Switch to the environment database
  db = db.getSiblingDB(`audit_poc_${env}`);
  
  // Create collections for each data category
  const collections = [
    // Transactional Data
    'journal_entries',
    'payments', 
    'trades',
    
    // Master Data
    'customers',
    'vendors',
    'accounts',
    
    // Supporting Documents
    'invoices',
    'contracts',
    'tax_forms',
    
    // System & Access Logs
    'login_records',
    'change_history',
    
    // Audit Trail
    'approval_chains',
    'change_tracking',
    
    // Compliance
    'kyc_files',
    'regulatory_filings',
    
    // Operational
    'exception_logs',
    'process_mining_traces',
    
    // Financial Reports
    'balance_sheet',
    'pl_statement',
    'cash_flow',
    
    // External Data
    'audit_reports',
    'bank_confirms',
    
    // Communications
    'emails',
    'meeting_notes',
    
    // Metadata
    'data_metadata'
  ];
  
  // Create collections with validation schemas
  collections.forEach(collectionName => {
    if (!db.getCollectionNames().includes(collectionName)) {
      db.createCollection(collectionName, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["created_at", "updated_at"],
            properties: {
              created_at: {
                bsonType: "date",
                description: "must be a date and is required"
              },
              updated_at: {
                bsonType: "date",
                description: "must be a date and is required"
              },
              environment: {
                bsonType: "string",
                enum: environments,
                description: "must be one of the allowed environments"
              }
            }
          }
        },
        validationLevel: "moderate",
        validationAction: "warn"
      });
      
      // Create indexes for common query patterns
      if (collectionName.includes('date') || collectionName.includes('created_at')) {
        db[collectionName].createIndex({ "created_at": -1 });
      }
      
      if (collectionName.includes('status')) {
        db[collectionName].createIndex({ "status": 1 });
      }
      
      if (collectionName.includes('user') || collectionName.includes('by')) {
        db[collectionName].createIndex({ "created_by": 1 });
      }
      
      print(`  ✅ Created collection: ${collectionName}`);
    } else {
      print(`  ℹ️  Collection already exists: ${collectionName}`);
    }
  });
  
  // Create environment-specific indexes
  db.createCollection('environment_config', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["environment", "config_version", "created_at"],
        properties: {
          environment: {
            bsonType: "string",
            enum: environments
          },
          config_version: {
            bsonType: "string"
          },
          created_at: {
            bsonType: "date"
          },
          updated_at: {
            bsonType: "date"
          },
          settings: {
            bsonType: "object"
          }
        }
      }
    }
  });
  
  // Insert environment configuration
  db.environment_config.insertOne({
    environment: env,
    config_version: "1.0.0",
    created_at: new Date(),
    updated_at: new Date(),
    settings: {
      data_retention_days: env === 'production' ? 2555 : 365, // 7 years for prod, 1 year for others
      backup_frequency: env === 'production' ? 'daily' : 'weekly',
      encryption_required: env === 'production',
      audit_logging: true,
      performance_monitoring: true
    }
  });
  
  print(`  🎯 Environment ${env.toUpperCase()} setup completed`);
});

print('✅ All environments initialized successfully!');
print('📝 Next step: Import data from JSON files');
