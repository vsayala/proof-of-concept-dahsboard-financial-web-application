const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const mongoService = require('../services/mongodb/mongoService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Get compliance KPIs
 */
router.get('/kpis', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestId = req.requestId || `req_${Date.now()}`;
  const { environment = 'dev' } = req.query;
  
  try {
    logger.info('Fetching compliance KPIs', { requestId, environment });
    
    // Get compliance data from various collections
    let regulatoryFilings, kycFiles, auditReports;
    try {
      [regulatoryFilings, kycFiles, auditReports] = await Promise.allSettled([
        mongoService.find('regulatory_filings', { environment }, { limit: 100 }),
        mongoService.find('kyc_files', { environment }, { limit: 100 }),
        mongoService.find('audit_reports', { environment }, { limit: 100 })
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));
    } catch (dbError) {
      logger.logError(dbError, {
        module: 'complianceController',
        operation: 'fetch_compliance_data',
        requestId,
        environment
      });
      throw dbError;
    }

    // Calculate compliance metrics
    const totalRegulatoryFilings = regulatoryFilings.length;
    const completedFilings = regulatoryFilings.filter(f => f.status === 'completed' || f.status === 'approved').length;
    const complianceRate = totalRegulatoryFilings > 0 ? Math.round((completedFilings / totalRegulatoryFilings) * 100) : 0;

    const totalKycFiles = kycFiles.length;
    const completedKyc = kycFiles.filter(f => f.status === 'verified' || f.status === 'approved').length;
    const kycCompletionRate = totalKycFiles > 0 ? Math.round((completedKyc / totalKycFiles) * 100) : 0;

    const totalAudits = auditReports.length;
    const completedAudits = auditReports.filter(a => a.status === 'completed').length;
    const auditCompletionRate = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

    // Calculate finding resolution rate
    const totalFindings = auditReports.reduce((sum, audit) => sum + (audit.findings_count || 0), 0);
    const resolvedFindings = auditReports.reduce((sum, audit) => sum + (audit.resolved_findings || 0), 0);
    const findingResolutionRate = totalFindings > 0 ? Math.round((resolvedFindings / totalFindings) * 100) : 0;

    const kpis = {
      overallCompliance: Math.round((complianceRate + kycCompletionRate + auditCompletionRate) / 3),
      auditCompletion: auditCompletionRate,
      findingResolution: findingResolutionRate,
      trainingCompletion: 85 // This would come from training records if available
    };

    const duration = Date.now() - startTime;
    logger.logPerformance('Fetch compliance KPIs', duration, { requestId, environment });

    res.json({
      success: true,
      data: kpis,
      metadata: {
        totalRegulatoryFilings,
        totalKycFiles,
        totalAudits,
        totalFindings,
        resolvedFindings
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logError(error, {
      module: 'complianceController',
      operation: 'get_kpis',
      requestId,
      environment,
      duration
    });
    throw error;
  }
}));

/**
 * Get regulatory compliance overview
 */
router.get('/regulatory-overview', asyncHandler(async (req, res) => {
    const { environment = 'dev' } = req.query;
    
    const regulatoryFilings = await mongoService.find('regulatory_filings', { environment });
    
    // Group by regulation type and calculate compliance scores
    const regulations = ['SOX', 'GDPR', 'PCI DSS', 'HIPAA', 'ISO 27001', 'Basel III'];
    const regulatoryData = regulations.map(regulation => {
      const filings = regulatoryFilings.filter(f => 
        f.regulation_type === regulation || 
        f.regulation === regulation ||
        f.type === regulation
      );
      
      const total = filings.length;
      const compliant = filings.filter(f => 
        f.status === 'completed' || 
        f.status === 'approved' || 
        f.compliance_status === 'compliant'
      ).length;
      
      const compliance = total > 0 ? Math.round((compliant / total) * 100) : 0;
      const risk = 100 - compliance;
      
      return {
        regulation,
        compliance,
        risk,
        lastAudit: filings.length > 0 ? 
          new Date(Math.max(...filings.map(f => new Date(f.last_audit_date || f.updated_at || f.created_at)))).toISOString().split('T')[0] :
          'N/A'
      };
    });

    res.json({
      success: true,
      data: regulatoryData
    });
}));

/**
 * Get compliance status distribution
 */
router.get('/status-distribution', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  const [regulatoryFilings, kycFiles, auditReports] = await Promise.all([
    mongoService.find('regulatory_filings', { environment }),
    mongoService.find('kyc_files', { environment }),
    mongoService.find('audit_reports', { environment })
  ]);

  // Categorize compliance status
  let fullyCompliant = 0;
  let minorIssues = 0;
  let majorIssues = 0;
  let underReview = 0;

  // Check regulatory filings
  regulatoryFilings.forEach(filing => {
    if (filing.status === 'completed' || filing.status === 'approved') {
      fullyCompliant++;
    } else if (filing.status === 'pending' || filing.status === 'in_progress') {
      underReview++;
    } else if (filing.status === 'rejected' || filing.status === 'failed') {
      majorIssues++;
    } else {
      minorIssues++;
    }
  });

  // Check KYC files
  kycFiles.forEach(kyc => {
    if (kyc.status === 'verified' || kyc.status === 'approved') {
      fullyCompliant++;
    } else if (kyc.status === 'pending' || kyc.status === 'under_review') {
      underReview++;
    } else if (kyc.status === 'rejected' || kyc.status === 'failed') {
      majorIssues++;
    } else {
      minorIssues++;
    }
  });

  // Check audit reports
  auditReports.forEach(audit => {
    if (audit.status === 'completed' && (audit.findings_count || 0) === 0) {
      fullyCompliant++;
    } else if (audit.status === 'in_progress' || audit.status === 'pending') {
      underReview++;
    } else if ((audit.findings_count || 0) > 5) {
      majorIssues++;
    } else {
      minorIssues++;
    }
  });

  const statusDistribution = [
    { status: 'Fully Compliant', count: fullyCompliant, color: '#10B981' },
    { status: 'Minor Issues', count: minorIssues, color: '#F59E0B' },
    { status: 'Major Issues', count: majorIssues, color: '#EF4444' },
    { status: 'Under Review', count: underReview, color: '#3B82F6' }
  ];

  res.json({
    success: true,
    data: statusDistribution
  });
}));

