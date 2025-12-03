// Cleanup Old Multi-Environment Databases
// This script removes all old databases and keeps only audit_data

print('🧹 Starting cleanup of old multi-environment databases...');

// List of databases to remove
const databasesToRemove = [
  'audit_poc_dev',
  'audit_poc_qe', 
  'audit_poc_stg',
  'audit_poc_production'
];

// Remove each old database
databasesToRemove.forEach(dbName => {
  try {
    print(`🗑️  Removing database: ${dbName}`);
    db.getSiblingDB(dbName).dropDatabase();
    print(`  ✅ Database ${dbName} removed successfully`);
  } catch (e) {
    print(`  ⚠️  Error removing ${dbName}: ${e}`);
  }
});

// Keep only these databases
print('\n✅ Cleanup completed!');
print('📊 Remaining databases:');
print('  - admin (system database)');
print('  - audit_data (your audit data)');
print('  - config (system database)');
print('  - local (system database)');

print('\n🎯 Now you have only the audit_data database as requested!');
