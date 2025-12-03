const { MongoClient } = require('mongodb');

/**
 * Insert comprehensive dummy data into MongoDB for all collections
 * This makes the frontend application feel live with realistic data
 */

// Try to get database name from connection string or use default
const getDatabaseName = (uri) => {
  const match = uri.match(/\/([^?]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return 'audit_data';
};

const MONGODB_URI_BASE = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.MONGO_DATABASE || getDatabaseName(MONGODB_URI_BASE) || 'audit_data';
const MONGODB_URI = MONGODB_URI_BASE.includes('/') ? MONGODB_URI_BASE : `${MONGODB_URI_BASE}/${DATABASE_NAME}`;

// Helper function to generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to random number in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to random float in range
function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function insertDummyData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing collections...');
    const collections = [
      'customers', 'journal_entries', 'payments', 'trades',
      'regulatory_filings', 'kyc_files', 'audit_reports',
      'exception_logs', 'login_records', 'process_mining_traces'
    ];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).deleteMany({});
        console.log(`   Cleared ${collectionName}`);
      } catch (error) {
        console.log(`   Collection ${collectionName} doesn't exist yet`);
      }
    }
    
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 1. CUSTOMERS DATA
    console.log('👥 Inserting customer data...');
    const customerNames = [
      'Acme Corporation', 'TechStart Inc', 'Global Finance Ltd', 'Digital Solutions Co',
      'Enterprise Systems', 'Financial Services Group', 'Innovation Labs', 'Capital Markets',
      'Business Partners LLC', 'Strategic Investments', 'Premier Banking', 'Merchant Services',
      'Corporate Holdings', 'Investment Group', 'Trading Partners', 'Financial Advisors',
      'Wealth Management', 'Private Equity', 'Venture Capital', 'Asset Management'
    ];
    
    const customerStatuses = ['active', 'inactive', 'pending', 'verified', 'suspended'];
    const kycStatuses = ['verified', 'pending', 'rejected', 'under_review', 'approved'];
    
    const customers = [];
    for (let i = 0; i < 50; i++) {
      const createdDate = randomDate(oneYearAgo, now);
      customers.push({
        name: customerNames[i % customerNames.length] + (i > customerNames.length ? ` ${Math.floor(i / customerNames.length) + 1}` : ''),
        customerName: customerNames[i % customerNames.length] + (i > customerNames.length ? ` ${Math.floor(i / customerNames.length) + 1}` : ''),
        email: `customer${i + 1}@example.com`,
        email_address: `customer${i + 1}@example.com`,
        status: randomElement(customerStatuses),
        kycStatus: randomElement(kycStatuses),
        kyc_status: randomElement(kycStatuses),
        accountNumber: `ACC${String(1000000 + i).padStart(7, '0')}`,
        account_number: `ACC${String(1000000 + i).padStart(7, '0')}`,
        createdDate: createdDate,
        created_date: createdDate,
        created_at: createdDate,
        phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        address: `${randomInt(100, 9999)} Main Street, City ${i % 10 + 1}`,
        country: ['USA', 'UK', 'Canada', 'Germany', 'France'][i % 5],
        industry: ['Finance', 'Technology', 'Healthcare', 'Manufacturing', 'Retail'][i % 5],
        environment: 'dev'
      });
    }
    await db.collection('customers').insertMany(customers);
    console.log(`   ✅ Inserted ${customers.length} customers`);
    
    // 2. JOURNAL ENTRIES
    console.log('📊 Inserting journal entries...');
    const accountNames = [
      'Cash Account', 'Accounts Receivable', 'Accounts Payable', 'Revenue Account',
      'Expense Account', 'Asset Account', 'Liability Account', 'Equity Account',
      'Operating Account', 'Investment Account', 'Savings Account', 'Checking Account'
    ];
    
    const descriptions = [
      'Monthly revenue transaction', 'Payment processing fee', 'Service charge',
      'Interest payment', 'Dividend distribution', 'Loan repayment', 'Invoice payment',
      'Refund processing', 'Transfer between accounts', 'Account reconciliation',
      'Quarterly adjustment', 'Year-end closing', 'Tax payment', 'Salary payment',
      'Vendor payment', 'Client refund', 'Investment return', 'Capital contribution'
    ];
    
    const journalEntries = [];
    for (let i = 0; i < 200; i++) {
      const date = randomDate(oneMonthAgo, now);
      const amount = randomFloat(100, 100000);
      const debitAmount = Math.random() > 0.5 ? amount : 0;
      const creditAmount = debitAmount === 0 ? amount : 0;
      
      journalEntries.push({
        description: randomElement(descriptions),
        narrative: randomElement(descriptions),
        accountName: randomElement(accountNames),
        account_name: randomElement(accountNames),
        amount: amount,
        debitAmount: debitAmount,
        creditAmount: creditAmount,
        date: date,
        transactionDate: date,
        createdDate: date,
        created_date: date,
        status: randomElement(['completed', 'pending', 'approved', 'rejected']),
        created_by: `user${randomInt(1, 10)}`,
        reference: `REF-${String(10000 + i).padStart(6, '0')}`,
        environment: 'dev'
      });
    }
    await db.collection('journal_entries').insertMany(journalEntries);
    console.log(`   ✅ Inserted ${journalEntries.length} journal entries`);
    
    // 3. PAYMENTS
    console.log('💳 Inserting payment data...');
    const paymentMethods = ['Credit Card', 'Bank Transfer', 'Wire Transfer', 'ACH', 'Check', 'PayPal'];
    const paymentStatuses = ['completed', 'pending', 'failed', 'cancelled', 'processing'];
    
    const payments = [];
    for (let i = 0; i < 150; i++) {
      const date = randomDate(oneMonthAgo, now);
      payments.push({
        amount: randomFloat(50, 50000),
        description: `Payment ${i + 1} - ${randomElement(['Invoice', 'Subscription', 'Service', 'Product'])}`,
        paymentMethod: randomElement(paymentMethods),
        status: randomElement(paymentStatuses),
        date: date,
        transactionDate: date,
        createdDate: date,
        payer: `Customer ${randomInt(1, 50)}`,
        payee: `Vendor ${randomInt(1, 20)}`,
        reference: `PAY-${String(100000 + i).padStart(6, '0')}`,
        environment: 'dev'
      });
    }
    await db.collection('payments').insertMany(payments);
    console.log(`   ✅ Inserted ${payments.length} payments`);
    
    // 4. TRADES
    console.log('📈 Inserting trade data...');
    const instruments = ['Stock', 'Bond', 'Option', 'Future', 'Forex', 'Commodity'];
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'BAC', 'WMT'];
    
    const trades = [];
    for (let i = 0; i < 100; i++) {
      const date = randomDate(oneMonthAgo, now);
      trades.push({
        symbol: randomElement(symbols),
        instrumentType: randomElement(instruments),
        instrument_type: randomElement(instruments),
        quantity: randomInt(10, 1000),
        price: randomFloat(10, 500),
        amount: randomFloat(1000, 100000),
        date: date,
        transactionDate: date,
        status: randomElement(['executed', 'pending', 'cancelled', 'settled']),
        side: randomElement(['buy', 'sell']),
        broker: `Broker ${randomInt(1, 5)}`,
        environment: 'dev'
      });
    }
    await db.collection('trades').insertMany(trades);
    console.log(`   ✅ Inserted ${trades.length} trades`);
    
    // 5. REGULATORY FILINGS
    console.log('📋 Inserting regulatory filings...');
    const regulations = ['SOX', 'GDPR', 'PCI DSS', 'HIPAA', 'ISO 27001', 'Basel III'];
    const filingStatuses = ['completed', 'approved', 'pending', 'in_progress', 'rejected', 'under_review'];
    
    const regulatoryFilings = [];
    for (let i = 0; i < 80; i++) {
      const date = randomDate(oneYearAgo, now);
      const regulation = randomElement(regulations);
      regulatoryFilings.push({
        regulation: regulation,
        regulation_type: regulation,
        type: regulation,
        status: randomElement(filingStatuses),
        compliance_status: randomElement(['compliant', 'non-compliant', 'pending']),
        filingDate: date,
        last_audit_date: randomDate(date, now),
        updated_at: randomDate(date, now),
        created_at: date,
        environment: 'dev',
        description: `${regulation} compliance filing ${i + 1}`,
        complianceRate: randomInt(70, 100),
        compliance_percentage: randomInt(70, 100)
      });
    }
    await db.collection('regulatory_filings').insertMany(regulatoryFilings);
    console.log(`   ✅ Inserted ${regulatoryFilings.length} regulatory filings`);
    
    // 6. KYC FILES
    console.log('🔐 Inserting KYC files...');
    const kycStatuses2 = ['verified', 'approved', 'pending', 'under_review', 'rejected', 'failed'];
    
    const kycFiles = [];
    for (let i = 0; i < 60; i++) {
      const date = randomDate(oneYearAgo, now);
      kycFiles.push({
        customerId: `CUST${String(1000 + i).padStart(6, '0')}`,
        customer_id: `CUST${String(1000 + i).padStart(6, '0')}`,
        status: randomElement(kycStatuses2),
        verificationDate: date,
        expiryDate: new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000),
        documentType: randomElement(['Passport', 'Driver License', 'National ID', 'Business License']),
        environment: 'dev',
        verifiedBy: `officer${randomInt(1, 5)}`,
        riskLevel: randomElement(['low', 'medium', 'high'])
      });
    }
    await db.collection('kyc_files').insertMany(kycFiles);
    console.log(`   ✅ Inserted ${kycFiles.length} KYC files`);
    
    // 7. AUDIT REPORTS
    console.log('📑 Inserting audit reports...');
    const auditStatuses = ['completed', 'in_progress', 'pending', 'draft', 'reviewed'];
    const auditTypes = ['Financial Audit', 'Compliance Audit', 'IT Audit', 'Operational Audit', 'Risk Audit'];
    
    const auditReports = [];
    for (let i = 0; i < 40; i++) {
      const date = randomDate(oneYearAgo, now);
      const findingsCount = randomInt(0, 15);
      const criticalFindings = randomInt(0, Math.min(5, findingsCount));
      auditReports.push({
        auditType: randomElement(auditTypes),
        type: randomElement(auditTypes),
        status: randomElement(auditStatuses),
        auditDate: date,
        completedDate: randomElement(auditStatuses) === 'completed' ? randomDate(date, now) : null,
        findings_count: findingsCount,
        critical_findings: criticalFindings,
        resolved_findings: randomInt(0, findingsCount),
        auditor: `Auditor ${randomInt(1, 10)}`,
        department: randomElement(['Finance', 'IT', 'Operations', 'Compliance', 'Risk']),
        environment: 'dev',
        score: randomInt(60, 100),
        recommendations: randomInt(0, 10)
      });
    }
    await db.collection('audit_reports').insertMany(auditReports);
    console.log(`   ✅ Inserted ${auditReports.length} audit reports`);
    
    // 8. EXCEPTION LOGS
    console.log('⚠️  Inserting exception logs...');
    const severities = ['critical', 'high', 'medium', 'low'];
    const priorities = ['critical', 'high', 'medium', 'low'];
    const exceptionTypes = ['Database Error', 'API Timeout', 'Validation Error', 'Authentication Failed', 'Authorization Error', 'Data Mismatch'];
    
    const exceptionLogs = [];
    for (let i = 0; i < 120; i++) {
      const date = randomDate(oneWeekAgo, now);
      exceptionLogs.push({
        severity: randomElement(severities),
        priority: randomElement(priorities),
        type: randomElement(exceptionTypes),
        message: `Exception ${i + 1}: ${randomElement(['Connection timeout', 'Invalid input', 'Access denied', 'Data not found', 'Processing error'])}`,
        timestamp: date,
        resolved: Math.random() > 0.3,
        component: randomElement(['API', 'Database', 'Frontend', 'Backend', 'Service']),
        environment: 'dev',
        userId: `user${randomInt(1, 20)}`,
        user_id: `user${randomInt(1, 20)}`
      });
    }
    await db.collection('exception_logs').insertMany(exceptionLogs);
    console.log(`   ✅ Inserted ${exceptionLogs.length} exception logs`);
    
    // 9. LOGIN RECORDS
    console.log('🔑 Inserting login records...');
    const loginStatuses = ['success', 'failed', 'blocked', 'timeout'];
    const userRoles = ['admin', 'auditor', 'analyst', 'viewer', 'manager'];
    
    const loginRecords = [];
    for (let i = 0; i < 300; i++) {
      const date = randomDate(oneWeekAgo, now);
      loginRecords.push({
        userId: `user${randomInt(1, 30)}`,
        user_id: `user${randomInt(1, 30)}`,
        username: `user${randomInt(1, 30)}`,
        status: randomElement(loginStatuses),
        timestamp: date,
        login_time: date,
        ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        ip_address: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
        userAgent: `Mozilla/5.0 (Browser ${randomInt(1, 5)})`,
        role: randomElement(userRoles),
        environment: 'dev',
        location: randomElement(['New York', 'London', 'Tokyo', 'Singapore', 'Frankfurt'])
      });
    }
    await db.collection('login_records').insertMany(loginRecords);
    console.log(`   ✅ Inserted ${loginRecords.length} login records`);
    
    // 10. PROCESS MINING TRACES
    console.log('🔄 Inserting process mining traces...');
    const processNames = [
      'Customer Onboarding', 'Transaction Processing', 'Compliance Review',
      'Risk Assessment', 'Audit Execution', 'Report Generation', 'Data Validation',
      'Payment Processing', 'KYC Verification', 'Account Reconciliation'
    ];
    const processStatuses = ['completed', 'in_progress', 'pending', 'failed', 'cancelled'];
    
    const processTraces = [];
    for (let i = 0; i < 100; i++) {
      const startTime = randomDate(oneMonthAgo, now);
      const duration = randomInt(1000, 3600000); // 1 second to 1 hour
      const endTime = new Date(startTime.getTime() + duration);
      processTraces.push({
        processName: randomElement(processNames),
        process_name: randomElement(processNames),
        status: randomElement(processStatuses),
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        userId: `user${randomInt(1, 20)}`,
        user_id: `user${randomInt(1, 20)}`,
        environment: 'dev',
        step: randomInt(1, 16),
        kpi: randomInt(80, 100),
        completionRate: randomInt(70, 100)
      });
    }
    await db.collection('process_mining_traces').insertMany(processTraces);
    console.log(`   ✅ Inserted ${processTraces.length} process mining traces`);
    
    // Create indexes for better performance
    console.log('📇 Creating indexes...');
    try {
      await db.collection('customers').createIndex({ email: 1 });
      await db.collection('customers').createIndex({ status: 1 });
      await db.collection('journal_entries').createIndex({ date: -1 });
      await db.collection('journal_entries').createIndex({ transactionDate: -1 });
      await db.collection('payments').createIndex({ date: -1 });
      await db.collection('trades').createIndex({ date: -1 });
      await db.collection('regulatory_filings').createIndex({ regulation: 1 });
      await db.collection('regulatory_filings').createIndex({ status: 1 });
      await db.collection('audit_reports').createIndex({ auditDate: -1 });
      await db.collection('exception_logs').createIndex({ timestamp: -1 });
      await db.collection('exception_logs').createIndex({ severity: 1 });
      await db.collection('login_records').createIndex({ timestamp: -1 });
      await db.collection('login_records').createIndex({ userId: 1 });
      await db.collection('process_mining_traces').createIndex({ start_time: -1 });
      console.log('   ✅ Indexes created');
    } catch (error) {
      console.log('   ⚠️  Some indexes may already exist');
    }
    
    // Summary
    console.log('\n📊 Data Insertion Summary:');
    console.log('==========================');
    const summary = await Promise.all(collections.map(async (col) => {
      const count = await db.collection(col).countDocuments();
      return { collection: col, count };
    }));
    
    summary.forEach(({ collection, count }) => {
      console.log(`   ${collection.padEnd(25)} ${count} documents`);
    });
    
    console.log('\n✅ Dummy data insertion completed successfully!');
    console.log('🎉 Your frontend application should now feel live with realistic data!');
    
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
if (require.main === module) {
  insertDummyData()
    .then(() => {
      console.log('\n✨ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { insertDummyData };

