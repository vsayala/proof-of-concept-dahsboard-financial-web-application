#!/bin/bash

# Data Import Script for Single audit_data Database
# This script imports JSON files into the audit_data database

set -e

# MongoDB connection details
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USERNAME="admin"
MONGO_PASSWORD="admin123"
MONGO_AUTH_DB="admin"
DB_NAME="audit_data"

# Base path for data files inside the container
DATA_BASE_PATH="/tmp/data"

# Define the data structure mapping (category/subfolder/file)
declare -A data_map
data_map["transactional/journal_entries"]="sample_journal_entries.json"
data_map["transactional/payments"]="sample_payments.json"
data_map["transactional/trades"]="sample_trades.json"
data_map["master_data/customer"]="customer_master.json"
data_map["master_data/vendor"]="vendor_master.json"
data_map["master_data/account_master"]="account_master.json"
data_map["supporting_docs/invoices"]="sample_invoices.json"
data_map["supporting_docs/contracts"]="sample_contracts.json"
data_map["supporting_docs/tax_forms"]="sample_tax_forms.json"
data_map["system_access_logs/login_records"]="sample_login_records.json"
data_map["system_access_logs/change_history"]="sample_change_history.json"
data_map["audit_trail/approval_chains"]="sample_approval_chains.json"
data_map["audit_trail/change_tracking"]="sample_change_tracking.json"
data_map["compliance/kyc_files"]="sample_kyc_files.json"
data_map["compliance/regulatory_filings"]="sample_regulatory_filings.json"
data_map["operational/exception_logs"]="sample_exception_logs.json"
data_map["operational/process_mining_traces"]="sample_process_mining_traces.json"
data_map["financial_reports/balance_sheet"]="sample_balance_sheet.json"
data_map["financial_reports/pl_statement"]="sample_pl_statement.json"
data_map["financial_reports/cash_flow"]="sample_cash_flow.json"
data_map["external_data/audit_reports"]="sample_audit_reports.json"
data_map["external_data/bank_confirms"]="sample_bank_confirms.json"
data_map["communications/emails"]="sample_emails.json"
data_map["communications/meeting_notes"]="sample_meeting_notes.json"
data_map["metadata/data_metadata"]="data_metadata.json"

echo "🚀 Starting data import into audit_data database..."

for folder_path in "${!data_map[@]}"; do
    file_name="${data_map[${folder_path}]}"
    full_file_path="${DATA_BASE_PATH}/${folder_path}/${file_name}"

    # Extract collection name from the last part of the folder_path
    collection_name=$(basename "${folder_path}")

    echo "  📁 Importing ${collection_name} from ${file_name}..."

    # Check if the file exists in the container
    if test -f "${full_file_path}"; then
        # Attempt to import as JSON array
        mongoimport \
            --host "${MONGO_HOST}" \
            --port "${MONGO_PORT}" \
            --username "${MONGO_USERNAME}" \
            --password "${MONGO_PASSWORD}" \
            --authenticationDatabase "${MONGO_AUTH_DB}" \
            --db "${DB_NAME}" \
            --collection "${collection_name}" \
            --file "${full_file_path}" \
            --jsonArray || \
        (
            # If jsonArray fails, try importing as single JSON object
            echo "    ⚠️  jsonArray import failed for ${file_name}, trying without --jsonArray..."
            mongoimport \
                --host "${MONGO_HOST}" \
                --port "${MONGO_PORT}" \
                --username "${MONGO_USERNAME}" \
                --password "${MONGO_PASSWORD}" \
                --authenticationDatabase "${MONGO_AUTH_DB}" \
                --db "${DB_NAME}" \
                --collection "${collection_name}" \
                --file "${full_file_path}"
        )
    else
        echo "    ⚠️  File not found in container: ${full_file_path}"
    fi
done

echo "✅ Data import completed for audit_data database!"
