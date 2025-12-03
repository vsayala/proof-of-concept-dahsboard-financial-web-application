#!/bin/bash

# MongoDB Data Import Script using mongoimport
# This script imports all JSON data from the copied data folder

echo "📥 Starting MongoDB data import using mongoimport..."

# Function to import data for a specific environment
import_data_for_environment() {
    local environment=$1
    echo "🔄 Importing data for ${environment} environment..."
    
    # Base URI for MongoDB connection
    local uri="mongodb://admin:admin123@localhost:27017/audit_poc_${environment}?authSource=admin"
    
    # Import journal entries
    echo "  📝 Importing journal entries..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection journal_entries --file /tmp/data/transactional/journal_entries/sample_journal_entries.json --jsonArray
    
    # Import payments
    echo "  💰 Importing payments..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection payments --file /tmp/data/transactional/payments/sample_payments.json --jsonArray
    
    # Import trades
    echo "  📈 Importing trades..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection trades --file /tmp/data/transactional/trades/sample_trades.json --jsonArray
    
    # Import customers
    echo "  👥 Importing customers..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection customers --file /tmp/data/master_data/customer/customer_master.json --jsonArray
    
    # Import vendors
    echo "  🏢 Importing vendors..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection vendors --file /tmp/data/master_data/vendor/vendor_master.json --jsonArray
    
    # Import accounts
    echo "  🏦 Importing accounts..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection accounts --file /tmp/data/master_data/account_master/account_master.json --jsonArray
    
    # Import invoices
    echo "  📄 Importing invoices..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection invoices --file /tmp/data/supporting_docs/invoices/sample_invoices.json --jsonArray
    
    # Import contracts
    echo "  📋 Importing contracts..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection contracts --file /tmp/data/supporting_docs/contracts/sample_contracts.json --jsonArray
    
    # Import tax forms
    echo "  📊 Importing tax forms..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection tax_forms --file /tmp/data/supporting_docs/tax_forms/sample_tax_forms.json --jsonArray
    
    # Import login records
    echo "  🔐 Importing login records..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection login_records --file /tmp/data/system_access_logs/login_records/sample_login_records.json --jsonArray
    
    # Import change history
    echo "  📝 Importing change history..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection change_history --file /tmp/data/system_access_logs/change_history/sample_change_history.json --jsonArray
    
    # Import approval chains
    echo "  ✅ Importing approval chains..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection approval_chains --file /tmp/data/audit_trail/approval_chains/sample_approval_chains.json --jsonArray
    
    # Import change tracking
    echo "  🔍 Importing change tracking..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection change_tracking --file /tmp/data/audit_trail/change_tracking/sample_change_tracking.json --jsonArray
    
    # Import KYC files
    echo "  🆔 Importing KYC files..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection kyc_files --file /tmp/data/compliance/kyc_files/sample_kyc_files.json --jsonArray
    
    # Import regulatory filings
    echo "  📋 Importing regulatory filings..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection regulatory_filings --file /tmp/data/compliance/regulatory_filings/sample_regulatory_filings.json --jsonArray
    
    # Import exception logs
    echo "  ⚠️  Importing exception logs..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection exception_logs --file /tmp/data/operational/exception_logs/sample_exception_logs.json --jsonArray
    
    # Import process mining traces
    echo "  🔄 Importing process mining traces..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection process_mining_traces --file /tmp/data/operational/process_mining_traces/sample_process_mining_traces.json --jsonArray
    
    # Import balance sheet
    echo "  📊 Importing balance sheet..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection balance_sheet --file /tmp/data/financial_reports/balance_sheet/sample_balance_sheet.json --jsonArray
    
    # Import P&L statements
    echo "  📈 Importing P&L statements..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection pl_statement --file /tmp/data/financial_reports/pl_statement/sample_pl_statement.json --jsonArray
    
    # Import cash flow
    echo "  💵 Importing cash flow..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection cash_flow --file /tmp/data/financial_reports/cash_flow/sample_cash_flow.json --jsonArray
    
    # Import audit reports
    echo "  🔍 Importing audit reports..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection audit_reports --file /tmp/data/external_data/audit_reports/sample_audit_reports.json --jsonArray
    
    # Import bank confirmations
    echo "  🏦 Importing bank confirmations..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection bank_confirms --file /tmp/data/external_data/bank_confirms/sample_bank_confirms.json --jsonArray
    
    # Import emails
    echo "  📧 Importing emails..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection emails --file /tmp/data/communications/emails/sample_emails.json --jsonArray
    
    # Import meeting notes
    echo "  📝 Importing meeting notes..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection meeting_notes --file /tmp/data/communications/meeting_notes/sample_meeting_notes.json --jsonArray
    
    # Import metadata
    echo "  📋 Importing metadata..."
    docker exec audit-poc-mongodb mongoimport --uri "$uri" --collection data_metadata --file /tmp/data/metadata/data_metadata.json --jsonArray
    
    echo "  🎯 Data import completed for ${environment} environment"
}

# Import data for all environments
environments=("dev" "qe" "stg" "production")

for env in "${environments[@]}"; do
    import_data_for_environment "$env"
done

echo "✅ All data import operations completed successfully!"
echo "📊 Data is now available in MongoDB collections"
echo "🌐 Access MongoDB Express at http://localhost:8081"
echo "🔑 Login with admin/admin123"
