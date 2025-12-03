// Simple MongoDB Data Import Script for Audit POC
// This script imports JSON data from the copied data folder

print('📥 Starting simple JSON data import for Audit POC...');

// Function to add environment metadata to documents
function addEnvironmentMetadata(doc, environment) {
  return {
    ...doc,
    environment: environment,
    created_at: doc.created_at || doc.created_date || doc.date || new Date(),
    updated_at: doc.last_updated || doc.modified_date || new Date(),
    imported_at: new Date(),
    source: 'json_import'
  };
}

// Function to import data for a specific environment
function importDataForEnvironment(environment) {
  print(`🔄 Importing data for ${environment.toUpperCase()} environment...`);
  
  // Switch to the environment database
  db = db.getSiblingDB(`audit_poc_${environment}`);
  
  // Import journal entries
  try {
    const journalEntries = JSON.parse(cat('/tmp/data/transactional/journal_entries/sample_journal_entries.json'));
    if (journalEntries && journalEntries.length > 0) {
      const enrichedEntries = journalEntries.map(entry => addEnvironmentMetadata(entry, environment));
      db.journal_entries.insertMany(enrichedEntries);
      print(`  ✅ Imported ${enrichedEntries.length} journal entries`);
    }
  } catch (error) {
    print(`  ❌ Error importing journal entries: ${error.message}`);
  }
  
  // Import payments
  try {
    const payments = JSON.parse(cat('/tmp/data/transactional/payments/sample_payments.json'));
    if (payments && payments.length > 0) {
      const enrichedPayments = payments.map(payment => addEnvironmentMetadata(payment, environment));
      db.payments.insertMany(enrichedPayments);
      print(`  ✅ Imported ${enrichedPayments.length} payments`);
    }
  } catch (error) {
    print(`  ❌ Error importing payments: ${error.message}`);
  }
  
  // Import trades
  try {
    const trades = JSON.parse(cat('/tmp/data/transactional/trades/sample_trades.json'));
    if (trades && trades.length > 0) {
      const enrichedTrades = trades.map(trade => addEnvironmentMetadata(trade, environment));
      db.trades.insertMany(enrichedTrades);
      print(`  ✅ Imported ${enrichedTrades.length} trades`);
    }
  } catch (error) {
    print(`  ❌ Error importing trades: ${error.message}`);
  }
  
  // Import customers
  try {
    const customers = JSON.parse(cat('/tmp/data/master_data/customer/customer_master.json'));
    if (customers && customers.length > 0) {
      const enrichedCustomers = customers.map(customer => addEnvironmentMetadata(customer, environment));
      db.customers.insertMany(enrichedCustomers);
      print(`  ✅ Imported ${enrichedCustomers.length} customers`);
    }
  } catch (error) {
    print(`  ❌ Error importing customers: ${error.message}`);
  }
  
  // Import vendors
  try {
    const vendors = JSON.parse(cat('/tmp/data/master_data/vendor/vendor_master.json'));
    if (vendors && vendors.length > 0) {
      const enrichedVendors = vendors.map(vendor => addEnvironmentMetadata(vendor, environment));
      db.vendors.insertMany(enrichedVendors);
      print(`  ✅ Imported ${enrichedVendors.length} vendors`);
    }
  } catch (error) {
    print(`  ❌ Error importing vendors: ${error.message}`);
  }
  
  // Import accounts
  try {
    const accounts = JSON.parse(cat('/tmp/data/master_data/account_master/account_master.json'));
    if (accounts && accounts.length > 0) {
      const enrichedAccounts = accounts.map(account => addEnvironmentMetadata(account, environment));
      db.accounts.insertMany(enrichedAccounts);
      print(`  ✅ Imported ${enrichedAccounts.length} accounts`);
    }
  } catch (error) {
    print(`  ❌ Error importing accounts: ${error.message}`);
  }
  
  // Import invoices
  try {
    const invoices = JSON.parse(cat('/tmp/data/supporting_docs/invoices/sample_invoices.json'));
    if (invoices && invoices.length > 0) {
      const enrichedInvoices = invoices.map(invoice => addEnvironmentMetadata(invoice, environment));
      db.invoices.insertMany(enrichedInvoices);
      print(`  ✅ Imported ${enrichedInvoices.length} invoices`);
    }
  } catch (error) {
    print(`  ❌ Error importing invoices: ${error.message}`);
  }
  
  // Import contracts
  try {
    const contracts = JSON.parse(cat('/tmp/data/supporting_docs/contracts/sample_contracts.json'));
    if (contracts && contracts.length > 0) {
      const enrichedContracts = contracts.map(contract => addEnvironmentMetadata(contract, environment));
      db.contracts.insertMany(enrichedContracts);
      print(`  ✅ Imported ${enrichedContracts.length} contracts`);
    }
  } catch (error) {
    print(`  ❌ Error importing contracts: ${error.message}`);
  }
  
  // Import tax forms
  try {
    const taxForms = JSON.parse(cat('/tmp/data/supporting_docs/tax_forms/sample_tax_forms.json'));
    if (taxForms && taxForms.length > 0) {
      const enrichedTaxForms = taxForms.map(taxForm => addEnvironmentMetadata(taxForm, environment));
      db.tax_forms.insertMany(enrichedTaxForms);
      print(`  ✅ Imported ${enrichedTaxForms.length} tax forms`);
    }
  } catch (error) {
    print(`  ❌ Error importing tax forms: ${error.message}`);
  }
  
  // Import login records
  try {
    const loginRecords = JSON.parse(cat('/tmp/data/system_access_logs/login_records/sample_login_records.json'));
    if (loginRecords && loginRecords.length > 0) {
      const enrichedLoginRecords = loginRecords.map(record => addEnvironmentMetadata(record, environment));
      db.login_records.insertMany(enrichedLoginRecords);
      print(`  ✅ Imported ${enrichedLoginRecords.length} login records`);
    }
  } catch (error) {
    print(`  ❌ Error importing login records: ${error.message}`);
  }
  
  // Import change history
  try {
    const changeHistory = JSON.parse(cat('/tmp/data/system_access_logs/change_history/sample_change_history.json'));
    if (changeHistory && changeHistory.length > 0) {
      const enrichedChangeHistory = changeHistory.map(change => addEnvironmentMetadata(change, environment));
      db.change_history.insertMany(enrichedChangeHistory);
      print(`  ✅ Imported ${enrichedChangeHistory.length} change history records`);
    }
  } catch (error) {
    print(`  ❌ Error importing change history: ${error.message}`);
  }
  
  // Import approval chains
  try {
    const approvalChains = JSON.parse(cat('/tmp/data/audit_trail/approval_chains/sample_approval_chains.json'));
    if (approvalChains && approvalChains.length > 0) {
      const enrichedApprovalChains = approvalChains.map(chain => addEnvironmentMetadata(chain, environment));
      db.approval_chains.insertMany(enrichedApprovalChains);
      print(`  ✅ Imported ${enrichedApprovalChains.length} approval chains`);
    }
  } catch (error) {
    print(`  ❌ Error importing approval chains: ${error.message}`);
  }
  
  // Import change tracking
  try {
    const changeTracking = JSON.parse(cat('/tmp/data/audit_trail/change_tracking/sample_change_tracking.json'));
    if (changeTracking && changeTracking.length > 0) {
      const enrichedChangeTracking = changeTracking.map(tracking => addEnvironmentMetadata(tracking, environment));
      db.change_tracking.insertMany(enrichedChangeTracking);
      print(`  ✅ Imported ${enrichedChangeTracking.length} change tracking records`);
    }
  } catch (error) {
    print(`  ❌ Error importing change tracking: ${error.message}`);
  }
  
  // Import KYC files
  try {
    const kycFiles = JSON.parse(cat('/tmp/data/compliance/kyc_files/sample_kyc_files.json'));
    if (kycFiles && kycFiles.length > 0) {
      const enrichedKycFiles = kycFiles.map(kyc => addEnvironmentMetadata(kyc, environment));
      db.kyc_files.insertMany(enrichedKycFiles);
      print(`  ✅ Imported ${enrichedKycFiles.length} KYC files`);
    }
  } catch (error) {
    print(`  ❌ Error importing KYC files: ${error.message}`);
  }
  
  // Import regulatory filings
  try {
    const regulatoryFilings = JSON.parse(cat('/tmp/data/compliance/regulatory_filings/sample_regulatory_filings.json'));
    if (regulatoryFilings && regulatoryFilings.length > 0) {
      const enrichedRegulatoryFilings = regulatoryFilings.map(filing => addEnvironmentMetadata(filing, environment));
      db.regulatory_filings.insertMany(enrichedRegulatoryFilings);
      print(`  ✅ Imported ${enrichedRegulatoryFilings.length} regulatory filings`);
    }
  } catch (error) {
    print(`  ❌ Error importing regulatory filings: ${error.message}`);
  }
  
  // Import exception logs
  try {
    const exceptionLogs = JSON.parse(cat('/tmp/data/operational/exception_logs/sample_exception_logs.json'));
    if (exceptionLogs && exceptionLogs.length > 0) {
      const enrichedExceptionLogs = exceptionLogs.map(log => addEnvironmentMetadata(log, environment));
      db.exception_logs.insertMany(enrichedExceptionLogs);
      print(`  ✅ Imported ${enrichedExceptionLogs.length} exception logs`);
    }
  } catch (error) {
    print(`  ❌ Error importing exception logs: ${error.message}`);
  }
  
  // Import process mining traces
  try {
    const processTraces = JSON.parse(cat('/tmp/data/operational/process_mining_traces/sample_process_mining_traces.json'));
    if (processTraces && processTraces.length > 0) {
      const enrichedProcessTraces = processTraces.map(trace => addEnvironmentMetadata(trace, environment));
      db.process_mining_traces.insertMany(enrichedProcessTraces);
      print(`  ✅ Imported ${enrichedProcessTraces.length} process mining traces`);
    }
  } catch (error) {
    print(`  ❌ Error importing process mining traces: ${error.message}`);
  }
  
  // Import balance sheet
  try {
    const balanceSheet = JSON.parse(cat('/tmp/data/financial_reports/balance_sheet/sample_balance_sheet.json'));
    if (balanceSheet && balanceSheet.length > 0) {
      const enrichedBalanceSheet = balanceSheet.map(sheet => addEnvironmentMetadata(sheet, environment));
      db.balance_sheet.insertMany(enrichedBalanceSheet);
      print(`  ✅ Imported ${enrichedBalanceSheet.length} balance sheet records`);
    }
  } catch (error) {
    print(`  ❌ Error importing balance sheet: ${error.message}`);
  }
  
  // Import P&L statements
  try {
    const plStatements = JSON.parse(cat('/tmp/data/financial_reports/pl_statement/sample_pl_statement.json'));
    if (plStatements && plStatements.length > 0) {
      const enrichedPlStatements = plStatements.map(statement => addEnvironmentMetadata(statement, environment));
      db.pl_statement.insertMany(enrichedPlStatements);
      print(`  ✅ Imported ${enrichedPlStatements.length} P&L statements`);
    }
  } catch (error) {
    print(`  ❌ Error importing P&L statements: ${error.message}`);
  }
  
  // Import cash flow
  try {
    const cashFlow = JSON.parse(cat('/tmp/data/financial_reports/cash_flow/sample_cash_flow.json'));
    if (cashFlow && cashFlow.length > 0) {
      const enrichedCashFlow = cashFlow.map(flow => addEnvironmentMetadata(flow, environment));
      db.cash_flow.insertMany(enrichedCashFlow);
      print(`  ✅ Imported ${enrichedCashFlow.length} cash flow records`);
    }
  } catch (error) {
    print(`  ❌ Error importing cash flow: ${error.message}`);
  }
  
  // Import audit reports
  try {
    const auditReports = JSON.parse(cat('/tmp/data/external_data/audit_reports/sample_audit_reports.json'));
    if (auditReports && auditReports.length > 0) {
      const enrichedAuditReports = auditReports.map(report => addEnvironmentMetadata(report, environment));
      db.audit_reports.insertMany(enrichedAuditReports);
      print(`  ✅ Imported ${enrichedAuditReports.length} audit reports`);
    }
  } catch (error) {
    print(`  ❌ Error importing audit reports: ${error.message}`);
  }
  
  // Import bank confirmations
  try {
    const bankConfirmations = JSON.parse(cat('/tmp/data/external_data/bank_confirms/sample_bank_confirms.json'));
    if (bankConfirmations && bankConfirmations.length > 0) {
      const enrichedBankConfirmations = bankConfirmations.map(confirmation => addEnvironmentMetadata(confirmation, environment));
      db.bank_confirms.insertMany(enrichedBankConfirmations);
      print(`  ✅ Imported ${enrichedBankConfirmations.length} bank confirmations`);
    }
  } catch (error) {
    print(`  ❌ Error importing bank confirmations: ${error.message}`);
  }
  
  // Import emails
  try {
    const emails = JSON.parse(cat('/tmp/data/communications/emails/sample_emails.json'));
    if (emails && emails.length > 0) {
      const enrichedEmails = emails.map(email => addEnvironmentMetadata(email, environment));
      db.emails.insertMany(enrichedEmails);
      print(`  ✅ Imported ${enrichedEmails.length} emails`);
    }
  } catch (error) {
    print(`  ❌ Error importing emails: ${error.message}`);
  }
  
  // Import meeting notes
  try {
    const meetingNotes = JSON.parse(cat('/tmp/data/communications/meeting_notes/sample_meeting_notes.json'));
    if (meetingNotes && meetingNotes.length > 0) {
      const enrichedMeetingNotes = meetingNotes.map(note => addEnvironmentMetadata(note, environment));
      db.meeting_notes.insertMany(enrichedMeetingNotes);
      print(`  ✅ Imported ${enrichedMeetingNotes.length} meeting notes`);
    }
  } catch (error) {
    print(`  ❌ Error importing meeting notes: ${error.message}`);
  }
  
  // Import metadata
  try {
    const metadata = JSON.parse(cat('/tmp/data/metadata/data_metadata.json'));
    if (metadata) {
      const enrichedMetadata = addEnvironmentMetadata(metadata, environment);
      db.data_metadata.insertOne(enrichedMetadata);
      print(`  ✅ Imported data metadata`);
    }
  } catch (error) {
    print(`  ❌ Error importing metadata: ${error.message}`);
  }
  
  print(`  🎯 Data import completed for ${environment.toUpperCase()} environment`);
}

// Import data for all environments
const environments = ['dev', 'qe', 'stg', 'production'];

environments.forEach(env => {
  importDataForEnvironment(env);
});

print('✅ All data import operations completed successfully!');
print('📊 Data is now available in MongoDB collections');
print('🌐 Access MongoDB Express at http://localhost:8081');
print('🔑 Login with admin/admin123');
