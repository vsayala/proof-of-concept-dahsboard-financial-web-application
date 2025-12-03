#!/usr/bin/env node

// MongoDB Connection Test Script for Audit POC
// This script tests the MongoDB connection and displays basic information

const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
    console.log('🔍 Testing MongoDB Connection for Audit POC...\n');
    
    const uri = 'mongodb://admin:admin123@localhost:27017/?authSource=admin';
    const client = new MongoClient(uri);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Successfully connected to MongoDB\n');
        
        // List all databases
        const adminDb = client.db('admin');
        const databases = await adminDb.admin().listDatabases();
        
        console.log('📊 Available Databases:');
        console.log('========================');
        
        const auditDatabases = databases.databases.filter(db => db.name.startsWith('audit_poc_'));
        auditDatabases.forEach(db => {
            console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        if (auditDatabases.length === 0) {
            console.log('  ⚠️  No audit_poc databases found. Run setup.sh first.');
            return;
        }
        
        // Test development environment
        console.log('\n🔬 Testing Development Environment...');
        const devDb = client.db('audit_poc_dev');
        
        // Get collection count
        const collections = await devDb.listCollections().toArray();
        console.log(`  📁 Collections found: ${collections.length}`);
        
        // Test some key collections
        const keyCollections = [
            'journal_entries',
            'customers', 
            'payments',
            'users',
            'roles'
        ];
        
        for (const collectionName of keyCollections) {
            try {
                const count = await devDb.collection(collectionName).countDocuments();
                console.log(`  📝 ${collectionName}: ${count} documents`);
            } catch (error) {
                console.log(`  ❌ ${collectionName}: Error - ${error.message}`);
            }
        }
        
        // Test a sample query
        console.log('\n🔍 Sample Query Test...');
        try {
            const sampleEntry = await devDb.collection('journal_entries')
                .findOne({}, { sort: { date: -1 } });
            
            if (sampleEntry) {
                console.log('  ✅ Sample journal entry found:');
                console.log(`     Date: ${sampleEntry.date || sampleEntry.created_at}`);
                console.log(`     Amount: ${sampleEntry.amount || 'N/A'}`);
                console.log(`     Status: ${sampleEntry.status || 'N/A'}`);
            } else {
                console.log('  ⚠️  No journal entries found');
            }
        } catch (error) {
            console.log(`  ❌ Query test failed: ${error.message}`);
        }
        
        // Test user authentication
        console.log('\n👥 User Authentication Test...');
        try {
            const users = await devDb.collection('users').find({}).toArray();
            console.log(`  ✅ Found ${users.length} users:`);
            users.forEach(user => {
                console.log(`     - ${user.username} (${user.role})`);
            });
        } catch (error) {
            console.log(`  ❌ User test failed: ${error.message}`);
        }
        
        // Test role-based access
        console.log('\n🔐 Role-Based Access Test...');
        try {
            const roles = await devDb.collection('roles').find({}).toArray();
            console.log(`  ✅ Found ${roles.length} roles:`);
            roles.forEach(role => {
                console.log(`     - ${role.role_name}: ${role.description}`);
            });
        } catch (error) {
            console.log(`  ❌ Role test failed: ${error.message}`);
        }
        
        console.log('\n🎉 MongoDB Connection Test Completed Successfully!');
        console.log('\n📋 Connection Summary:');
        console.log('======================');
        console.log(`  🌐 Host: localhost:27017`);
        console.log(`  🔑 Username: admin`);
        console.log(`  🗄️  Databases: ${auditDatabases.length}`);
        console.log(`  📁 Collections: ${collections.length}`);
        console.log(`  👥 Users: ${users?.length || 0}`);
        console.log(`  🔐 Roles: ${roles?.length || 0}`);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Test Failed:');
        console.error(`   Error: ${error.message}`);
        console.error('\n🔧 Troubleshooting Tips:');
        console.error('   1. Ensure MongoDB is running: docker-compose ps');
        console.error('   2. Check if setup.sh was run successfully');
        console.error('   3. Verify ports are not in use: lsof -i :27017');
        console.error('   4. Check Docker logs: docker-compose logs mongodb');
    } finally {
        await client.close();
        console.log('\n🔌 Connection closed');
    }
}

// Run the test
testMongoDBConnection();
