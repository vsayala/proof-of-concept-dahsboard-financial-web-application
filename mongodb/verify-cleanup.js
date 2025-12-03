// Verify Cleanup - Check Database List
print('🔍 Verifying database cleanup...');

// Get list of all databases
const adminDb = db.getSiblingDB('admin');
const databases = adminDb.runCommand('listDatabases');

print('📊 Current Databases:');
databases.databases.forEach(dbInfo => {
  const dbName = dbInfo.name;
  const size = (dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2);
  
  if (dbName === 'audit_data') {
    print(`  🎯 ${dbName} (${size} MB) - YOUR AUDIT DATA`);
  } else if (['admin', 'config', 'local'].includes(dbName)) {
    print(`  ⚙️  ${dbName} (${size} MB) - System Database`);
  } else {
    print(`  ❌ ${dbName} (${size} MB) - UNEXPECTED DATABASE`);
  }
});

print('\n✅ Cleanup verification complete!');
print('🎯 You should now see only: admin, audit_data, config, local');
