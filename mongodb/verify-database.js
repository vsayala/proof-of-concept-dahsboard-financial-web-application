// Verify Single Database Setup
print('🔍 Verifying audit_data database setup...');

// Switch to audit_data database
const db = db.getSiblingDB('audit_data');

// Get all collections
const collections = db.getCollectionNames();
print(`📊 Database: audit_data`);
print(`📁 Total Collections: ${collections.length}`);

// Count documents in each collection
let totalDocuments = 0;
collections.forEach(collection => {
  const count = db[collection].countDocuments();
  totalDocuments += count;
  print(`  - ${collection}: ${count} documents`);
});

print(`\n📈 Total Documents: ${totalDocuments}`);
print(`✅ Database verification complete!`);