/**
 * Get audit timeline and findings
 */
router.get('/audit-timeline', asyncHandler(async (req, res) => {
  const { environment = 'dev', months = 6 } = req.query;
  
  const auditReports = await mongoService.find('audit_reports', { environment });
  
  // Group by month for the last N months
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));
  
  const recentAudits = auditReports.filter(audit => 
    new Date(audit.audit_date || audit.created_at) >= monthsAgo
  );

  // Group by month
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < parseInt(months); i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${monthNames[date.getMonth()]}`;
    monthlyData[monthKey] = {
      month: monthKey,
      audits: 0,
      findings: 0,
      resolved: 0
    };
  }

  recentAudits.forEach(audit => {
    const auditDate = new Date(audit.audit_date || audit.created_at);
    const monthKey = monthNames[auditDate.getMonth()];
    
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].audits++;
      monthlyData[monthKey].findings += audit.findings_count || 0;
      monthlyData[monthKey].resolved += audit.resolved_findings || 0;
    }
  });

  const timelineData = Object.values(monthlyData).reverse();

  res.json({
    success: true,
    data: timelineData
  });
}));

/**
 * Get recent audits
 */
router.get('/recent-audits', asyncHandler(async (req, res) => {
  const { environment = 'dev', limit = 10 } = req.query;
  
  const auditReports = await mongoService.find(
    'audit_reports', 
    { environment },
    { 
      sort: { audit_date: -1, created_at: -1 },
      limit: parseInt(limit)
    }
  );

  const recentAudits = auditReports.map(audit => ({
    id: audit.audit_id || audit.id || `AUD${Date.now()}`,
    type: audit.audit_type || audit.type || 'Internal',
    status: audit.status || 'Completed',
    findings: audit.findings_count || 0,
    date: audit.audit_date ? 
      new Date(audit.audit_date).toISOString().split('T')[0] :
      new Date(audit.created_at).toISOString().split('T')[0],
    auditor: audit.auditor_name || audit.auditor || 'Unknown'
  }));

  res.json({
    success: true,
    data: recentAudits
  });
}));

/**
 * Get risk areas assessment
 */
router.get('/risk-areas', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  // Get data from various collections to assess risk areas
  const [exceptionLogs, auditReports, systemLogs] = await Promise.all([
    mongoService.find('exception_logs', { environment }),
    mongoService.find('audit_reports', { environment }),
    mongoService.find('login_records', { environment })
  ]);

  // Calculate risk scores for different areas
  const riskAreas = [
    {
      area: 'Data Security',
      score: calculateDataSecurityScore(auditReports, systemLogs),
      trend: 'up'
    },
    {
      area: 'Access Control',
      score: calculateAccessControlScore(systemLogs),
      trend: 'down'
    },
    {
      area: 'Process Compliance',
      score: calculateProcessComplianceScore(auditReports),
      trend: 'up'
    },
    {
      area: 'Documentation',
      score: calculateDocumentationScore(auditReports),
      trend: 'up'
    },
    {
      area: 'Training',
      score: 75, // This would come from training records
      trend: 'down'
    },
    {
      area: 'Monitoring',
      score: calculateMonitoringScore(exceptionLogs),
      trend: 'up'
    }
  ];

  res.json({
    success: true,
    data: riskAreas
  });
}));

// Helper functions for risk calculations
function calculateDataSecurityScore(auditReports, systemLogs) {
  const securityAudits = auditReports.filter(a => 
    a.audit_type === 'security' || 
    a.category === 'security' ||
    a.title?.toLowerCase().includes('security')
  );
  
  if (securityAudits.length === 0) return 85;
  
  const avgScore = securityAudits.reduce((sum, audit) => {
    return sum + (audit.security_score || 80);
  }, 0) / securityAudits.length;
  
  return Math.round(avgScore);
}

function calculateAccessControlScore(systemLogs) {
  const totalLogins = systemLogs.length;
  const failedLogins = systemLogs.filter(log => 
    log.status === 'failed' || 
    log.login_status === 'failed'
  ).length;
  
  if (totalLogins === 0) return 78;
  
  const successRate = ((totalLogins - failedLogins) / totalLogins) * 100;
  return Math.round(successRate);
}

function calculateProcessComplianceScore(auditReports) {
  const totalAudits = auditReports.length;
  const compliantAudits = auditReports.filter(audit => 
    audit.status === 'completed' && 
    (audit.findings_count || 0) <= 2
  ).length;
  
  if (totalAudits === 0) return 92;
  
  return Math.round((compliantAudits / totalAudits) * 100);
}

function calculateDocumentationScore(auditReports) {
  const documentedAudits = auditReports.filter(audit => 
    audit.documentation_complete === true ||
    audit.has_documentation === true ||
    (audit.documentation_score || 0) > 80
  ).length;
  
  if (auditReports.length === 0) return 88;
  
  return Math.round((documentedAudits / auditReports.length) * 100);
}

function calculateMonitoringScore(exceptionLogs) {
  const totalExceptions = exceptionLogs.length;
  const resolvedExceptions = exceptionLogs.filter(log => 
    log.resolved === true || 
    log.status === 'resolved'
  ).length;
  
  if (totalExceptions === 0) return 90;
  
  const resolutionRate = (resolvedExceptions / totalExceptions) * 100;
  return Math.round(resolutionRate);
}

module.exports = router;
