'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  CpuChipIcon,
  LockClosedIcon,
  FireIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Sample risk assessment data
const riskData = {
  riskKPIs: {
    overallRiskScore: 72,
    highRiskItems: 8,
    mediumRiskItems: 15,
    lowRiskItems: 42,
    criticalAlerts: 3
  },
  riskTrends: [
    { month: 'Jan', operational: 75, financial: 68, compliance: 82, cyber: 70 },
    { month: 'Feb', operational: 72, financial: 71, compliance: 85, cyber: 68 },
    { month: 'Mar', operational: 70, financial: 69, compliance: 88, cyber: 65 },
    { month: 'Apr', operational: 68, financial: 66, compliance: 90, cyber: 62 },
    { month: 'May', operational: 65, financial: 64, compliance: 92, cyber: 60 },
    { month: 'Jun', operational: 63, financial: 62, compliance: 94, cyber: 58 }
  ],
  riskCategories: [
    { category: 'Operational Risk', score: 63, trend: 'down', color: '#3B82F6' },
    { category: 'Financial Risk', score: 62, trend: 'down', color: '#10B981' },
    { category: 'Compliance Risk', score: 94, trend: 'up', color: '#F59E0B' },
    { category: 'Cyber Risk', score: 58, trend: 'down', color: '#EF4444' },
    { category: 'Market Risk', score: 71, trend: 'up', color: '#8B5CF6' },
    { category: 'Credit Risk', score: 68, trend: 'down', color: '#F97316' }
  ],
  fraudDetection: [
    { type: 'Transaction Fraud', detected: 12, prevented: 8, amount: 125000 },
    { type: 'Identity Fraud', detected: 5, prevented: 3, amount: 45000 },
    { type: 'Account Takeover', detected: 3, prevented: 2, amount: 78000 },
    { type: 'Payment Fraud', detected: 8, prevented: 6, amount: 92000 },
    { type: 'Synthetic Identity', detected: 2, prevented: 1, amount: 35000 }
  ],
  riskHeatmap: [
    { risk: 'Data Breach', probability: 25, impact: 90, score: 22.5 },
    { risk: 'Regulatory Violation', probability: 15, impact: 85, score: 12.8 },
    { risk: 'System Downtime', probability: 40, impact: 60, score: 24.0 },
    { risk: 'Fraud Loss', probability: 30, impact: 70, score: 21.0 },
    { risk: 'Market Volatility', probability: 60, impact: 45, score: 27.0 },
    { risk: 'Operational Error', probability: 35, impact: 55, score: 19.3 },
    { risk: 'Third-party Risk', probability: 20, impact: 75, score: 15.0 },
    { risk: 'Technology Failure', probability: 25, impact: 80, score: 20.0 }
  ],
  criticalAlerts: [
    { id: 'ALT001', type: 'High Risk Transaction', severity: 'Critical', amount: 250000, time: '2 hours ago', status: 'Active' },
    { id: 'ALT002', type: 'Suspicious Login', severity: 'High', amount: 0, time: '4 hours ago', status: 'Investigated' },
    { id: 'ALT003', type: 'Unusual Pattern', severity: 'Medium', amount: 50000, time: '6 hours ago', status: 'Active' },
    { id: 'ALT004', type: 'Failed Authentication', severity: 'High', amount: 0, time: '8 hours ago', status: 'Resolved' },
    { id: 'ALT005', type: 'Anomaly Detected', severity: 'Medium', amount: 75000, time: '12 hours ago', status: 'Active' }
  ],
  mitigationStrategies: [
    { strategy: 'Enhanced Monitoring', effectiveness: 85, cost: 50000, implementation: 'Completed' },
    { strategy: 'Automated Alerts', effectiveness: 78, cost: 25000, implementation: 'In Progress' },
    { strategy: 'Staff Training', effectiveness: 72, cost: 15000, implementation: 'Completed' },
    { strategy: 'System Upgrades', effectiveness: 90, cost: 100000, implementation: 'Planned' },
    { strategy: 'Process Automation', effectiveness: 68, cost: 75000, implementation: 'In Progress' }
  ]
};

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316'];

