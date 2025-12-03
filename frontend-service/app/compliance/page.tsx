'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Sample compliance data
const complianceData = {
  regulatoryCompliance: [
    { regulation: 'SOX', compliance: 95, risk: 5, lastAudit: '2024-01-15' },
    { regulation: 'GDPR', compliance: 88, risk: 12, lastAudit: '2024-01-10' },
    { regulation: 'PCI DSS', compliance: 92, risk: 8, lastAudit: '2024-01-12' },
    { regulation: 'HIPAA', compliance: 90, risk: 10, lastAudit: '2024-01-08' },
    { regulation: 'ISO 27001', compliance: 94, risk: 6, lastAudit: '2024-01-14' },
    { regulation: 'Basel III', compliance: 87, risk: 13, lastAudit: '2024-01-11' }
  ],
  auditTimeline: [
    { month: 'Jan', audits: 12, findings: 3, resolved: 2 },
    { month: 'Feb', audits: 15, findings: 5, resolved: 4 },
    { month: 'Mar', audits: 18, findings: 4, resolved: 6 },
    { month: 'Apr', audits: 14, findings: 2, resolved: 5 },
    { month: 'May', audits: 16, findings: 6, resolved: 7 },
    { month: 'Jun', audits: 20, findings: 3, resolved: 8 }
  ],
  complianceStatus: [
    { status: 'Fully Compliant', count: 45, color: '#10B981' },
    { status: 'Minor Issues', count: 12, color: '#F59E0B' },
    { status: 'Major Issues', count: 3, color: '#EF4444' },
    { status: 'Under Review', count: 8, color: '#3B82F6' }
  ],
  riskAreas: [
    { area: 'Data Security', score: 85, trend: 'up' },
    { area: 'Access Control', score: 78, trend: 'down' },
    { area: 'Process Compliance', score: 92, trend: 'up' },
    { area: 'Documentation', score: 88, trend: 'up' },
    { area: 'Training', score: 75, trend: 'down' },
    { area: 'Monitoring', score: 90, trend: 'up' }
  ],
  recentAudits: [
    { id: 'AUD001', type: 'Internal', status: 'Completed', findings: 2, date: '2024-01-15', auditor: 'John Smith' },
    { id: 'AUD002', type: 'External', status: 'In Progress', findings: 0, date: '2024-01-14', auditor: 'ABC Audit Firm' },
    { id: 'AUD003', type: 'Regulatory', status: 'Completed', findings: 1, date: '2024-01-12', auditor: 'Regulatory Body' },
    { id: 'AUD004', type: 'Internal', status: 'Scheduled', findings: 0, date: '2024-01-20', auditor: 'Jane Doe' },
    { id: 'AUD005', type: 'External', status: 'Completed', findings: 3, date: '2024-01-10', auditor: 'XYZ Compliance' }
  ],
  complianceKPIs: {
    overallCompliance: 89,
    auditCompletion: 95,
    findingResolution: 78,
    trainingCompletion: 85
  }
};

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];

