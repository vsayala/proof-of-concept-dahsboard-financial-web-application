#!/bin/bash

echo "🚀 Importing data into all environments..."

environments=("dev" "qe" "stg" "production")

for env in "${environments[@]}"; do
    echo "📊 Importing data for $env environment..."
    
    # Import each JSON file
    docker exec mongodb mongoimport --db audit_poc_${env} --collection journal_entries --file /tmp/data/transactional/journal_entries/sample_journal_entries.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection payments --file /tmp/data/transactional/payments/sample_payments.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection trades --file /tmp/data/transactional/trades/sample_trades.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection customer --file /tmp/data/master_data/customer/customer_master.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection vendor --file /tmp/data/master_data/vendor/vendor_master.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection account_master --file /tmp/data/master_data/account_master/account_master.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection invoices --file /tmp/data/supporting_docs/invoices/sample_invoices.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection contracts --file /tmp/data/supporting_docs/contracts/sample_contracts.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection tax_forms --file /tmp/data/supporting_docs/tax_forms/sample_tax_forms.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection login_records --file /tmp/data/system_access_logs/login_records/sample_login_records.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection change_history --file /tmp/data/system_access_logs/change_history/sample_change_history.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection approval_chains --file /tmp/data/audit_trail/approval_chains/sample_approval_chains.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection change_tracking --file /tmp/data/audit_trail/change_tracking/sample_change_tracking.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection kyc_files --file /tmp/data/compliance/kyc_files/sample_kyc_files.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection regulatory_filings --file /tmp/data/compliance/regulatory_filings/sample_regulatory_filings.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection exception_logs --file /tmp/data/operational/exception_logs/sample_exception_logs.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection process_mining_traces --file /tmp/data/operational/process_mining_traces/sample_process_mining_traces.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection balance_sheet --file /tmp/data/financial_reports/balance_sheet/sample_balance_sheet.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection pl_statement --file /tmp/data/financial_reports/pl_statement/sample_pl_statement.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection cash_flow --file /tmp/data/financial_reports/cash_flow/sample_cash_flow.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection audit_reports --file /tmp/data/external_data/audit_reports/sample_audit_reports.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection bank_confirms --file /tmp/data/external_data/bank_confirms/sample_bank_confirms.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection emails --file /tmp/data/communications/emails/sample_emails.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    docker exec mongodb mongoimport --db audit_poc_${env} --collection meeting_notes --file /tmp/data/communications/meeting_notes/sample_meeting_notes.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    docker exec mongodb mongoimport --db audit_poc_${env} --collection data_metadata --file /tmp/data/metadata/data_metadata.json --jsonArray --authenticationDatabase admin --username admin --password admin123 --quiet
    
    echo "✅ Data import completed for $env environment!"
done

echo "🎉 All environments data import completed!"