export default function RiskAssessmentDashboard() {
  // Track if component is mounted to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  
  // Track data source (database vs sample)
  const [dataSource, setDataSource] = useState<'database' | 'sample'>('sample');
  
  // Initialize with sample data so everything shows immediately
  const [isLoading, setIsLoading] = useState(false);
  const [riskMetrics, setRiskMetrics] = useState(riskData.riskKPIs);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [apiData, setApiData] = useState({
    riskTrends: riskData.riskTrends,
    riskCategories: riskData.riskCategories,
    fraudDetection: riskData.fraudDetection,
    riskHeatmap: riskData.riskHeatmap,
    criticalAlerts: riskData.criticalAlerts,
    mitigationStrategies: riskData.mitigationStrategies
  });

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        // Don't set loading to true - show sample data immediately
        // Fetch data from API endpoints with error handling
        const [kpisRes, trendsRes, categoriesRes, fraudRes, heatmapRes, alertsRes, strategiesRes] = await Promise.allSettled([
          fetch('http://localhost:3000/api/risk-assessment/kpis?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/risk-trends?environment=dev&months=6').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/risk-categories?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/fraud-detection?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/risk-heatmap?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/critical-alerts?environment=dev&limit=5').catch(() => null),
          fetch('http://localhost:3000/api/risk-assessment/mitigation-strategies?environment=dev').catch(() => null)
        ]);

        // Process API responses with error handling
        const processResponse = async (response, fallbackData) => {
          if (response && response.status === 'fulfilled' && response.value) {
            try {
              const data = await response.value.json();
              // Only use API data if it's valid and has content
              if (data.success && data.data && (Array.isArray(data.data) ? data.data.length > 0 : Object.keys(data.data).length > 0)) {
                return data.data;
              }
              return fallbackData;
            } catch (error) {
              return fallbackData;
            }
          }
          return fallbackData;
        };

        // Update state with real data or keep sample data
        const kpis = await processResponse(kpisRes, riskData.riskKPIs);
        const trends = await processResponse(trendsRes, riskData.riskTrends);
        const categories = await processResponse(categoriesRes, riskData.riskCategories);
        const fraud = await processResponse(fraudRes, riskData.fraudDetection);
        const heatmap = await processResponse(heatmapRes, riskData.riskHeatmap);
        const alerts = await processResponse(alertsRes, riskData.criticalAlerts);
        const strategies = await processResponse(strategiesRes, riskData.mitigationStrategies);

        // Track if we got any real data from database
        let hasRealData = false;
        
        // Only update if we got real data, otherwise keep sample data
        if (kpis && kpis !== riskData.riskKPIs) {
          setRiskMetrics(kpis);
          hasRealData = true;
        }
        if (trends && trends !== riskData.riskTrends) {
          setApiData(prev => ({ ...prev, riskTrends: trends }));
          hasRealData = true;
        }
        if (categories && categories !== riskData.riskCategories) {
          setApiData(prev => ({ ...prev, riskCategories: categories }));
          hasRealData = true;
        }
        if (fraud && fraud !== riskData.fraudDetection) {
          setApiData(prev => ({ ...prev, fraudDetection: fraud }));
          hasRealData = true;
        }
        if (heatmap && heatmap !== riskData.riskHeatmap) {
          setApiData(prev => ({ ...prev, riskHeatmap: heatmap }));
          hasRealData = true;
        }
        if (alerts && alerts !== riskData.criticalAlerts) {
          setApiData(prev => ({ ...prev, criticalAlerts: alerts }));
          hasRealData = true;
        }
        if (strategies && strategies !== riskData.mitigationStrategies) {
          setApiData(prev => ({ ...prev, mitigationStrategies: strategies }));
          hasRealData = true;
        }
        
        // Update data source indicator
        setDataSource(hasRealData ? 'database' : 'sample');
      } catch (error) {
        console.warn('Error fetching risk data, using sample data:', error);
        // Keep using sample data if API fails
      }
    };

    fetchRiskData();
  }, []);

  // Prepare 3D data for Risk Trends Over Time
  const riskTrends3DData = useMemo(() => {
    const trends = apiData.riskTrends || [];
    const months = trends.map(item => item.month);
    
    return {
      months,
      operational: trends.map(item => item.operational),
      financial: trends.map(item => item.financial),
      compliance: trends.map(item => item.compliance),
      cyber: trends.map(item => item.cyber)
    };
  }, [apiData.riskTrends]);

  // Prepare 3D data for Risk Categories Distribution
  const riskCategories3DData = useMemo(() => {
    const categories = apiData.riskCategories || [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
    
    return categories.map((category, idx) => ({
      x: idx,
      y: 0,
      z: category.score,
      category: category.category,
      score: category.score,
      trend: category.trend,
      color: category.color || colors[idx % colors.length],
      text: `${category.category}<br>Score: ${category.score}%<br>Trend: ${category.trend}`
    }));
  }, [apiData.riskCategories]);

  // Prepare 3D data for Fraud Detection Analysis
  const fraudDetection3DData = useMemo(() => {
    const fraud = apiData.fraudDetection || [];
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6'];
    
    return fraud.map((item, idx) => ({
      x: idx,
      y: 0, // Detected at y=0
      z: item.detected,
      type: item.type,
      detected: item.detected,
      prevented: item.prevented,
      amount: item.amount,
      color: colors[idx % colors.length],
      text: `${item.type}<br>Detected: ${item.detected}<br>Prevented: ${item.prevented}<br>Amount: $${(item.amount / 1000).toFixed(2)}K`
    }));
  }, [apiData.fraudDetection]);

  // Prepare 3D data for Risk Heatmap
  const riskHeatmap3DData = useMemo(() => {
    const heatmap = apiData.riskHeatmap || [];
    
    return heatmap.map((item) => ({
      x: item.probability,
      y: item.impact,
      z: item.score,
      risk: item.risk,
      probability: item.probability,
      impact: item.impact,
      score: item.score,
      text: `${item.risk}<br>Probability: ${item.probability}%<br>Impact: ${item.impact}%<br>Score: ${item.score}`
    }));
  }, [apiData.riskHeatmap]);

  const generateRiskReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get current date and time
      const reportDate = new Date();
      const formattedDate = reportDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Calculate risk level
      const getRiskLevel = (score: number) => {
        if (score >= 80) return { level: 'Critical', color: '#DC2626', description: 'Immediate action required' };
        if (score >= 60) return { level: 'High', color: '#F59E0B', description: 'Action required within 30 days' };
        if (score >= 40) return { level: 'Medium', color: '#FBBF24', description: 'Monitor and plan mitigation' };
        return { level: 'Low', color: '#10B981', description: 'Acceptable risk level' };
      };
      
      const overallRisk = getRiskLevel(riskMetrics.overallRiskScore);
      
      // Calculate total fraud amounts
      const totalFraudDetected = apiData.fraudDetection.reduce((sum, f) => sum + f.detected, 0);
      const totalFraudPrevented = apiData.fraudDetection.reduce((sum, f) => sum + f.prevented, 0);
      const totalFraudAmount = apiData.fraudDetection.reduce((sum, f) => sum + f.amount, 0);
      const fraudPreventionRate = totalFraudDetected > 0 ? Math.round((totalFraudPrevented / totalFraudDetected) * 100) : 0;
      
      // Get latest trend data
      const latestTrend = apiData.riskTrends[apiData.riskTrends.length - 1];
      const previousTrend = apiData.riskTrends[apiData.riskTrends.length - 2];
      
      // Calculate trend changes
      const calculateTrendChange = (current: number, previous: number) => {
        const change = current - previous;
        const percentChange = previous > 0 ? Math.round((change / previous) * 100) : 0;
        return { change, percentChange, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
      };
      
      // Sort critical alerts by severity
      const sortedAlerts = [...(apiData.criticalAlerts || [])].sort((a, b) => {
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      });
      
      // Create comprehensive report
      const reportContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprehensive Risk Assessment Report - ${reportDate.toISOString().split('T')[0]}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: #f5f5f5;
              padding: 20px;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              border-bottom: 4px solid #3B82F6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              font-size: 2.5em;
              margin-bottom: 10px;
            }
            .header .meta {
              color: #666;
              font-size: 1.1em;
            }
            .executive-summary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .executive-summary h2 {
              margin-bottom: 20px;
              font-size: 1.8em;
            }
            .executive-summary .risk-score {
              font-size: 3em;
              font-weight: bold;
              margin: 10px 0;
            }
            .executive-summary .risk-level {
              font-size: 1.3em;
              margin-bottom: 15px;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .metric-card {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3B82F6;
            }
            .metric-card h3 {
              color: #666;
              font-size: 0.9em;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .metric-card .value {
              font-size: 2em;
              font-weight: bold;
              color: #1e40af;
            }
            .section {
              margin: 40px 0;
              padding: 20px 0;
              border-top: 2px solid #e5e7eb;
            }
            .section h2 {
              color: #1e40af;
              font-size: 1.8em;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #3B82F6;
            }
            .section h3 {
              color: #374151;
              font-size: 1.3em;
              margin: 25px 0 15px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
            }
            table th {
              background: #3B82F6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            table tr:hover {
              background: #f8f9fa;
            }
            .risk-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.85em;
              font-weight: 600;
            }
            .risk-critical { background: #FEE2E2; color: #DC2626; }
            .risk-high { background: #FEF3C7; color: #D97706; }
            .risk-medium { background: #FEF3C7; color: #F59E0B; }
            .risk-low { background: #D1FAE5; color: #059669; }
            .trend-up { color: #DC2626; }
            .trend-down { color: #10B981; }
            .trend-stable { color: #6B7280; }
            .alert-item {
              background: #f8f9fa;
              padding: 15px;
              margin: 10px 0;
              border-left: 4px solid #EF4444;
              border-radius: 4px;
            }
            .alert-item.high { border-left-color: #F59E0B; }
            .alert-item.medium { border-left-color: #FBBF24; }
            .strategy-card {
              background: #f8f9fa;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #10B981;
            }
            .strategy-card h4 {
              color: #1e40af;
              margin-bottom: 10px;
            }
            .progress-bar {
              background: #e5e7eb;
              height: 20px;
              border-radius: 10px;
              overflow: hidden;
              margin: 10px 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #10B981, #059669);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 0.85em;
              font-weight: 600;
            }
            .recommendations {
              background: #FEF3C7;
              padding: 25px;
              border-radius: 8px;
              border-left: 4px solid #F59E0B;
              margin: 20px 0;
            }
            .recommendations ul {
              margin-left: 20px;
              margin-top: 15px;
            }
            .recommendations li {
              margin: 10px 0;
              line-height: 1.8;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
            @media print {
              body { background: white; padding: 0; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Comprehensive Risk Assessment Report</h1>
              <div class="meta">
                <strong>Generated on:</strong> ${formattedDate}<br>
                <strong>Report Period:</strong> Last 6 Months<br>
                <strong>Environment:</strong> Development<br>
                <strong>Data Source:</strong> <span style="color: ${dataSource === 'database' ? '#10B981' : '#F59E0B'}; font-weight: bold;">${dataSource === 'database' ? '✅ Database (MongoDB)' : '⚠️ Sample Data (Database Unavailable)'}</span>
              </div>
            </div>

            <div class="executive-summary">
              <h2>Executive Summary</h2>
              ${dataSource === 'sample' ? '<div style="background: rgba(245, 158, 11, 0.2); border: 2px solid #F59E0B; padding: 15px; border-radius: 8px; margin-bottom: 20px;"><strong>⚠️ IMPORTANT NOTICE:</strong> This report is generated using <strong>SAMPLE DATA</strong> because the database connection is unavailable. The values shown are for demonstration purposes only and do not reflect actual database records. To view real data, ensure MongoDB is running and the API can connect to the database.</div>' : ''}
              <div class="risk-score">${riskMetrics.overallRiskScore}%</div>
              <div class="risk-level">
                <strong>Overall Risk Level:</strong> ${overallRisk.level} - ${overallRisk.description}
              </div>
              <p style="margin-top: 15px; line-height: 1.8;">
                ${dataSource === 'database' ? 'This comprehensive risk assessment report provides a detailed analysis of organizational risk exposure based on actual data retrieved from the database.' : 'This report is generated using sample data for demonstration purposes. Actual database values will be displayed once the database connection is established.'}
                The current overall risk score of <strong>${riskMetrics.overallRiskScore}%</strong> 
                indicates a ${overallRisk.level.toLowerCase()} risk environment requiring ${overallRisk.description.toLowerCase()}. 
                ${dataSource === 'database' ? 'Key areas of concern include compliance risk at 94%, which has shown an upward trend over the past 6 months. However, operational and financial risks have shown improvement, decreasing from 75% and 68% respectively to current levels of 63% and 62%.' : 'Note: These values are sample data and should not be used for actual risk assessment decisions.'}
              </p>
            </div>

            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Overall Risk Score</h3>
                <div class="value">${riskMetrics.overallRiskScore}%</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">${overallRisk.level} Risk</div>
              </div>
              <div class="metric-card">
                <h3>High Risk Items</h3>
                <div class="value">${riskMetrics.highRiskItems}</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Require Immediate Attention</div>
              </div>
              <div class="metric-card">
                <h3>Medium Risk Items</h3>
                <div class="value">${riskMetrics.mediumRiskItems}</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Monitor Closely</div>
              </div>
              <div class="metric-card">
                <h3>Low Risk Items</h3>
                <div class="value">${riskMetrics.lowRiskItems}</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Acceptable Level</div>
              </div>
              <div class="metric-card">
                <h3>Critical Alerts</h3>
                <div class="value">${riskMetrics.criticalAlerts}</div>
                <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Active Monitoring</div>
              </div>
            </div>

            <div class="section">
              <h2>1. Detailed Risk Categories Analysis</h2>
              <p style="margin-bottom: 20px; color: #666;">
                This section provides a comprehensive breakdown of risk across all major categories, including 
                current scores, trends, and comparative analysis.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Risk Category</th>
                    <th>Current Score</th>
                    <th>Trend (6 Months)</th>
                    <th>Risk Level</th>
                    <th>Change from Previous</th>
                  </tr>
                </thead>
                <tbody>
                  ${apiData.riskCategories.map(category => {
                    const categoryKey = category.category.toLowerCase().replace(' risk', '') as keyof typeof latestTrend;
                    const currentValue = typeof latestTrend[categoryKey] === 'number' ? latestTrend[categoryKey] as number : category.score;
                    const previousValue = typeof previousTrend[categoryKey] === 'number' ? previousTrend[categoryKey] as number : category.score;
                    const trend = apiData.riskTrends.length >= 2 ? 
                      calculateTrendChange(currentValue, previousValue) : { change: 0, percentChange: 0, direction: 'stable' };
                    const riskInfo = getRiskLevel(category.score);
                    return `
                      <tr>
                        <td><strong>${category.category}</strong></td>
                        <td><strong>${category.score}%</strong></td>
                        <td>
                          <span class="trend-${trend.direction}">
                            ${trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} 
                            ${Math.abs(trend.percentChange)}%
                          </span>
                        </td>
                        <td><span class="risk-badge risk-${riskInfo.level.toLowerCase()}">${riskInfo.level}</span></td>
                        <td>${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <h3>Category-Specific Insights</h3>
              ${apiData.riskCategories.map(category => {
                const riskInfo = getRiskLevel(category.score);
                let insight = '';
                if (category.category === 'Compliance Risk' && category.score >= 90) {
                  insight = 'Compliance risk is at a critical level. Immediate regulatory review and remediation actions are required. Consider engaging compliance consultants and implementing automated compliance monitoring systems.';
                } else if (category.category === 'Operational Risk' && category.trend === 'down') {
                  insight = 'Operational risk has shown improvement over the past 6 months, indicating effective process improvements and controls. Continue monitoring to maintain this positive trend.';
                } else if (category.category === 'Financial Risk' && category.trend === 'down') {
                  insight = 'Financial risk management has been effective, with scores decreasing from previous periods. Maintain current financial controls and monitoring mechanisms.';
                } else if (category.category === 'Cyber Risk') {
                  insight = 'Cybersecurity posture requires continuous monitoring. Implement regular security assessments, employee training, and keep security systems up to date.';
                } else {
                  insight = 'This category requires ongoing monitoring and periodic assessment to ensure risk levels remain within acceptable thresholds.';
                }
                return `
                  <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid ${category.color}; border-radius: 4px;">
                    <strong>${category.category} (${category.score}%):</strong> ${insight}
                  </div>
                `;
              }).join('')}
            </div>

            <div class="section">
              <h2>2. Risk Trends Over Time (6-Month Analysis)</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Historical trend analysis showing risk score evolution across all major categories over the past 6 months.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Operational Risk</th>
                    <th>Financial Risk</th>
                    <th>Compliance Risk</th>
                    <th>Cyber Risk</th>
                    <th>Average Risk</th>
                  </tr>
                </thead>
                <tbody>
                  ${apiData.riskTrends.map((trend, index) => {
                    const avg = Math.round((trend.operational + trend.financial + trend.compliance + trend.cyber) / 4);
                    const isLatest = index === apiData.riskTrends.length - 1;
                    return `
                      <tr ${isLatest ? 'style="background: #EFF6FF; font-weight: 600;"' : ''}>
                        <td><strong>${trend.month}</strong>${isLatest ? ' (Current)' : ''}</td>
                        <td>${trend.operational}%</td>
                        <td>${trend.financial}%</td>
                        <td>${trend.compliance}%</td>
                        <td>${trend.cyber}%</td>
                        <td><strong>${avg}%</strong></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <h3>Trend Analysis Summary</h3>
              <ul style="margin-left: 20px; line-height: 2;">
                <li><strong>Operational Risk:</strong> Decreased from ${apiData.riskTrends[0].operational}% to ${latestTrend.operational}% (${latestTrend.operational - apiData.riskTrends[0].operational}% improvement)</li>
                <li><strong>Financial Risk:</strong> Decreased from ${apiData.riskTrends[0].financial}% to ${latestTrend.financial}% (${latestTrend.financial - apiData.riskTrends[0].financial}% improvement)</li>
                <li><strong>Compliance Risk:</strong> Increased from ${apiData.riskTrends[0].compliance}% to ${latestTrend.compliance}% (${latestTrend.compliance - apiData.riskTrends[0].compliance}% increase - requires attention)</li>
                <li><strong>Cyber Risk:</strong> Decreased from ${apiData.riskTrends[0].cyber}% to ${latestTrend.cyber}% (${latestTrend.cyber - apiData.riskTrends[0].cyber}% improvement)</li>
              </ul>
            </div>

            <div class="section">
              <h2>3. Fraud Detection Analysis</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Comprehensive analysis of fraud detection and prevention activities, including detection rates, 
                prevention effectiveness, and financial impact.
              </p>
              <div class="metrics-grid" style="margin-bottom: 30px;">
                <div class="metric-card">
                  <h3>Total Fraud Detected</h3>
                  <div class="value">${totalFraudDetected}</div>
                  <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Incidents</div>
                </div>
                <div class="metric-card">
                  <h3>Total Fraud Prevented</h3>
                  <div class="value">${totalFraudPrevented}</div>
                  <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Incidents</div>
                </div>
                <div class="metric-card">
                  <h3>Prevention Rate</h3>
                  <div class="value">${fraudPreventionRate}%</div>
                  <div style="margin-top: 5px; font-size: 0.9em; color: #666;">Effectiveness</div>
                </div>
                <div class="metric-card">
                  <h3>Total Amount at Risk</h3>
                  <div class="value">$${(totalFraudAmount / 1000).toFixed(0)}K</div>
                  <div style="margin-top: 5px; font-size: 0.9em; color: #666;">USD</div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Fraud Type</th>
                    <th>Detected</th>
                    <th>Prevented</th>
                    <th>Prevention Rate</th>
                    <th>Amount at Risk (USD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${apiData.fraudDetection.map(fraud => {
                    const preventionRate = fraud.detected > 0 ? Math.round((fraud.prevented / fraud.detected) * 100) : 0;
                    const status = preventionRate >= 70 ? 'Effective' : preventionRate >= 50 ? 'Moderate' : 'Needs Improvement';
                    return `
                      <tr>
                        <td><strong>${fraud.type}</strong></td>
                        <td>${fraud.detected}</td>
                        <td>${fraud.prevented}</td>
                        <td>${preventionRate}%</td>
                        <td>$${fraud.amount.toLocaleString()}</td>
                        <td><span class="risk-badge ${preventionRate >= 70 ? 'risk-low' : preventionRate >= 50 ? 'risk-medium' : 'risk-high'}">${status}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <h3>Fraud Detection Insights</h3>
              <ul style="margin-left: 20px; line-height: 2;">
                <li>Overall fraud prevention rate of <strong>${fraudPreventionRate}%</strong> indicates ${fraudPreventionRate >= 70 ? 'strong' : fraudPreventionRate >= 50 ? 'moderate' : 'needs improvement'} detection capabilities</li>
                <li>Total potential financial exposure: <strong>$${totalFraudAmount.toLocaleString()}</strong></li>
                <li>Transaction Fraud represents the highest volume with ${apiData.fraudDetection[0].detected} detected incidents</li>
                <li>Account Takeover incidents, while fewer in number, represent significant financial risk ($78,000)</li>
              </ul>
            </div>

            <div class="section">
              <h2>4. Risk Heatmap (Probability vs Impact Analysis)</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Risk prioritization matrix showing probability and impact assessment for key risk scenarios.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Risk Scenario</th>
                    <th>Probability (%)</th>
                    <th>Impact (%)</th>
                    <th>Risk Score</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  ${apiData.riskHeatmap.sort((a, b) => b.score - a.score).map(risk => {
                    const priority = risk.score >= 25 ? 'Critical' : risk.score >= 20 ? 'High' : risk.score >= 15 ? 'Medium' : 'Low';
                    return `
                      <tr>
                        <td><strong>${risk.risk}</strong></td>
                        <td>${risk.probability}%</td>
                        <td>${risk.impact}%</td>
                        <td><strong>${risk.score.toFixed(1)}</strong></td>
                        <td><span class="risk-badge risk-${priority.toLowerCase()}">${priority}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
              
              <h3>High-Priority Risks Requiring Immediate Attention</h3>
              ${apiData.riskHeatmap.filter(r => r.score >= 20).sort((a, b) => b.score - a.score).map(risk => {
                return `
                  <div class="alert-item high">
                    <strong>${risk.risk}</strong> - Risk Score: ${risk.score.toFixed(1)}<br>
                    Probability: ${risk.probability}% | Impact: ${risk.impact}%<br>
                    <em>This risk requires immediate mitigation planning and monitoring.</em>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="section">
              <h2>5. Critical Alerts and Active Monitoring</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Current active alerts requiring immediate attention and investigation.
              </p>
              ${sortedAlerts.slice(0, 5).map(alert => {
                const alertClass = alert.severity.toLowerCase();
                return `
                  <div class="alert-item ${alertClass}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                      <div>
                        <strong>Alert ID:</strong> ${alert.id} | <strong>Type:</strong> ${alert.type}<br>
                        <strong>Severity:</strong> <span class="risk-badge risk-${alertClass}">${alert.severity}</span> | 
                        <strong>Status:</strong> ${alert.status} | <strong>Time:</strong> ${alert.time}<br>
                        ${alert.amount > 0 ? `<strong>Amount:</strong> $${alert.amount.toLocaleString()}` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
              
              <h3>Alert Summary</h3>
              <ul style="margin-left: 20px; line-height: 2;">
                <li><strong>Total Active Alerts:</strong> ${sortedAlerts.filter(a => a.status === 'Active').length}</li>
                <li><strong>Critical Severity:</strong> ${sortedAlerts.filter(a => a.severity === 'Critical').length}</li>
                <li><strong>High Severity:</strong> ${sortedAlerts.filter(a => a.severity === 'High').length}</li>
                <li><strong>Resolved:</strong> ${sortedAlerts.filter(a => a.status === 'Resolved').length}</li>
              </ul>
            </div>

            <div class="section">
              <h2>6. Mitigation Strategies and Controls</h2>
              <p style="margin-bottom: 20px; color: #666;">
                Current and planned mitigation strategies with effectiveness ratings and implementation status.
              </p>
              ${apiData.mitigationStrategies.map(strategy => {
                return `
                  <div class="strategy-card">
                    <h4>${strategy.strategy}</h4>
                    <div style="margin: 10px 0;">
                      <strong>Effectiveness:</strong> ${strategy.effectiveness}% | 
                      <strong>Cost:</strong> $${strategy.cost.toLocaleString()} | 
                      <strong>Status:</strong> <span class="risk-badge ${strategy.implementation === 'Completed' ? 'risk-low' : strategy.implementation === 'In Progress' ? 'risk-medium' : 'risk-high'}">${strategy.implementation}</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${strategy.effectiveness}%;">
                        ${strategy.effectiveness}%
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="section">
              <h2>7. Recommendations and Action Items</h2>
              <div class="recommendations">
                <h3>Immediate Actions (Next 30 Days)</h3>
                <ul>
                  <li><strong>Address Compliance Risk:</strong> With compliance risk at 94%, implement immediate regulatory review, engage compliance consultants, and establish automated compliance monitoring systems.</li>
                  <li><strong>Investigate Critical Alerts:</strong> Review and resolve all ${sortedAlerts.filter(a => a.severity === 'Critical').length} critical alerts within 48 hours.</li>
                  <li><strong>Enhance Fraud Detection:</strong> Improve fraud prevention rates for fraud types with less than 70% prevention rate through enhanced monitoring and automated detection systems.</li>
                  <li><strong>Risk Heatmap Mitigation:</strong> Develop mitigation plans for high-priority risks (score ≥ 20) identified in the risk heatmap.</li>
                </ul>
                
                <h3 style="margin-top: 25px;">Short-Term Actions (Next 90 Days)</h3>
                <ul>
                  <li><strong>Complete In-Progress Mitigations:</strong> Finalize implementation of "Automated Alerts" and "Process Automation" strategies.</li>
                  <li><strong>System Upgrades:</strong> Begin implementation of system upgrades strategy with 90% expected effectiveness.</li>
                  <li><strong>Continuous Monitoring:</strong> Establish regular risk assessment reviews (monthly) to track progress on risk reduction initiatives.</li>
                  <li><strong>Staff Training:</strong> Continue staff training programs to maintain and improve operational risk scores.</li>
                </ul>
                
                <h3 style="margin-top: 25px;">Long-Term Strategic Initiatives</h3>
                <ul>
                  <li><strong>Risk Culture:</strong> Foster a strong risk-aware culture across the organization through regular communication and training.</li>
                  <li><strong>Technology Investment:</strong> Invest in advanced risk management technologies and analytics capabilities.</li>
                  <li><strong>Process Optimization:</strong> Continue process improvements to maintain positive trends in operational and financial risk categories.</li>
                  <li><strong>Compliance Framework:</strong> Develop and implement a comprehensive compliance framework to address the high compliance risk score.</li>
                </ul>
              </div>
            </div>

            <div class="section">
              <h2>8. Appendices</h2>
              <h3>Methodology</h3>
              <p style="margin-bottom: 15px; color: #666;">
                This risk assessment report is based on comprehensive data analysis from multiple sources including:
              </p>
              <ul style="margin-left: 20px; line-height: 2;">
                <li>Exception logs and system monitoring data</li>
                <li>Audit reports and compliance records</li>
                <li>Fraud detection and prevention systems</li>
                <li>Process mining and transaction analysis</li>
                <li>Historical trend data (6-month period)</li>
              </ul>
              
              <h3>Risk Scoring Methodology</h3>
              <ul style="margin-left: 20px; line-height: 2;">
                <li><strong>Critical (80-100%):</strong> Immediate action required</li>
                <li><strong>High (60-79%):</strong> Action required within 30 days</li>
                <li><strong>Medium (40-59%):</strong> Monitor and plan mitigation</li>
                <li><strong>Low (0-39%):</strong> Acceptable risk level</li>
              </ul>
            </div>

            <div class="footer">
              <p><strong>Report Generated By:</strong> Audit POC Risk Assessment System</p>
              <p><strong>For Questions or Additional Information:</strong> Please contact the Risk Management Team</p>
              <p style="margin-top: 10px; color: #999;">This is an automated risk assessment report. For detailed analysis, please consult with risk management specialists.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Comprehensive_Risk_Assessment_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating risk report:', error);
      alert('Failed to generate risk report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const KpiCard = ({ title, value, icon: Icon, color, format = 'number', subtitle }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    format?: 'number' | 'percentage';
    subtitle?: string;
  }) => {
    const formatValue = (val: number) => {
      return format === 'percentage' ? `${val}%` : val.toString();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800';
      case 'Investigated': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Risk Assessment Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Risk Assessment Dashboard
                </h1>
                <p className="text-sm text-orange-600 font-medium">Advanced Risk Analysis & Fraud Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/landing"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Financial Dashboard</span>
              </Link>
              <Link
                href="/compliance"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ShieldExclamationIcon className="h-5 w-5" />
                <span>Compliance Report</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KpiCard
            title="Overall Risk Score"
            value={riskMetrics.overallRiskScore}
            icon={ExclamationTriangleIcon}
            color="bg-orange-500"
            format="percentage"
            subtitle="Lower is better"
          />
          <KpiCard
            title="High Risk Items"
            value={riskMetrics.highRiskItems}
            icon={ExclamationCircleIcon}
            color="bg-red-500"
            format="number"
            subtitle="Requires attention"
          />
          <KpiCard
            title="Medium Risk Items"
            value={riskMetrics.mediumRiskItems}
            icon={ClockIcon}
            color="bg-yellow-500"
            format="number"
            subtitle="Monitor closely"
          />
          <KpiCard
            title="Low Risk Items"
            value={riskMetrics.lowRiskItems}
            icon={CheckCircleIcon}
            color="bg-green-500"
            format="number"
            subtitle="Under control"
          />
          <KpiCard
            title="Critical Alerts"
            value={riskMetrics.criticalAlerts}
            icon={FireIcon}
            color="bg-red-600"
            format="number"
            subtitle="Immediate action"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 3D Risk Trends Over Time */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl shadow-2xl p-4 border border-blue-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
                3D Risk Trends Over Time
              </h3>
              <p className="text-xs text-blue-200 mb-2">Interactive 3D visualization of risk trends across categories</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {mounted && riskTrends3DData && riskTrends3DData.months && riskTrends3DData.months.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: riskTrends3DData.months,
                        y: Array(riskTrends3DData.months.length).fill(0),
                        z: riskTrends3DData.operational,
                        name: 'Operational',
                        line: { color: '#3B82F6', width: 8 },
                        marker: { size: 8, color: '#3B82F6', line: { color: 'white', width: 2 } },
                        hovertemplate: '<b>Operational Risk</b><br>Month: %{x}<br>Score: %{z}%<extra></extra>'
                      },
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: riskTrends3DData.months,
                        y: Array(riskTrends3DData.months.length).fill(1),
                        z: riskTrends3DData.financial,
                        name: 'Financial',
                        line: { color: '#10B981', width: 8 },
                        marker: { size: 8, color: '#10B981', line: { color: 'white', width: 2 } },
                        hovertemplate: '<b>Financial Risk</b><br>Month: %{x}<br>Score: %{z}%<extra></extra>'
                      },
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: riskTrends3DData.months,
                        y: Array(riskTrends3DData.months.length).fill(2),
                        z: riskTrends3DData.compliance,
                        name: 'Compliance',
                        line: { color: '#F59E0B', width: 8 },
                        marker: { size: 8, color: '#F59E0B', line: { color: 'white', width: 2 } },
                        hovertemplate: '<b>Compliance Risk</b><br>Month: %{x}<br>Score: %{z}%<extra></extra>'
                      },
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: riskTrends3DData.months,
                        y: Array(riskTrends3DData.months.length).fill(3),
                        z: riskTrends3DData.cyber,
                        name: 'Cyber',
                        line: { color: '#EF4444', width: 8 },
                        marker: { size: 8, color: '#EF4444', line: { color: 'white', width: 2 } },
                        hovertemplate: '<b>Cyber Risk</b><br>Month: %{x}<br>Score: %{z}%<extra></extra>'
                      }
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { title: 'Month', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        yaxis: { 
                          title: 'Risk Category', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: [0, 1, 2, 3],
                          ticktext: ['Operational', 'Financial', 'Compliance', 'Cyber'],
                          tickfont: { color: 'white' }
                        },
                        zaxis: { title: 'Risk Score (%)', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        camera: { eye: { x: 1.8, y: 1.8, z: 1.8 } }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0, 0, 0, 0.7)', bordercolor: 'rgba(255, 255, 255, 0.5)', borderwidth: 2, font: { color: 'white', size: 12 } }
                    }}
                    config={{ displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['pan2d', 'lasso2d'], responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Risk Trends...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Risk Categories Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-2xl shadow-2xl p-4 border border-green-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-teal-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-green-400" />
                3D Risk Categories Distribution
              </h3>
              <p className="text-xs text-green-200 mb-2">Interactive 3D bar chart of risk scores by category</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {mounted && riskCategories3DData && riskCategories3DData.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: riskCategories3DData.map(d => d.x),
                        y: riskCategories3DData.map(d => d.y),
                        z: riskCategories3DData.map(d => d.z),
                        text: riskCategories3DData.map(d => d.text),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 16,
                          color: riskCategories3DData.map(d => d.color),
                          line: { color: 'white', width: 2 },
                          symbol: 'square'
                        },
                        name: 'Risk Score',
                        showlegend: true
                      },
                      ...riskCategories3DData.map((d) => ({
                        type: 'scatter3d',
                        mode: 'lines',
                        x: [d.x, d.x],
                        y: [0, 0],
                        z: [0, d.z],
                        line: { color: d.color, width: 12 },
                        showlegend: false,
                        hoverinfo: 'skip'
                      }))
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { 
                          title: 'Category', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: riskCategories3DData.map(d => d.x),
                          ticktext: riskCategories3DData.map(d => d.category),
                          tickfont: { color: 'white' }
                        },
                        yaxis: { title: 'Y', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        zaxis: { title: 'Risk Score (%)', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        camera: { eye: { x: 1.8, y: 1.8, z: 1.8 } }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0, 0, 0, 0.7)', bordercolor: 'rgba(255, 255, 255, 0.5)', borderwidth: 2, font: { color: 'white', size: 12 } }
                    }}
                    config={{ displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['pan2d', 'lasso2d'], responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Risk Categories...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Fraud Detection Analysis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 rounded-2xl shadow-2xl p-4 border border-red-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-red-400" />
                3D Fraud Detection Analysis
              </h3>
              <p className="text-xs text-red-200 mb-2">Interactive 3D visualization of fraud detection metrics</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {mounted && fraudDetection3DData && fraudDetection3DData.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: fraudDetection3DData.map(d => d.x),
                        y: fraudDetection3DData.map(d => d.y),
                        z: fraudDetection3DData.map(d => d.z),
                        text: fraudDetection3DData.map(d => d.text),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 14,
                          color: fraudDetection3DData.map(d => d.color),
                          line: { color: 'white', width: 2 },
                          symbol: 'square'
                        },
                        name: 'Detected',
                        showlegend: true
                      },
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: fraudDetection3DData.map(d => d.x),
                        y: fraudDetection3DData.map(d => d.y + 1),
                        z: fraudDetection3DData.map(d => d.prevented),
                        text: fraudDetection3DData.map(d => `${d.type}<br>Prevented: ${d.prevented}<br>Amount: $${(d.amount / 1000).toFixed(2)}K`),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 14,
                          color: fraudDetection3DData.map(d => d.color),
                          line: { color: 'white', width: 2 },
                          symbol: 'diamond'
                        },
                        name: 'Prevented',
                        showlegend: true
                      },
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: fraudDetection3DData.map(d => d.x),
                        y: fraudDetection3DData.map(d => d.y + 0.5),
                        z: fraudDetection3DData.map(d => d.amount / 1000),
                        text: fraudDetection3DData.map(d => `${d.type}<br>Amount: $${(d.amount / 1000).toFixed(2)}K`),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        line: { color: '#8B5CF6', width: 8 },
                        marker: { size: 10, color: '#8B5CF6', line: { color: 'white', width: 2 }, symbol: 'circle' },
                        name: 'Amount ($K)',
                        showlegend: true
                      },
                      ...fraudDetection3DData.flatMap((d) => [
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [d.x, d.x],
                          y: [0, 0],
                          z: [0, d.z],
                          line: { color: d.color, width: 10 },
                          showlegend: false,
                          hoverinfo: 'skip'
                        },
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [d.x, d.x],
                          y: [1, 1],
                          z: [0, d.prevented],
                          line: { color: d.color, width: 10 },
                          showlegend: false,
                          hoverinfo: 'skip'
                        }
                      ])
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { 
                          title: 'Fraud Type', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: fraudDetection3DData.map(d => d.x),
                          ticktext: fraudDetection3DData.map(d => d.type),
                          tickfont: { color: 'white' }
                        },
                        yaxis: { 
                          title: 'Metric', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: [0, 0.5, 1],
                          ticktext: ['Detected', 'Amount', 'Prevented'],
                          tickfont: { color: 'white' }
                        },
                        zaxis: { title: 'Value', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        camera: { eye: { x: 1.8, y: 1.8, z: 1.8 } }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0, 0, 0, 0.7)', bordercolor: 'rgba(255, 255, 255, 0.5)', borderwidth: 2, font: { color: 'white', size: 12 } }
                    }}
                    config={{ displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['pan2d', 'lasso2d'], responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Fraud Detection...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Risk Heatmap (Probability vs Impact) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 rounded-2xl shadow-2xl p-4 border border-amber-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-yellow-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-amber-400" />
                3D Risk Heatmap (Probability vs Impact)
              </h3>
              <p className="text-xs text-amber-200 mb-2">Interactive 3D heatmap showing risk probability, impact, and score</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {mounted && riskHeatmap3DData && riskHeatmap3DData.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: riskHeatmap3DData.map(d => d.x),
                        y: riskHeatmap3DData.map(d => d.y),
                        z: riskHeatmap3DData.map(d => d.z),
                        text: riskHeatmap3DData.map(d => d.text),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: riskHeatmap3DData.map(d => Math.max(12, Math.min(24, d.z * 0.3))),
                          color: riskHeatmap3DData.map(d => d.z),
                          colorscale: 'Viridis',
                          showscale: true,
                          colorbar: {
                            title: 'Risk Score',
                            titlefont: { color: 'white' },
                            tickfont: { color: 'white' }
                          },
                          line: { color: 'white', width: 2 }
                        },
                        name: 'Risk Score',
                        showlegend: true
                      }
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { title: 'Probability (%)', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' }, range: [0, 100] },
                        yaxis: { title: 'Impact (%)', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' }, range: [0, 100] },
                        zaxis: { title: 'Risk Score', titlefont: { color: 'white' }, color: 'white', tickfont: { color: 'white' } },
                        camera: { eye: { x: 1.8, y: 1.8, z: 1.8 } }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0, 0, 0, 0.7)', bordercolor: 'rgba(255, 255, 255, 0.5)', borderwidth: 2, font: { color: 'white', size: 12 } }
                    }}
                    config={{ displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['pan2d', 'lasso2d'], responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Risk Heatmap...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Critical Alerts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Critical Risk Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alert ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiData.criticalAlerts?.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.amount > 0 ? `$${new Intl.NumberFormat().format(alert.amount)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Risk Mitigation Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Risk Mitigation Strategies</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {apiData.mitigationStrategies?.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{strategy.strategy}</h4>
                    <p className="text-sm text-gray-500">Effectiveness: {strategy.effectiveness}% | Cost: ${new Intl.NumberFormat().format(strategy.cost)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      strategy.implementation === 'Completed' ? 'bg-green-100 text-green-800' :
                      strategy.implementation === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {strategy.implementation}
                    </span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${strategy.effectiveness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={generateRiskReport}
              disabled={isGeneratingReport}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {isGeneratingReport ? 'Generating...' : 'Generate Risk Report'}
                </p>
                <p className="text-sm text-gray-500">
                  {isGeneratingReport ? 'Creating detailed report...' : 'Create comprehensive risk assessment'}
                </p>
              </div>
            </button>
            <Link
              href="/chatbot"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">AI Risk Assistant</p>
                <p className="text-sm text-gray-500">Ask questions about risks</p>
              </div>
            </Link>
            <Link
              href="/compliance"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            >
              <ShieldExclamationIcon className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Compliance Report</p>
                <p className="text-sm text-gray-500">View compliance status</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
