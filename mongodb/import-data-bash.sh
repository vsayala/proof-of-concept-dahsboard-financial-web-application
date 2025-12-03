#!/bin/bash

# Import data using mongoimport command
# This script imports all JSON files into MongoDB collections

echo "🚀 Starting data import using mongoimport..."

# Define the data structure mapping
declare -A dataStructure
dataStructure[transactional_journal_entries]="sample_journal_entries.json"
dataStructure[transactional_payments]="sample_payments.json"
dataStructure[transactional_trades]="sample_trades.json"
dataStructure[master_data_customer]="customer_master.json"
dataStructure[master_data_vendor]="vendor_master.json"
dataStructure[master_data_account_master]="account_master.json"
dataStructure[supporting_docs_invoices]="sample_invoices.json"
dataStructure[supporting_docs_contracts]="sample_contracts.json"
dataStructure[supporting_docs_tax_forms]="sample_tax_forms.json"
dataStructure[system_access_logs_login_records]="sample_login_records.json"
dataStructure[system_access_logs_change_history]="sample_change_history.json"
dataStructure[audit_trail_approval_chains]="sample_approval_chains.json"
dataStructure[audit_trail_change_tracking]="sample_change_tracking.json"
dataStructure[compliance_kyc_files]="sample_kyc_files.json"
dataStructure[compliance_regulatory_filings]="sample_regulatory_filings.json"
dataStructure[operational_exception_logs]="sample_exception_logs.json"
dataStructure[operational_process_mining_traces]="sample_process_mining_traces.json"
dataStructure[financial_reports_balance_sheet]="sample_balance_sheet.json"
dataStructure[financial_reports_pl_statement]="sample_pl_statement.json"
dataStructure[financial_reports_cash_flow]="sample_cash_flow.json"
dataStructure[external_data_audit_reports]="sample_audit_reports.json"
dataStructure[external_data_bank_confirms]="sample_bank_confirms.json"
dataStructure[communications_emails]="sample_emails.json"
dataStructure[communications_meeting_notes]="sample_meeting_notes.json"
dataStructure[metadata_data_metadata]="data_metadata.json"

# Environments to import data into
environments=("dev" "qe" "stg" "production")

# Function to import data for a specific environment
import_data_for_environment() {
    local environment=$1
    echo "📊 Importing data for environment: $environment"
    
    local db_name="audit_poc_$environment"
    local total_imported=0
    
    # Import data for each category
    for key in "${!dataStructure[@]}"; do
        IFS='_' read -ra ADDR <<< "$key"
        local category="${ADDR[0]}"
        local collection="${ADDR[1]}"
        local json_file="${dataStructure[$key]}"
        local file_path="/tmp/data/$category/$collection/$json_file"
        
        echo "  📁 Importing $collection from $json_file..."
        
        # Check if file exists
        if docker exec mongodb test -f "$file_path"; then
            # Import using mongoimport
            if docker exec mongodb mongoimport \
                --db "$db_name" \
                --collection "$collection" \
                --file "$file_path" \
                --jsonArray \
                --authenticationDatabase admin \
                --username admin \
                --password admin123 \
                --quiet; then
                echo "    ✅ Imported $collection successfully"
                total_imported=$((total_imported + 1))
            else
                echo "    ❌ Failed to import $collection"
            fi
        else
            echo "    ⚠️  File not found: $file_path"
        fi
    done
    
    echo "✅ Environment $environment: $total_imported collections imported"
    return $total_imported
}

# Import data for all environments
grand_total=0
for environment in "${environments[@]}"; do
    import_data_for_environment "$environment"
    imported=$?
    grand_total=$((grand_total + imported))
done

echo "🎉 Data import completed successfully!"
echo "📊 Total collections imported: $grand_total"