export default function ComplianceDashboard() {
  // Initialize with sample data so everything shows immediately
  const [isLoading, setIsLoading] = useState(false);
  const [complianceMetrics, setComplianceMetrics] = useState(complianceData.complianceKPIs);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [apiData, setApiData] = useState({
    regulatoryOverview: complianceData.regulatoryCompliance,
    statusDistribution: complianceData.complianceStatus,
    auditTimeline: complianceData.auditTimeline,
    riskAreas: complianceData.riskAreas,
    recentAudits: complianceData.recentAudits
  });

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        // Don't set loading to true - show sample data immediately
        // Fetch data from API endpoints with error handling
        const [kpisRes, regulatoryRes, statusRes, timelineRes, riskRes, auditsRes] = await Promise.allSettled([
          fetch('http://localhost:3000/api/compliance/kpis?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/compliance/regulatory-overview?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/compliance/status-distribution?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/compliance/audit-timeline?environment=dev&months=6').catch(() => null),
          fetch('http://localhost:3000/api/compliance/risk-areas?environment=dev').catch(() => null),
          fetch('http://localhost:3000/api/compliance/recent-audits?environment=dev&limit=5').catch(() => null)
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
        const kpis = await processResponse(kpisRes, complianceData.complianceKPIs);
        const regulatory = await processResponse(regulatoryRes, complianceData.regulatoryCompliance);
        const status = await processResponse(statusRes, complianceData.complianceStatus);
        const timeline = await processResponse(timelineRes, complianceData.auditTimeline);
        const risk = await processResponse(riskRes, complianceData.riskAreas);
        const audits = await processResponse(auditsRes, complianceData.recentAudits);

        // Only update if we got real data, otherwise keep sample data
        if (kpis && kpis !== complianceData.complianceKPIs) {
          setComplianceMetrics(kpis);
        }
        if (regulatory && regulatory !== complianceData.regulatoryCompliance) {
          setApiData(prev => ({ ...prev, regulatoryOverview: regulatory }));
        }
        if (status && status !== complianceData.complianceStatus) {
          setApiData(prev => ({ ...prev, statusDistribution: status }));
        }
        if (timeline && timeline !== complianceData.auditTimeline) {
          setApiData(prev => ({ ...prev, auditTimeline: timeline }));
        }
        if (risk && risk !== complianceData.riskAreas) {
          setApiData(prev => ({ ...prev, riskAreas: risk }));
        }
        if (audits && audits !== complianceData.recentAudits) {
          setApiData(prev => ({ ...prev, recentAudits: audits }));
        }
      } catch (error) {
        console.warn('Error fetching compliance data, using sample data:', error);
        // Keep using sample data if API fails
      }
    };

    fetchComplianceData();
  }, []);

  const generateComplianceReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock report download
      const reportContent = `
        <html>
          <head><title>Compliance Report - ${new Date().toLocaleDateString()}</title></head>
          <body>
            <h1>Compliance Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <h2>Overall Compliance: ${complianceMetrics.overallCompliance}%</h2>
            <h2>Audit Completion: ${complianceMetrics.auditCompletion}%</h2>
            <h2>Finding Resolution: ${complianceMetrics.findingResolution}%</h2>
            <h2>Training Completion: ${complianceMetrics.trainingCompletion}%</h2>
          </body>
        </html>
      `;
      
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Compliance_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      alert('Failed to generate compliance report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const KpiCard = ({ title, value, icon: Icon, color, format = 'percentage' }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    format?: 'percentage' | 'number';
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
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Compliance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Compliance Report Dashboard
                </h1>
                <p className="text-sm text-green-600 font-medium">Regulatory Compliance & Audit Management</p>
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
                href="/risk-assessment"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Risk Assessment</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Overall Compliance"
            value={complianceMetrics.overallCompliance}
            icon={ShieldCheckIcon}
            color="bg-green-500"
            format="percentage"
          />
          <KpiCard
            title="Audit Completion"
            value={complianceMetrics.auditCompletion}
            icon={DocumentIcon}
            color="bg-blue-500"
            format="percentage"
          />
          <KpiCard
            title="Finding Resolution"
            value={complianceMetrics.findingResolution}
            icon={CheckCircleIcon}
            color="bg-purple-500"
            format="percentage"
          />
          <KpiCard
            title="Training Completion"
            value={complianceMetrics.trainingCompletion}
            icon={UserGroupIcon}
            color="bg-orange-500"
            format="percentage"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Regulatory Compliance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Compliance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={apiData.regulatoryOverview}>
                <PolarGrid />
                <PolarAngleAxis dataKey="regulation" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Compliance" dataKey="compliance" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Radar name="Risk" dataKey="risk" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Compliance Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={apiData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {apiData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Audit Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Timeline & Findings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={apiData.auditTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="audits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="findings" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Risk Areas Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Areas Assessment</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiData.riskAreas} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="area" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Audits Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Audits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiData.recentAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {audit.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {audit.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        audit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        audit.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {audit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.findings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {audit.auditor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {audit.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={generateComplianceReport}
              disabled={isGeneratingReport}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {isGeneratingReport ? 'Generating...' : 'Generate Compliance Report'}
                </p>
                <p className="text-sm text-gray-500">
                  {isGeneratingReport ? 'Creating detailed report...' : 'Create comprehensive compliance report'}
                </p>
              </div>
            </button>
            <Link
              href="/chatbot"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">AI Compliance Assistant</p>
                <p className="text-sm text-gray-500">Ask questions about compliance</p>
              </div>
            </Link>
            <Link
              href="/risk-assessment"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Risk Assessment</p>
                <p className="text-sm text-gray-500">Analyze compliance risks</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
