const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const mongoService = require('../services/mongodb/mongoService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Get risk assessment KPIs
 */
router.get('/kpis', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  // Get data from various collections
  const [exceptionLogs, auditReports, systemLogs, processTraces] = await Promise.all([
    mongoService.find('exception_logs', { environment }),
    mongoService.find('audit_reports', { environment }),
    mongoService.find('login_records', { environment }),
    mongoService.find('process_mining_traces', { environment })
  ]);

  // Calculate risk metrics
  const totalExceptions = exceptionLogs.length;
  const criticalExceptions = exceptionLogs.filter(log => 
    log.severity === 'critical' || 
    log.severity === 'high' ||
    log.priority === 'critical'
  ).length;
  
  const highRiskItems = criticalExceptions;
  const mediumRiskItems = exceptionLogs.filter(log => 
    log.severity === 'medium' || 
    log.priority === 'medium'
  ).length;
  
  const lowRiskItems = exceptionLogs.filter(log => 
    log.severity === 'low' || 
    log.priority === 'low'
  ).length;

  // Calculate overall risk score (lower is better)
  const totalFindings = auditReports.reduce((sum, audit) => sum + (audit.findings_count || 0), 0);
  const criticalFindings = auditReports.reduce((sum, audit) => sum + (audit.critical_findings || 0), 0);
  const overallRiskScore = totalFindings > 0 ? 
    Math.round((criticalFindings / totalFindings) * 100) : 
    Math.round((criticalExceptions / Math.max(totalExceptions, 1)) * 100);

  const kpis = {
    overallRiskScore: Math.min(overallRiskScore, 100),
    highRiskItems,
    mediumRiskItems,
    lowRiskItems,
    criticalAlerts: criticalExceptions
  };

  res.json({
    success: true,
    data: kpis,
    metadata: {
      totalExceptions,
      totalFindings,
      criticalFindings,
      totalAudits: auditReports.length
    }
  });
}));

/**
 * Get risk trends over time
 */
router.get('/risk-trends', asyncHandler(async (req, res) => {
  const { environment = 'dev', months = 6 } = req.query;
  
  const exceptionLogs = await mongoService.find('exception_logs', { environment });
  
  // Group by month for the last N months
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));
  
  const recentExceptions = exceptionLogs.filter(log => 
    new Date(log.timestamp || log.created_at) >= monthsAgo
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
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      totalRisk: 0
    };
  }

  recentExceptions.forEach(log => {
    const logDate = new Date(log.timestamp || log.created_at);
    const monthKey = monthNames[logDate.getMonth()];
    
    if (monthlyData[monthKey]) {
      if (log.severity === 'critical' || log.severity === 'high') {
        monthlyData[monthKey].highRisk++;
      } else if (log.severity === 'medium') {
        monthlyData[monthKey].mediumRisk++;
      } else {
        monthlyData[monthKey].lowRisk++;
      }
      monthlyData[monthKey].totalRisk++;
    }
  });

  const trendData = Object.values(monthlyData).reverse();

  res.json({
    success: true,
    data: trendData
  });
}));

/**
 * Get risk categories distribution
 */
router.get('/risk-categories', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  const exceptionLogs = await mongoService.find('exception_logs', { environment });
  
  // Categorize risks
  const categories = {
    'Security': 0,
    'Operational': 0,
    'Financial': 0,
    'Compliance': 0,
    'Technical': 0,
    'Process': 0
  };

  exceptionLogs.forEach(log => {
    const category = log.category || log.exception_type || 'Technical';
    const categoryKey = Object.keys(categories).find(key => 
      category.toLowerCase().includes(key.toLowerCase())
    ) || 'Technical';
    
    categories[categoryKey]++;
  });

  const categoryData = Object.entries(categories).map(([name, value]) => ({
    category: name,
    count: value,
    percentage: exceptionLogs.length > 0 ? 
      Math.round((value / exceptionLogs.length) * 100) : 0
  })).filter(item => item.count > 0);

  res.json({
    success: true,
    data: categoryData
  });
}));

/**
 * Get fraud detection analysis
 */
