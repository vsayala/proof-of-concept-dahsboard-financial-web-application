// Quick MongoDB Test Script
const { MongoClient } = require('mongodb');

async function quickTest() {
    const uri = 'mongodb://admin:admin123@localhost:27017/audit_poc_dev?authSource=admin';
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('audit_poc_dev');
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections`);
        
        // Test key collections
        const journalCount = await db.collection('journal_entries').countDocuments();
        console.log(`📝 Journal entries: ${journalCount}`);
        
        const customerCount = await db.collection('customers').countDocuments();
        console.log(`👥 Customers: ${customerCount}`);
        
        const paymentCount = await db.collection('payments').countDocuments();
        console.log(`💰 Payments: ${paymentCount}`);
        
        // Test a sample document
        const sampleEntry = await db.collection('journal_entries').findOne({});
        if (sampleEntry) {
            console.log(`📊 Sample entry: ${JSON.stringify(sampleEntry, null, 2)}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

quickTest();
