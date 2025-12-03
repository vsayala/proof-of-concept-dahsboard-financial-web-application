// MongoDB User and Role Creation Script for Audit POC
// This script creates users and roles for different environments

print('👥 Creating users and roles for Audit POC...');

// Function to create users and roles for a specific environment
function createUsersForEnvironment(environment) {
  print(`👤 Setting up users for ${environment.toUpperCase()} environment...`);
  
  // Switch to the environment database
  db = db.getSiblingDB(`audit_poc_${environment}`);
  
  // Create roles collection
  if (!db.getCollectionNames().includes('roles')) {
    db.createCollection('roles');
  }
  
  if (!db.getCollectionNames().includes('users')) {
    db.createCollection('users');
  }
  
  // Define roles based on environment
  const roles = [
    {
      role_name: 'auditor',
      permissions: [
        'read:all',
        'write:audit_trail',
        'write:change_tracking',
        'read:compliance',
        'read:financial_reports'
      ],
      description: 'Auditor role with read access to all data and write access to audit trails'
    },
    {
      role_name: 'analyst',
      permissions: [
        'read:transactional',
        'read:master_data',
        'read:financial_reports',
        'read:operational',
        'write:exception_logs'
      ],
      description: 'Data analyst role with access to transactional and operational data'
    },
    {
      role_name: 'compliance_officer',
      permissions: [
        'read:all',
        'write:compliance',
        'write:regulatory_filings',
        'read:audit_trail',
        'write:kyc_files'
      ],
      description: 'Compliance officer with access to compliance and regulatory data'
    },
    {
      role_name: 'finance_user',
      permissions: [
        'read:transactional',
        'read:master_data',
        'write:financial_reports',
        'read:audit_trail',
        'read:compliance'
      ],
      description: 'Finance user with access to financial data and reports'
    },
    {
      role_name: 'admin',
      permissions: [
        'read:all',
        'write:all',
        'delete:all',
        'manage:users',
        'manage:roles',
        'manage:system'
      ],
      description: 'System administrator with full access'
    }
  ];
  
  // Insert roles
  roles.forEach(role => {
    const existingRole = db.roles.findOne({ role_name: role.role_name });
    if (!existingRole) {
      role.environment = environment;
      role.created_at = new Date();
      role.updated_at = new Date();
      db.roles.insertOne(role);
      print(`  ✅ Created role: ${role.role_name}`);
    } else {
      print(`  ℹ️  Role already exists: ${role.role_name}`);
    }
  });
  
  // Define users based on environment
  const users = [
    {
      username: 'admin',
      email: `admin@${environment}.financialdashboard.com`,
      full_name: 'System Administrator',
      role: 'admin',
      is_active: true,
      last_login: null,
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHh6G', // admin123
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'auditor1',
      email: `auditor1@${environment}.financialdashboard.com`,
      full_name: 'John Auditor',
      role: 'auditor',
      is_active: true,
      last_login: null,
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHh6G', // auditor123
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'analyst1',
      email: `analyst1@${environment}.financialdashboard.com`,
      full_name: 'Sarah Analyst',
      role: 'analyst',
      is_active: true,
      last_login: null,
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHh6G', // analyst123
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'compliance1',
      email: `compliance1@${environment}.financialdashboard.com`,
      full_name: 'Mike Compliance',
      role: 'compliance_officer',
      is_active: true,
      last_login: null,
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHh6G', // compliance123
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'finance1',
      email: `finance1@${environment}.financialdashboard.com`,
      full_name: 'Lisa Finance',
      role: 'finance_user',
      is_active: true,
      last_login: null,
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vHhHh6G', // finance123
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  // Insert users
  users.forEach(user => {
    const existingUser = db.users.findOne({ username: user.username });
    if (!existingUser) {
      user.environment = environment;
      user.created_at = new Date();
      user.updated_at = new Date();
      db.users.insertOne(user);
      print(`  ✅ Created user: ${user.username} (${user.full_name})`);
    } else {
      print(`  ℹ️  User already exists: ${user.username}`);
    }
  });
  
  // Create indexes for users and roles
  db.users.createIndex({ "username": 1 }, { unique: true });
  db.users.createIndex({ "email": 1 }, { unique: true });
  db.users.createIndex({ "role": 1, "is_active": 1 });
  db.users.createIndex({ "last_login": -1 });
  
  db.roles.createIndex({ "role_name": 1 }, { unique: true });
  db.roles.createIndex({ "environment": 1 });
  
  print(`  🎯 User setup completed for ${environment.toUpperCase()} environment`);
}

// Create users for all environments
const environments = ['dev', 'qe', 'stg', 'production'];

environments.forEach(env => {
  createUsersForEnvironment(env);
});

print('✅ All users and roles created successfully!');
print('🔐 Default passwords for all users: username123 (e.g., admin123, auditor123)');
print('📝 Users can now authenticate and access data based on their roles');