router.get('/fraud-detection', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  // Get data from various collections that might indicate fraud
  const [systemLogs, auditReports, exceptionLogs] = await Promise.all([
    mongoService.find('login_records', { environment }),
    mongoService.find('audit_reports', { environment }),
    mongoService.find('exception_logs', { environment })
  ]);

  // Analyze for potential fraud indicators
  const suspiciousLogins = systemLogs.filter(log => 
    log.status === 'failed' || 
    log.login_status === 'failed' ||
    log.ip_address?.includes('unknown') ||
    log.user_agent?.includes('bot')
  ).length;

  const unusualTransactions = auditReports.filter(audit => 
    audit.amount > 100000 || // Large amounts
    audit.transaction_type === 'unusual' ||
    audit.flagged === true
  ).length;

  const securityExceptions = exceptionLogs.filter(log => 
    log.exception_type?.toLowerCase().includes('security') ||
    log.severity === 'critical' ||
    log.description?.toLowerCase().includes('unauthorized')
  ).length;

  const fraudData = [
    {
      type: 'Suspicious Logins',
      detected: suspiciousLogins,
      prevented: Math.max(0, suspiciousLogins - Math.floor(suspiciousLogins * 0.3)),
      amount: suspiciousLogins * 1000 // Estimated impact
    },
    {
      type: 'Unusual Transactions',
      detected: unusualTransactions,
      prevented: Math.max(0, unusualTransactions - Math.floor(unusualTransactions * 0.2)),
      amount: unusualTransactions * 50000
    },
    {
      type: 'Security Breaches',
      detected: securityExceptions,
      prevented: Math.max(0, securityExceptions - Math.floor(securityExceptions * 0.1)),
      amount: securityExceptions * 100000
    }
  ];

  res.json({
    success: true,
    data: fraudData
  });
}));

/**
 * Get risk heatmap data
 */
router.get('/risk-heatmap', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  const exceptionLogs = await mongoService.find('exception_logs', { environment });
  
  // Create risk heatmap data based on probability vs impact
  const riskAreas = [
    'Data Security', 'Access Control', 'Process Compliance', 
    'Documentation', 'Training', 'Monitoring', 'Financial Controls',
    'Vendor Management', 'Change Management', 'Incident Response'
  ];

  const heatmapData = riskAreas.map(area => {
    const areaExceptions = exceptionLogs.filter(log => 
      log.category?.toLowerCase().includes(area.toLowerCase()) ||
      log.exception_type?.toLowerCase().includes(area.toLowerCase()) ||
      log.component?.toLowerCase().includes(area.toLowerCase())
    );

    const probability = Math.min(100, areaExceptions.length * 10);
    const impact = calculateImpactScore(areaExceptions);
    
    return {
      area,
      probability,
      impact,
      riskScore: Math.round((probability + impact) / 2)
    };
  });

  res.json({
    success: true,
    data: heatmapData
  });
}));

/**
 * Get critical risk alerts
 */
router.get('/critical-alerts', asyncHandler(async (req, res) => {
  const { environment = 'dev', limit = 10 } = req.query;
  
  const exceptionLogs = await mongoService.find(
    'exception_logs', 
    { 
      environment,
      $or: [
        { severity: 'critical' },
        { severity: 'high' },
        { priority: 'critical' },
        { priority: 'high' }
      ]
    },
    { 
      sort: { timestamp: -1, created_at: -1 },
      limit: parseInt(limit)
    }
  );

  const criticalAlerts = exceptionLogs.map((log, index) => ({
    id: log.alert_id || log.id || `ALT${String(index + 1).padStart(3, '0')}`,
    type: log.exception_type || log.category || 'System Alert',
    severity: log.severity || 'High',
    amount: log.amount || (log.severity === 'critical' ? 250000 : 50000),
    time: formatTimeAgo(log.timestamp || log.created_at),
    status: log.resolved ? 'Resolved' : 'Active'
  }));

  res.json({
    success: true,
    data: criticalAlerts
  });
}));

/**
 * Get risk mitigation strategies
 */
router.get('/mitigation-strategies', asyncHandler(async (req, res) => {
  const { environment = 'dev' } = req.query;
  
  // This would typically come from a risk management system
  // For now, we'll provide sample data based on current risks
  const strategies = [
    {
      strategy: 'Enhanced Monitoring',
      effectiveness: 85,
      cost: 50000,
      status: 'Completed',
      progress: 100
    },
    {
      strategy: 'Automated Alerts',
      effectiveness: 78,
      cost: 25000,
      status: 'In Progress',
      progress: 78
    },
    {
      strategy: 'Staff Training',
      effectiveness: 72,
      cost: 15000,
      status: 'Completed',
      progress: 100
    },
    {
      strategy: 'System Upgrades',
      effectiveness: 90,
      cost: 100000,
      status: 'Planned',
      progress: 0
    },
    {
      strategy: 'Process Automation',
      effectiveness: 68,
      cost: 75000,
      status: 'In Progress',
      progress: 68
    }
  ];

  res.json({
    success: true,
    data: strategies
  });
}));

// Helper functions
function calculateImpactScore(exceptions) {
  if (exceptions.length === 0) return 20;
  
  const criticalCount = exceptions.filter(log => 
    log.severity === 'critical' || log.priority === 'critical'
  ).length;
  
  const highCount = exceptions.filter(log => 
    log.severity === 'high' || log.priority === 'high'
  ).length;
  
  const mediumCount = exceptions.filter(log => 
    log.severity === 'medium' || log.priority === 'medium'
  ).length;
  
  // Calculate weighted impact score
  const impactScore = (criticalCount * 100) + (highCount * 70) + (mediumCount * 40);
  return Math.min(100, Math.round(impactScore / Math.max(exceptions.length, 1)));
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
}

module.exports = router;
