// MongoDB Index Creation Script for Audit POC
// This script creates additional indexes for better query performance

print('🔍 Creating performance indexes for Audit POC...');

// Function to create indexes for a specific environment
function createIndexesForEnvironment(environment) {
  print(`📊 Creating indexes for ${environment.toUpperCase()} environment...`);
  
  // Switch to the environment database
  db = db.getSiblingDB(`audit_poc_${environment}`);
  
  // Create compound indexes for common query patterns
  
  // Journal Entries indexes
  db.journal_entries.createIndex({ "date": -1, "status": 1 });
  db.journal_entries.createIndex({ "created_by": 1, "date": -1 });
  db.journal_entries.createIndex({ "debit_account": 1, "credit_account": 1 });
  db.journal_entries.createIndex({ "amount": 1 });
  db.journal_entries.createIndex({ "currency": 1, "date": -1 });
  
  // Payments indexes
  db.payments.createIndex({ "date": -1, "payment_type": 1 });
  db.payments.createIndex({ "vendor_id": 1, "customer_id": 1 });
  db.payments.createIndex({ "status": 1, "payment_status": 1 });
  db.payments.createIndex({ "amount": 1 });
  db.payments.createIndex({ "payment_method": 1, "date": -1 });
  
  // Trades indexes
  db.trades.createIndex({ "date": -1, "instrument_type": 1 });
  db.trades.createIndex({ "symbol": 1, "date": -1 });
  db.trades.createIndex({ "trader_id": 1, "date": -1 });
  db.trades.createIndex({ "broker": 1, "status": 1 });
  db.trades.createIndex({ "total_amount": 1 });
  
  // Customer indexes
  db.customers.createIndex({ "customer_name": 1 });
  db.customers.createIndex({ "customer_type": 1, "industry": 1 });
  db.customers.createIndex({ "tax_id": 1 });
  db.customers.createIndex({ "status": 1, "created_date": -1 });
  db.customers.createIndex({ "contact_person": 1 });
  
  // Vendor indexes
  db.vendors.createIndex({ "vendor_name": 1 });
  db.vendors.createIndex({ "vendor_type": 1, "category": 1 });
  db.vendors.createIndex({ "tax_id": 1 });
  db.vendors.createIndex({ "status": 1, "contract_start_date": -1 });
  db.vendors.createIndex({ "credit_rating": 1 });
  
  // Account indexes
  db.accounts.createIndex({ "account_name": 1 });
  db.accounts.createIndex({ "account_type": 1, "account_category": 1 });
  db.accounts.createIndex({ "parent_account": 1 });
  db.accounts.createIndex({ "is_active": 1, "account_level": 1 });
  
  // Invoice indexes
  db.invoices.createIndex({ "invoice_number": 1 });
  db.invoices.createIndex({ "date": -1, "due_date": 1 });
  db.invoices.createIndex({ "customer_id": 1, "vendor_id": 1 });
  db.invoices.createIndex({ "status": 1, "payment_status": 1 });
  db.invoices.createIndex({ "amount": 1, "total_amount": 1 });
  
  // Contract indexes
  db.contracts.createIndex({ "contract_number": 1 });
  db.contracts.createIndex({ "contract_type": 1, "start_date": -1 });
  db.contracts.createIndex({ "parties": 1 });
  db.contracts.createIndex({ "status": 1, "total_value": 1 });
  db.contracts.createIndex({ "end_date": 1, "status": 1 });
  
  // Tax Form indexes
  db.tax_forms.createIndex({ "form_type": 1, "tax_year": 1 });
  db.tax_forms.createIndex({ "form_number": 1 });
  db.tax_forms.createIndex({ "entity_type": 1, "payer_name": 1 });
  db.tax_forms.createIndex({ "tax_id": 1, "payer_tin": 1 });
  db.tax_forms.createIndex({ "status": 1, "submitted_date": -1 });
  
  // Login Records indexes
  db.login_records.createIndex({ "timestamp": -1, "user_id": 1 });
  db.login_records.createIndex({ "ip_address": 1, "timestamp": -1 });
  db.login_records.createIndex({ "status": 1, "timestamp": -1 });
  db.login_records.createIndex({ "login_method": 1, "timestamp": -1 });
  db.login_records.createIndex({ "session_id": 1 });
  
  // Change History indexes
  db.change_history.createIndex({ "timestamp": -1, "user_id": 1 });
  db.change_history.createIndex({ "table_name": 1, "record_id": 1 });
  db.change_history.createIndex({ "change_type": 1, "timestamp": -1 });
  db.change_history.createIndex({ "field_name": 1, "timestamp": -1 });
  
  // Approval Chains indexes
  db.approval_chains.createIndex({ "request_id": 1 });
  db.approval_chains.createIndex({ "request_type": 1, "request_date": -1 });
  db.approval_chains.createIndex({ "requestor_id": 1, "request_date": -1 });
  db.approval_chains.createIndex({ "current_status": 1, "request_date": -1 });
  db.approval_chains.createIndex({ "request_amount": 1 });
  
  // Change Tracking indexes
  db.change_tracking.createIndex({ "change_timestamp": -1, "entity_type": 1 });
  db.change_tracking.createIndex({ "entity_id": 1, "change_timestamp": -1 });
  db.change_tracking.createIndex({ "changed_by": 1, "change_timestamp": -1 });
  db.change_tracking.createIndex({ "change_type": 1, "change_timestamp": -1 });
  
  // KYC Files indexes
  db.kyc_files.createIndex({ "customer_id": 1 });
  db.kyc_files.createIndex({ "kyc_type": 1, "verification_status": 1 });
  db.kyc_files.createIndex({ "risk_level": 1, "kyc_review_date": -1 });
  db.kyc_files.createIndex({ "next_review_date": 1 });
  
  // Regulatory Filings indexes
  db.regulatory_filings.createIndex({ "filing_type": 1, "filing_date": -1 });
  db.regulatory_filings.createIndex({ "filing_number": 1 });
  db.regulatory_filings.createIndex({ "regulatory_body": 1, "filing_period": 1 });
  db.regulatory_filings.createIndex({ "filing_status": 1, "due_date": 1 });
  
  // Exception Logs indexes
  db.exception_logs.createIndex({ "timestamp": -1, "severity": 1 });
  db.exception_logs.createIndex({ "exception_type": 1, "timestamp": -1 });
  db.exception_logs.createIndex({ "component": 1, "module": 1 });
  db.exception_logs.createIndex({ "resolved": 1, "timestamp": -1 });
  db.exception_logs.createIndex({ "assigned_to": 1, "priority": 1 });
  
  // Process Mining Traces indexes
  db.process_mining_traces.createIndex({ "start_time": -1, "process_name": 1 });
  db.process_mining_traces.createIndex({ "case_id": 1, "start_time": -1 });
  db.process_mining_traces.createIndex({ "status": 1, "duration_minutes": 1 });
  db.process_mining_traces.createIndex({ "user_id": 1, "start_time": -1 });
  
  // Financial Reports indexes
  db.balance_sheet.createIndex({ "report_date": -1, "company_name": 1 });
  db.balance_sheet.createIndex({ "fiscal_period": 1, "currency": 1 });
  db.balance_sheet.createIndex({ "prepared_by": 1, "approved_by": 1 });
  
  db.pl_statement.createIndex({ "report_date": -1, "company_name": 1 });
  db.pl_statement.createIndex({ "fiscal_period": 1, "currency": 1 });
  db.pl_statement.createIndex({ "net_revenue": 1, "net_income": 1 });
  
  db.cash_flow.createIndex({ "report_date": -1, "company_name": 1 });
  db.cash_flow.createIndex({ "fiscal_period": 1, "currency": 1 });
  db.cash_flow.createIndex({ "net_change_in_cash": 1 });
  
  // External Data indexes
  db.audit_reports.createIndex({ "audit_date": -1, "audit_type": 1 });
  db.audit_reports.createIndex({ "auditor_firm": 1, "audit_period": 1 });
  db.audit_reports.createIndex({ "audit_opinion": 1, "report_date": -1 });
  db.audit_reports.createIndex({ "company_name": 1, "audit_date": -1 });
  
  db.bank_confirms.createIndex({ "confirmation_date": -1, "bank_name": 1 });
  db.bank_confirms.createIndex({ "account_number": 1, "customer_name": 1 });
  db.bank_confirms.createIndex({ "confirmation_type": 1, "status": 1 });
  
  // Communications indexes
  db.emails.createIndex({ "sent_date": -1, "from_address": 1 });
  db.emails.createIndex({ "to_addresses": 1, "sent_date": -1 });
  db.emails.createIndex({ "email_type": 1, "priority": 1 });
  db.emails.createIndex({ "subject": 1, "sent_date": -1 });
  db.emails.createIndex({ "thread_id": 1, "sent_date": -1 });
  
  db.meeting_notes.createIndex({ "meeting_date": -1, "meeting_type": 1 });
  db.meeting_notes.createIndex({ "attendees": 1, "meeting_date": -1 });
  db.meeting_notes.createIndex({ "key_decisions": 1, "action_items": 1 });
  
  // Metadata indexes
  db.data_metadata.createIndex({ "metadata_version": 1 });
  db.data_metadata.createIndex({ "last_updated": -1 });
  db.data_metadata.createIndex({ "data_source": 1 });
  
  // Environment config indexes
  db.environment_config.createIndex({ "environment": 1 });
  db.environment_config.createIndex({ "config_version": 1 });
  
  print(`  ✅ Indexes created for ${environment.toUpperCase()} environment`);
}

// Create indexes for all environments
const environments = ['dev', 'qe', 'stg', 'production'];

environments.forEach(env => {
  createIndexesForEnvironment(env);
});

print('✅ All performance indexes created successfully!');
print('🚀 MongoDB is now optimized for high-performance queries');
print('📊 You can now run complex aggregations and queries efficiently');
