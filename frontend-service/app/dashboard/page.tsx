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
  ComposedChart
} from 'recharts';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowLeftIcon,
  CalculatorIcon,
  ArrowPathIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Sample financial data for demonstration
const sampleData = {
  revenue: [
    { month: 'Jan', revenue: 2400000, profit: 480000 },
    { month: 'Feb', revenue: 2200000, profit: 440000 },
    { month: 'Mar', revenue: 2800000, profit: 560000 },
    { month: 'Apr', revenue: 2600000, profit: 520000 },
    { month: 'May', revenue: 3000000, profit: 600000 },
    { month: 'Jun', revenue: 3200000, profit: 640000 }
  ],
  expenses: [
    { category: 'Salaries', amount: 1200000, percentage: 40 },
    { category: 'Operations', amount: 600000, percentage: 20 },
    { category: 'Marketing', amount: 450000, percentage: 15 },
    { category: 'Technology', amount: 300000, percentage: 10 },
    { category: 'Other', amount: 450000, percentage: 15 }
  ],
  customers: [
    { region: 'North America', customers: 1200, revenue: 1800000 },
    { region: 'Europe', customers: 800, revenue: 1200000 },
    { region: 'Asia Pacific', customers: 600, revenue: 900000 },
    { region: 'Latin America', customers: 300, revenue: 450000 }
  ],
  compliance: [
    { status: 'Compliant', count: 85, color: '#10B981' },
    { status: 'Pending Review', count: 12, color: '#F59E0B' },
    { status: 'Non-Compliant', count: 3, color: '#EF4444' }
  ],
  transactions: [
    { id: 'TXN001', type: 'Payment', amount: 50000, status: 'Completed', date: '2024-01-15' },
    { id: 'TXN002', type: 'Invoice', amount: 75000, status: 'Pending', date: '2024-01-14' },
    { id: 'TXN003', type: 'Refund', amount: 25000, status: 'Completed', date: '2024-01-13' },
    { id: 'TXN004', type: 'Payment', amount: 100000, status: 'Completed', date: '2024-01-12' },
    { id: 'TXN005', type: 'Invoice', amount: 60000, status: 'Overdue', date: '2024-01-10' }
  ],
  transactionVolume: [
    { month: 'Jan', volume: 450, amount: 2400000 },
    { month: 'Feb', volume: 420, amount: 2200000 },
    { month: 'Mar', volume: 510, amount: 2800000 },
    { month: 'Apr', volume: 480, amount: 2600000 },
    { month: 'May', volume: 550, amount: 3000000 },
    { month: 'Jun', volume: 580, amount: 3200000 }
  ],
  profitMargin: [
    { month: 'Jan', margin: 20.0, target: 22.0 },
    { month: 'Feb', margin: 20.0, target: 22.0 },
    { month: 'Mar', margin: 20.0, target: 22.0 },
    { month: 'Apr', margin: 20.0, target: 22.0 },
    { month: 'May', margin: 20.0, target: 22.0 },
    { month: 'Jun', margin: 20.0, target: 22.0 }
  ],
  transactionTypes: [
    { type: 'Payment', count: 1250, amount: 8500000, percentage: 45 },
    { type: 'Invoice', count: 980, amount: 6200000, percentage: 33 },
    { type: 'Refund', count: 320, amount: 1800000, percentage: 10 },
    { type: 'Transfer', count: 450, amount: 2200000, percentage: 12 }
  ],
  cashFlow: [
    { month: 'Jan', inflow: 2400000, outflow: 1920000, net: 480000 },
    { month: 'Feb', inflow: 2200000, outflow: 1760000, net: 440000 },
    { month: 'Mar', inflow: 2800000, outflow: 2240000, net: 560000 },
    { month: 'Apr', inflow: 2600000, outflow: 2080000, net: 520000 },
    { month: 'May', inflow: 3000000, outflow: 2400000, net: 600000 },
    { month: 'Jun', inflow: 3200000, outflow: 2560000, net: 640000 }
  ],
  monthlyGrowth: [
    { month: 'Jan', revenue: 2400000, growth: 0 },
    { month: 'Feb', revenue: 2200000, growth: -8.3 },
    { month: 'Mar', revenue: 2800000, growth: 27.3 },
    { month: 'Apr', revenue: 2600000, growth: -7.1 },
    { month: 'May', revenue: 3000000, growth: 15.4 },
    { month: 'Jun', revenue: 3200000, growth: 6.7 }
  ],
  // 3D data for surface charts
  revenue3D: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    categories: ['Revenue', 'Profit', 'Expenses'],
    data: [
      [2400000, 480000, 1920000],
      [2200000, 440000, 1760000],
      [2800000, 560000, 2240000],
      [2600000, 520000, 2080000],
      [3000000, 600000, 2400000],
      [3200000, 640000, 2560000]
    ]
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 18200000,
    totalCustomers: 1200,
    pendingTransactions: 12,
    complianceRate: 85,
    profitMargin: 20.0,
    avgTransactionValue: 15167,
    growthRate: 6.7,
    totalTransactions: 3000
  });
  // Initialize with sample data so charts show immediately
  const [chartData, setChartData] = useState({
    revenueTrends: sampleData.revenue,
    expenseBreakdown: sampleData.expenses,
    customerDistribution: sampleData.customers,
    recentTransactions: sampleData.transactions,
    complianceStatus: sampleData.compliance,
    transactionVolume: sampleData.transactionVolume,
    profitMargin: sampleData.profitMargin,
    transactionTypes: sampleData.transactionTypes,
    cashFlow: sampleData.cashFlow,
    monthlyGrowth: sampleData.monthlyGrowth,
    revenue3D: sampleData.revenue3D
  });

  // Prepare 3D surface chart data for Financial Overview
  const surface3DData = useMemo(() => {
    const { months, categories, data } = chartData.revenue3D;
    return {
      x: months,
      y: categories,
      z: data.map(row => row.map(val => val / 1000000)) // Convert to millions for better visualization
    };
  }, [chartData.revenue3D]);

  // Prepare 3D data for Revenue & Profit Trends
  const revenueProfit3DData = useMemo(() => {
    // Always use sample data to ensure chart renders
    const dataSource = chartData.revenueTrends && chartData.revenueTrends.length > 0 
      ? chartData.revenueTrends 
      : sampleData.revenue;
    
    const months = dataSource.map(item => item.month);
    const revenueData = dataSource.map(item => (item.revenue || 0) / 1000000); // Convert to millions
    const profitData = dataSource.map(item => (item.profit || 0) / 1000000); // Convert to millions
    
    return {
      months,
      revenueData,
      profitData
    };
  }, [chartData.revenueTrends]);

  // Prepare 3D scatter plot data for transaction analysis
  const scatter3DData = useMemo(() => {
    return chartData.transactionVolume.map((item, idx) => ({
      x: idx,
      y: item.volume,
      z: item.amount / 1000000,
      month: item.month,
      text: `${item.month}<br>Volume: ${item.volume}<br>Amount: $${(item.amount / 1000000).toFixed(2)}M`
    }));
  }, [chartData.transactionVolume]);

  // Prepare 3D surface data for Monthly Revenue Growth Rate
  const growth3DData = useMemo(() => {
    const months = chartData.monthlyGrowth.map(item => item.month);
    const revenueData = chartData.monthlyGrowth.map(item => item.revenue / 1000000); // Convert to millions
    const growthData = chartData.monthlyGrowth.map(item => item.growth); // Growth percentage
    
    // For surface plots, z must be a 2D array: z[i][j] where i is y-index and j is x-index
    // We'll create two surfaces side by side by using different y positions
    // Revenue surface at y=0, Growth surface at y=1
    const revenueSurface = revenueData.map(val => [val]); // Each row has one value (single column)
    const growthSurface = growthData.map(val => [val]); // Each row has one value (single column)
    
    // For proper surface display, we need to expand the data to create a visible surface
    // Create a small width surface by duplicating values slightly
    const revenueSurface2D = revenueData.map(val => [val * 0.95, val, val * 0.95]); // Create width
    const growthSurface2D = growthData.map(val => [val * 0.95, val, val * 0.95]); // Create width
    
    return {
      months,
      revenueData,
      growthData,
      revenueSurface: revenueSurface2D,
      growthSurface: growthSurface2D,
      revenueY: [0, 0.5, 1], // Y positions for revenue surface width
      growthY: [2, 2.5, 3] // Y positions for growth surface width (offset from revenue)
    };
  }, [chartData.monthlyGrowth]);

  // Prepare 3D data for Recent Transactions visualization
  const recentTransactions3DData = useMemo(() => {
    const transactions = chartData.recentTransactions || [];
    const typeMap: { [key: string]: number } = {
      'Payment': 0,
      'Transfer': 1,
      'Deposit': 2,
      'Withdrawal': 3,
      'Trade': 4,
      'Refund': 5,
      'Fee': 6
    };
    
    return transactions.map((transaction, idx) => {
      const typeValue = typeMap[transaction.type] !== undefined ? typeMap[transaction.type] : 0;
      const statusValue = transaction.status === 'Completed' ? 1 : transaction.status === 'Pending' ? 0.5 : 0;
      
      return {
        x: idx, // Transaction index
        y: transaction.amount / 1000, // Amount in thousands
        z: typeValue, // Transaction type as numeric
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        id: transaction.id,
        text: `${transaction.id}<br>Type: ${transaction.type}<br>Amount: $${(transaction.amount / 1000).toFixed(2)}K<br>Status: ${transaction.status}`
      };
    });
  }, [chartData.recentTransactions]);

  // Prepare 3D data for Transaction Types Distribution
  const transactionTypes3DData = useMemo(() => {
    const transactionTypes = chartData.transactionTypes || [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    
    return transactionTypes.map((item, idx) => ({
      x: idx, // Transaction type index
      y: 0, // Base position for count
      z: item.count, // Count as height
      type: item.type,
      count: item.count,
      amount: item.amount,
      percentage: item.percentage,
      color: colors[idx % colors.length],
      text: `${item.type}<br>Count: ${item.count}<br>Amount: $${(item.amount / 1000).toFixed(2)}K<br>Percentage: ${item.percentage}%`
    }));
  }, [chartData.transactionTypes]);

  // Prepare 3D data for Cash Flow Analysis (Flowing Ribbon Chart)
  const cashFlow3DData = useMemo(() => {
    const cashFlow = chartData.cashFlow || [];
    const months = cashFlow.map(item => item.month);
    const inflowData = cashFlow.map(item => item.inflow / 1000); // Convert to thousands
    const outflowData = cashFlow.map(item => item.outflow / 1000); // Convert to thousands
    const netData = cashFlow.map(item => item.net / 1000); // Convert to thousands
    
    // Create ribbon surfaces for inflow and outflow
    const ribbonWidth = 0.3;
    
    // Inflow ribbon (green, at y = 1)
    const inflowRibbon = {
      x: months,
      y: Array(months.length).fill(1),
      z: inflowData,
      name: 'Cash Inflow',
      color: '#10B981'
    };
    
    // Outflow ribbon (red, at y = 0)
    const outflowRibbon = {
      x: months,
      y: Array(months.length).fill(0),
      z: outflowData,
      name: 'Cash Outflow',
      color: '#EF4444'
    };
    
    // Net cash flow line (blue, at y = 0.5)
    const netLine = {
      x: months,
      y: Array(months.length).fill(0.5),
      z: netData,
      name: 'Net Cash Flow',
      color: '#3B82F6'
    };
    
    return {
      months,
      inflowRibbon,
      outflowRibbon,
      netLine,
      inflowData,
      outflowData,
      netData
    };
  }, [chartData.cashFlow]);

  // Prepare 3D data for Expense Breakdown visualization (3D Pie Chart)
  const expenseBreakdown3DData = useMemo(() => {
    const expenses = chartData.expenseBreakdown || [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    
    // Calculate cumulative angles for pie slices
    let currentAngle = -Math.PI / 2; // Start from top
    
    const pieSlices = expenses.map((expense, idx) => {
      const sliceAngle = (expense.percentage / 100) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      
      // Create a 3D pie slice using surface plot
      const numPoints = 20; // Points along the arc for smooth curve
      const radius = 3; // Base radius
      const height = 1; // Fixed height for pie chart appearance
      
      // Generate points for the pie slice
      const x: number[] = [];
      const y: number[] = [];
      const z: number[] = [];
      
      // Center point (bottom)
      x.push(0);
      y.push(0);
      z.push(0);
      
      // Arc points (bottom)
      for (let i = 0; i <= numPoints; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / numPoints);
        x.push(Math.cos(angle) * radius);
        y.push(Math.sin(angle) * radius);
        z.push(0);
      }
      
      // Center point (top)
      x.push(0);
      y.push(0);
      z.push(height);
      
      // Arc points (top)
      for (let i = 0; i <= numPoints; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / numPoints);
        x.push(Math.cos(angle) * radius);
        y.push(Math.sin(angle) * radius);
        z.push(height);
      }
      
      // Create mesh indices for the pie slice
      const i: number[] = [];
      const j: number[] = [];
      const k: number[] = [];
      
      const bottomCenter = 0;
      const topCenter = numPoints + 2;
      const bottomArcStart = 1;
      const topArcStart = numPoints + 3;
      
      // Bottom face (fan from center)
      for (let p = 0; p < numPoints; p++) {
        i.push(bottomCenter);
        j.push(bottomArcStart + p);
        k.push(bottomArcStart + p + 1);
      }
      
      // Top face (fan from center)
      for (let p = 0; p < numPoints; p++) {
        i.push(topCenter);
        j.push(topArcStart + p + 1);
        k.push(topArcStart + p);
      }
      
      // Side faces (walls of the slice)
      for (let p = 0; p < numPoints; p++) {
        const b1 = bottomArcStart + p;
        const b2 = bottomArcStart + p + 1;
        const t1 = topArcStart + p;
        const t2 = topArcStart + p + 1;
        
        // First triangle
        i.push(b1);
        j.push(b2);
        k.push(t1);
        
        // Second triangle
        i.push(b2);
        j.push(t2);
        k.push(t1);
      }
      
      // Close the slice (connect first and last arc points)
      const lastBottom = bottomArcStart + numPoints;
      const firstTop = topArcStart;
      i.push(bottomArcStart);
      j.push(lastBottom);
      k.push(firstTop);
      
      i.push(lastBottom);
      j.push(topArcStart + numPoints);
      k.push(firstTop);
      
      return {
        x,
        y,
        z,
        i,
        j,
        k,
        category: expense.category,
        amount: expense.amount,
        percentage: expense.percentage,
        color: colors[idx % colors.length],
        startAngle,
        endAngle,
        text: `${expense.category}<br>Amount: $${(expense.amount / 1000).toFixed(2)}K<br>Percentage: ${expense.percentage}%`
      };
    });
    
    return pieSlices;
  }, [chartData.expenseBreakdown]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let hasData = false;
        
        // Fetch KPIs
        try {
          const kpiResponse = await fetch('http://localhost:3000/api/compliance/kpis?environment=dev');
          const kpiResult = await kpiResponse.json();
          
          if (kpiResult.success && kpiResult.data) {
            const kpis = kpiResult.data;
            const metadata = kpiResult.metadata || {};
            
            // Calculate total revenue from journal entries
            try {
              const journalResponse = await fetch('http://localhost:3000/api/transactional/journal-entries?source=mongodb&limit=100');
              const journalResult = await journalResponse.json();
              let totalRevenue = 0;
              if (journalResult.success && journalResult.data && journalResult.data.length > 0) {
                hasData = true;
                totalRevenue = journalResult.data.reduce((sum: number, entry: any) => {
                  return sum + (parseFloat(entry.amount) || parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0);
                }, 0);
              }
              
              // Get customer count
              const totalCustomers = metadata.totalKycFiles || (hasData ? 0 : 50);
              
              // Calculate pending transactions
              try {
                const paymentsResponse = await fetch('http://localhost:3000/api/transactional/payments?source=mongodb&limit=100');
                const paymentsResult = await paymentsResponse.json();
                let pendingTransactions = 0;
                if (paymentsResult.success && paymentsResult.data && paymentsResult.data.length > 0) {
                  pendingTransactions = paymentsResult.data.filter((p: any) => 
                    p.status === 'pending' || p.status === 'processing'
                  ).length;
                }
                
          setKpiData({
            totalRevenue: totalRevenue || (hasData ? 0 : 18200000), // Use sample data if no real data
            totalCustomers: totalCustomers || (hasData ? 0 : 1200),
            pendingTransactions: pendingTransactions || (hasData ? 0 : 12),
            complianceRate: kpis.overallCompliance || (hasData ? 0 : 85),
            profitMargin: 20.0, // Sample data
            avgTransactionValue: 15167, // Sample data
            growthRate: 6.7, // Sample data
            totalTransactions: 3000 // Sample data
          });
              } catch (error) {
                console.warn('Error fetching payments:', error);
                setKpiData({
                  totalRevenue: totalRevenue || 18200000,
                  totalCustomers: totalCustomers || 1200,
                  pendingTransactions: 12,
                  complianceRate: kpis.overallCompliance || 85,
                  profitMargin: 20.0,
                  avgTransactionValue: 15167,
                  growthRate: 6.7,
                  totalTransactions: 3000
                });
              }
            } catch (error) {
              console.warn('Error fetching journal entries:', error);
              // Use sample data
              setKpiData({
                totalRevenue: 18200000,
                totalCustomers: metadata.totalKycFiles || 1200,
                pendingTransactions: 12,
                complianceRate: kpis.overallCompliance || 85,
                profitMargin: 20.0,
                avgTransactionValue: 15167,
                growthRate: 6.7,
                totalTransactions: 3000
              });
            }
          } else {
            // API returned but no data - use sample data
            setKpiData({
              totalRevenue: 18200000,
              totalCustomers: 1200,
              pendingTransactions: 12,
              complianceRate: 85,
              profitMargin: 20.0,
              avgTransactionValue: 15167,
              growthRate: 6.7,
              totalTransactions: 3000
            });
          }
        } catch (error) {
          console.warn('Error fetching KPIs, using sample data:', error);
          // Use sample data when API fails
          setKpiData({
            totalRevenue: 18200000,
            totalCustomers: 1200,
            pendingTransactions: 12,
            complianceRate: 85,
            profitMargin: 20.0,
            avgTransactionValue: 15167,
            growthRate: 6.7,
            totalTransactions: 3000
          });
        }

        // Fetch revenue trends (using journal entries) - transform to chart format
        try {
          const revenueResponse = await fetch('http://localhost:3000/api/transactional/journal-entries?source=mongodb&limit=50');
          const revenueResult = await revenueResponse.json();
          
          if (revenueResult.success && revenueResult.data && revenueResult.data.length > 0) {
            // Group by month and calculate totals
            const monthlyData: { [key: string]: { revenue: number; profit: number } } = {};
            revenueResult.data.forEach((entry: any) => {
              const date = new Date(entry.date || entry.transactionDate || entry.createdDate);
              const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
              const amount = parseFloat(entry.amount) || parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
              
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { revenue: 0, profit: 0 };
              }
              monthlyData[monthKey].revenue += amount;
              monthlyData[monthKey].profit += amount * 0.2; // Assume 20% profit margin
            });
            
            const revenueTrends = Object.entries(monthlyData).map(([month, data]) => ({
              month,
              revenue: Math.round(data.revenue),
              profit: Math.round(data.profit)
            }));
            
            setChartData(prev => ({ ...prev, revenueTrends }));
          } else {
            // Use sample data
            setChartData(prev => ({ ...prev, revenueTrends: sampleData.revenue }));
          }
        } catch (error) {
          console.warn('Error fetching revenue trends, using sample data:', error);
          setChartData(prev => ({ ...prev, revenueTrends: sampleData.revenue }));
        }

        // Fetch expense breakdown (using payments) - transform to chart format
        try {
          const expenseResponse = await fetch('http://localhost:3000/api/transactional/payments?source=mongodb&limit=50');
          const expenseResult = await expenseResponse.json();
          
          if (expenseResult.success && expenseResult.data && expenseResult.data.length > 0) {
            // Group by payment method/category
            const categoryData: { [key: string]: number } = {};
            expenseResult.data.forEach((payment: any) => {
              const category = payment.paymentMethod || payment.description?.split(' - ')[1] || 'Other';
              const amount = parseFloat(payment.amount) || 0;
              categoryData[category] = (categoryData[category] || 0) + amount;
            });
            
            const total = Object.values(categoryData).reduce((sum: number, val: number) => sum + val, 0);
            const expenseBreakdown = Object.entries(categoryData).map(([category, amount]) => ({
              category,
              amount: Math.round(amount as number),
              percentage: Math.round(((amount as number) / total) * 100)
            }));
            
            setChartData(prev => ({ ...prev, expenseBreakdown }));
          } else {
            // Use sample data
            setChartData(prev => ({ ...prev, expenseBreakdown: sampleData.expenses }));
          }
        } catch (error) {
          console.warn('Error fetching expense breakdown, using sample data:', error);
          setChartData(prev => ({ ...prev, expenseBreakdown: sampleData.expenses }));
        }

        // Fetch customer distribution (using regulatory overview)
        try {
          const customerDistResponse = await fetch('http://localhost:3000/api/compliance/regulatory-overview?environment=dev');
          const customerDistResult = await customerDistResponse.json();
          
          if (customerDistResult.success && customerDistResult.data && customerDistResult.data.length > 0) {
            // Transform regulatory data to customer distribution format
            const customerDistribution = customerDistResult.data.map((reg: any, idx: number) => ({
              region: reg.regulation || `Region ${idx + 1}`,
              customers: Math.round(reg.total * 10) || Math.floor(Math.random() * 900) + 100,
              revenue: Math.round((reg.total * 10) * 1500) || Math.floor(Math.random() * 1900000) + 100000
            }));
            
            setChartData(prev => ({ ...prev, customerDistribution }));
          } else {
            // Use sample data
            setChartData(prev => ({ ...prev, customerDistribution: sampleData.customers }));
          }
        } catch (error) {
          console.warn('Error fetching customer distribution, using sample data:', error);
          setChartData(prev => ({ ...prev, customerDistribution: sampleData.customers }));
        }

        // Fetch recent transactions (using trades) - transform to table format
        try {
          const transactionResponse = await fetch('http://localhost:3000/api/transactional/trades?source=mongodb&limit=10');
          const transactionResult = await transactionResponse.json();
          
          if (transactionResult.success && transactionResult.data && transactionResult.data.length > 0) {
            const recentTransactions = transactionResult.data.map((trade: any, idx: number) => ({
              id: trade.reference || `TXN${String(1000 + idx).padStart(3, '0')}`,
              type: trade.instrumentType || trade.instrument_type || 'Trade',
              amount: Math.round(parseFloat(trade.amount) || parseFloat(trade.price) * (trade.quantity || 1) || 0),
              status: trade.status === 'executed' ? 'Completed' : 
                     trade.status === 'pending' ? 'Pending' : 
                     trade.status === 'cancelled' ? 'Cancelled' : 'Completed',
              date: new Date(trade.date || trade.transactionDate || trade.createdDate).toLocaleDateString()
            }));
            
            setChartData(prev => ({ ...prev, recentTransactions }));
          } else {
            // Use sample data
            setChartData(prev => ({ ...prev, recentTransactions: sampleData.transactions }));
          }
        } catch (error) {
          console.warn('Error fetching transactions, using sample data:', error);
          setChartData(prev => ({ ...prev, recentTransactions: sampleData.transactions }));
        }

        // Fetch compliance status - transform to chart format
        try {
          const complianceResponse = await fetch('http://localhost:3000/api/compliance/status-distribution?environment=dev');
          const complianceResult = await complianceResponse.json();
          
          if (complianceResult.success && complianceResult.data && complianceResult.data.length > 0) {
            const complianceStatus = complianceResult.data.map((item: any) => ({
              status: item.status,
              count: item.count,
              color: item.color
            }));
            
            setChartData(prev => ({ ...prev, complianceStatus }));
          } else {
            // Use sample data
            setChartData(prev => ({ ...prev, complianceStatus: sampleData.compliance }));
          }
        } catch (error) {
          console.warn('Error fetching compliance status, using sample data:', error);
          setChartData(prev => ({ ...prev, complianceStatus: sampleData.compliance }));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateComplianceReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch('http://localhost:3000/api/compliance/regulatory-overview');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Compliance_Report_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating compliance report:', error);
      alert('Failed to generate compliance report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const KpiCard = ({ title, value, change, icon: Icon, color, format = 'number' }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    color: string;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      // Handle undefined, null, or NaN values
      if (val === undefined || val === null || isNaN(val)) {
        return format === 'currency' ? '$0' : format === 'percentage' ? '0%' : '0';
      }
      
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
        case 'percentage':
          return `${Math.round(val * 10) / 10}%`; // Round to 1 decimal place
        default:
          return new Intl.NumberFormat('en-US').format(val);
      }
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
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Financial Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Financial Audit Dashboard
                </h1>
                <p className="text-sm text-blue-600 font-medium">Real-time Financial Analytics & Compliance Monitoring</p>
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
                href="/compliance"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Compliance</span>
              </Link>
              <Link
                href="/risk-assessment"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Risk Assessment</span>
              </Link>
              <Link
                href="/chatbot"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>AI Assistant</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard
            title="Total Revenue"
            value={kpiData.totalRevenue}
            change={12.5}
            icon={CurrencyDollarIcon}
            color="bg-green-500"
            format="currency"
          />
          <KpiCard
            title="Active Customers"
            value={kpiData.totalCustomers}
            change={8.2}
            icon={UserGroupIcon}
            color="bg-blue-500"
            format="number"
          />
          <KpiCard
            title="Pending Transactions"
            value={kpiData.pendingTransactions}
            change={-15.3}
            icon={ClockIcon}
            color="bg-yellow-500"
            format="number"
          />
          <KpiCard
            title="Compliance Rate"
            value={kpiData.complianceRate}
            change={5.7}
            icon={DocumentTextIcon}
            color="bg-purple-500"
            format="percentage"
          />
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            title="Profit Margin"
            value={kpiData.profitMargin}
            change={2.3}
            icon={CalculatorIcon}
            color="bg-emerald-500"
            format="percentage"
          />
          <KpiCard
            title="Avg Transaction Value"
            value={kpiData.avgTransactionValue}
            change={5.1}
            icon={BanknotesIcon}
            color="bg-indigo-500"
            format="currency"
          />
          <KpiCard
            title="Growth Rate"
            value={kpiData.growthRate}
            change={1.2}
            icon={ArrowTrendingUpIcon}
            color="bg-teal-500"
            format="percentage"
          />
          <KpiCard
            title="Total Transactions"
            value={kpiData.totalTransactions}
            change={18.5}
            icon={ArrowPathIcon}
            color="bg-cyan-500"
            format="number"
          />
        </div>

        {/* 3D Visualizations Section - 3 Plots in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* 3D Revenue & Profit Trends */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl shadow-2xl p-4 border border-blue-500/20 overflow-hidden relative w-full min-w-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
                3D Revenue & Profit Trends
              </h3>
              <p className="text-xs text-blue-200 mb-2">Interactive 3D visualization of revenue and profit over time</p>
              <div className="h-[380px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && revenueProfit3DData && revenueProfit3DData.months && revenueProfit3DData.months.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: revenueProfit3DData.months,
                        y: Array(revenueProfit3DData.months.length).fill(0),
                        z: revenueProfit3DData.revenueData,
                        name: 'Revenue ($M)',
                        line: {
                          color: '#3b82f6',
                          width: 8
                        },
                        marker: {
                          size: 10,
                          color: '#3b82f6',
                          line: { color: 'white', width: 2 }
                        },
                        showlegend: true,
                        hovertemplate: '<b>Revenue</b><br>Month: %{x}<br>Value: $%{z:.2f}M<extra></extra>'
                      },
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: revenueProfit3DData.months,
                        y: Array(revenueProfit3DData.months.length).fill(1),
                        z: revenueProfit3DData.profitData,
                        name: 'Profit ($M)',
                        line: {
                          color: '#10b981',
                          width: 8
                        },
                        marker: {
                          size: 10,
                          color: '#10b981',
                          line: { color: 'white', width: 2 }
                        },
                        showlegend: true,
                        hovertemplate: '<b>Profit</b><br>Month: %{x}<br>Value: $%{z:.2f}M<extra></extra>'
                      }
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { 
                          title: 'Month', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        yaxis: { 
                          title: 'Metric', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: [0, 1],
                          ticktext: ['Revenue ($M)', 'Profit ($M)'],
                          tickfont: { color: 'white' }
                        },
                        zaxis: { 
                          title: 'Amount ($M)', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.8 }
                        }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        bordercolor: 'rgba(255, 255, 255, 0.5)',
                        borderwidth: 2,
                        font: { color: 'white', size: 13 },
                        itemsizing: 'constant'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D chart...</p>
                      <p className="text-xs mt-1 text-blue-300">
                        {!revenueProfit3DData ? 'Initializing data...' : 
                         !revenueProfit3DData.months ? 'Preparing months...' :
                         revenueProfit3DData.months.length === 0 ? 'No data available' : 'Ready to render'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Scatter Plot - Transaction Analysis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl shadow-2xl p-4 border border-emerald-500/20 overflow-hidden relative w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-emerald-400" />
                3D Transaction Volume Analysis
              </h3>
              <p className="text-xs text-emerald-200 mb-2">Volume vs Amount correlation in 3D space</p>
              <div className="h-[380px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: scatter3DData.map(d => d.x),
                        y: scatter3DData.map(d => d.y),
                        z: scatter3DData.map(d => d.z),
                        text: scatter3DData.map(d => d.text),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 12,
                          color: scatter3DData.map(d => d.z),
                          colorscale: 'Viridis',
                          showscale: true,
                          colorbar: {
                            title: 'Amount ($M)',
                            titlefont: { color: 'white' },
                            tickfont: { color: 'white' }
                          },
                          line: {
                            color: 'white',
                            width: 2
                          }
                        }
                      }
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { title: 'Month Index', titlefont: { color: 'white' }, color: 'white' },
                        yaxis: { title: 'Transaction Volume', titlefont: { color: 'white' }, color: 'white' },
                        zaxis: { title: 'Amount ($M)', titlefont: { color: 'white' }, color: 'white' },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.8 }
                        }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced 2D Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Monthly Growth Rate - 3D Surface Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 rounded-2xl shadow-2xl p-4 border border-amber-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-amber-400" />
                3D Monthly Revenue Growth Analysis
              </h3>
              <p className="text-xs text-amber-200 mb-2">Interactive 3D visualization of revenue and growth rate trends</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && growth3DData && growth3DData.months && growth3DData.months.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'lines+markers',
                        x: growth3DData.months,
                        y: growth3DData.revenueData,
                        z: growth3DData.growthData,
                        name: 'Revenue vs Growth',
                        line: {
                          color: growth3DData.growthData,
                          colorscale: 'Viridis',
                          width: 8,
                          showscale: true,
                          colorbar: {
                            title: 'Growth Rate (%)',
                            titlefont: { color: 'white' },
                            tickfont: { color: 'white' }
                          }
                        },
                        marker: {
                          size: 12,
                          color: growth3DData.growthData,
                          colorscale: 'Viridis',
                          line: { color: 'white', width: 2 },
                          showscale: false
                        },
                        showlegend: true,
                        hovertemplate: '<b>Month: %{x}</b><br>Revenue: $%{y:.2f}M<br>Growth Rate: %{z:.2f}%<extra></extra>',
                        text: growth3DData.months.map((month, idx) => 
                          `${month}<br>Revenue: $${growth3DData.revenueData[idx].toFixed(2)}M<br>Growth: ${growth3DData.growthData[idx].toFixed(2)}%`
                        )
                      }
                    ]}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { 
                          title: 'Month', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        yaxis: { 
                          title: 'Revenue ($M)', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        zaxis: { 
                          title: 'Growth Rate (%)', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.8 }
                        }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        bordercolor: 'rgba(255, 255, 255, 0.5)',
                        borderwidth: 2,
                        font: { color: 'white', size: 13 },
                        itemsizing: 'constant'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Monthly Revenue Growth Analysis...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Customer Distribution by Region */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 rounded-2xl shadow-2xl p-4 border border-violet-500/20 overflow-hidden relative w-full min-w-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5 text-violet-400" />
                3D Customer Distribution by Region
              </h3>
              <p className="text-xs text-violet-200 mb-2">Interactive 3D visualization of customers and revenue by region</p>
              <div className="h-[380px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && chartData.customerDistribution && chartData.customerDistribution.length > 0 ? (
                  <Plot
                    data={[
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: chartData.customerDistribution.map((_, idx) => idx),
                        y: Array(chartData.customerDistribution.length).fill(0),
                        z: chartData.customerDistribution.map(d => d.customers),
                        name: 'Customers',
                        marker: {
                          size: 12,
                          color: '#3b82f6',
                          line: { color: 'white', width: 2 },
                          symbol: 'square'
                        },
                        hovertemplate: '<b>Customers</b><br>Region: %{text}<br>Count: %{z:,}<extra></extra>',
                        text: chartData.customerDistribution.map(d => d.region),
                        showlegend: true
                      },
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: chartData.customerDistribution.map((_, idx) => idx),
                        y: Array(chartData.customerDistribution.length).fill(1),
                        z: chartData.customerDistribution.map(d => d.revenue / 1000), // Convert to thousands
                        name: 'Revenue ($K)',
                        marker: {
                          size: 12,
                          color: '#10b981',
                          line: { color: 'white', width: 2 },
                          symbol: 'diamond'
                        },
                        hovertemplate: '<b>Revenue</b><br>Region: %{text}<br>Amount: $%{z:,.0f}K<extra></extra>',
                        text: chartData.customerDistribution.map(d => d.region),
                        showlegend: true
                      },
                      // Add lines connecting to base for bar effect
                      ...chartData.customerDistribution.flatMap((d, idx) => [
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [idx, idx],
                          y: [0, 0],
                          z: [0, d.customers],
                          line: { color: '#3b82f6', width: 8 },
                          showlegend: false,
                          hoverinfo: 'skip'
                        },
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [idx, idx],
                          y: [1, 1],
                          z: [0, d.revenue / 1000],
                          line: { color: '#10b981', width: 8 },
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
                          title: 'Region',
                          titlefont: { color: 'white' },
                          color: 'white',
                          tickmode: 'array',
                          tickvals: chartData.customerDistribution.map((_, idx) => idx),
                          ticktext: chartData.customerDistribution.map(d => d.region),
                          tickfont: { color: 'white', size: 10 }
                        },
                        yaxis: {
                          title: 'Metric',
                          titlefont: { color: 'white' },
                          color: 'white',
                          tickmode: 'array',
                          tickvals: [0, 1],
                          ticktext: ['Customers', 'Revenue ($K)'],
                          tickfont: { color: 'white' }
                        },
                        zaxis: {
                          title: 'Value',
                          titlefont: { color: 'white' },
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.8 }
                        }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        bordercolor: 'rgba(255, 255, 255, 0.5)',
                        borderwidth: 2,
                        font: { color: 'white', size: 13 },
                        itemsizing: 'constant'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Customer Distribution...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced 2D Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Compliance Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Status</h3>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData.complianceStatus} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Transaction Volume Trend - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-2xl p-4 border-2 border-cyan-200/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowPathIcon className="h-5 w-5 text-cyan-600" />
                Transaction Volume & Amount
              </h3>
            <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={chartData.transactionVolume}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis yAxisId="left" stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'volume' ? value : `$${new Intl.NumberFormat().format(Number(value))}`,
                      name === 'volume' ? 'Volume' : 'Amount'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e7ff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="volume" 
                    fill="url(#volumeGradient)" 
                    name="Transaction Volume"
                    radius={[8, 8, 0, 0]}
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))' }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                  dataKey="amount"
                    stroke="#10B981" 
                    strokeWidth={4}
                    dot={{ fill: '#10B981', r: 6, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 8 }}
                    name="Amount ($)" 
                  />
                </ComposedChart>
            </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Profit Margin Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Profit Margin vs Target</h3>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData.profitMargin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[15, 25]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Margin']} />
                <Legend />
                <Line type="monotone" dataKey="margin" stroke="#10B981" strokeWidth={3} name="Actual Margin" />
                <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Target Margin" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 3D Transaction Types Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 rounded-2xl shadow-2xl p-4 border border-violet-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-violet-400" />
                3D Transaction Types Distribution
              </h3>
              <p className="text-xs text-violet-200 mb-2">Interactive 3D visualization of transaction types by count and amount</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && transactionTypes3DData && transactionTypes3DData.length > 0 ? (
                  <Plot
                    data={[
                      // Count bars (at y = 0)
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: transactionTypes3DData.map(d => d.x),
                        y: transactionTypes3DData.map(d => d.y),
                        z: transactionTypes3DData.map(d => d.z),
                        text: transactionTypes3DData.map(d => d.text),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 16,
                          color: transactionTypes3DData.map(d => d.color),
                          line: { color: 'white', width: 2 },
                          symbol: 'square'
                        },
                        name: 'Transaction Count',
                        showlegend: true
                      },
                      // Amount bars (at y = 1)
                      {
                        type: 'scatter3d',
                        mode: 'markers',
                        x: transactionTypes3DData.map(d => d.x),
                        y: transactionTypes3DData.map(d => d.y + 1),
                        z: transactionTypes3DData.map(d => d.amount / 1000), // Convert to thousands
                        text: transactionTypes3DData.map(d => `${d.type}<br>Amount: $${(d.amount / 1000).toFixed(2)}K<br>Count: ${d.count}`),
                        hovertemplate: '<b>%{text}</b><extra></extra>',
                        marker: {
                          size: 16,
                          color: transactionTypes3DData.map(d => d.color),
                          line: { color: 'white', width: 2 },
                          symbol: 'diamond'
                        },
                        name: 'Amount ($K)',
                        showlegend: true
                      },
                      // Lines from base to count (creating bar effect)
                      ...transactionTypes3DData.flatMap((d, idx) => [
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [d.x, d.x],
                          y: [0, 0],
                          z: [0, d.z],
                          line: {
                            color: d.color,
                            width: 12
                          },
                          showlegend: false,
                          hoverinfo: 'skip'
                        },
                        {
                          type: 'scatter3d',
                          mode: 'lines',
                          x: [d.x, d.x],
                          y: [1, 1],
                          z: [0, d.amount / 1000],
                          line: {
                            color: d.color,
                            width: 12
                          },
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
                          title: 'Transaction Type', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' },
                          tickmode: 'array',
                          tickvals: transactionTypes3DData.map(d => d.x),
                          ticktext: transactionTypes3DData.map(d => d.type)
                        },
                        yaxis: { 
                          title: 'Metric', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickmode: 'array',
                          tickvals: [0, 1],
                          ticktext: ['Count', 'Amount ($K)'],
                          tickfont: { color: 'white' }
                        },
                        zaxis: { 
                          title: 'Value', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' }
                        },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.8 }
                        }
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        bordercolor: 'rgba(255, 255, 255, 0.5)',
                        borderwidth: 2,
                        font: { color: 'white', size: 12 },
                        itemsizing: 'constant'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Transaction Types Distribution...</p>
                      {(!chartData.transactionTypes || chartData.transactionTypes.length === 0) && (
                        <p className="text-xs text-violet-300 mt-2">No transaction data available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3D Cash Flow Analysis - Flowing Ribbon Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-900 rounded-2xl shadow-2xl p-4 border border-rose-500/20 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-fuchsia-600/10 animate-pulse"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-rose-400" />
              3D Cash Flow Analysis
            </h3>
            <p className="text-xs text-rose-200 mb-2">Interactive 3D flowing ribbon chart showing cash inflow, outflow, and net flow</p>
            <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
              {typeof window !== 'undefined' && cashFlow3DData && cashFlow3DData.months && cashFlow3DData.months.length > 0 ? (
                <Plot
                  data={[
                    // Inflow ribbon (green)
                    {
                      type: 'scatter3d',
                      mode: 'lines+markers',
                      x: cashFlow3DData.inflowRibbon.x,
                      y: cashFlow3DData.inflowRibbon.y,
                      z: cashFlow3DData.inflowRibbon.z,
                      name: 'Cash Inflow',
                      line: {
                        color: cashFlow3DData.inflowRibbon.color,
                        width: 10
                      },
                      marker: {
                        size: 8,
                        color: cashFlow3DData.inflowRibbon.color,
                        line: { color: 'white', width: 2 }
                      },
                      showlegend: true,
                      hovertemplate: '<b>Cash Inflow</b><br>Month: %{x}<br>Amount: $%{z:,.0f}K<extra></extra>'
                    },
                    // Outflow ribbon (red)
                    {
                      type: 'scatter3d',
                      mode: 'lines+markers',
                      x: cashFlow3DData.outflowRibbon.x,
                      y: cashFlow3DData.outflowRibbon.y,
                      z: cashFlow3DData.outflowRibbon.z,
                      name: 'Cash Outflow',
                      line: {
                        color: cashFlow3DData.outflowRibbon.color,
                        width: 10
                      },
                      marker: {
                        size: 8,
                        color: cashFlow3DData.outflowRibbon.color,
                        line: { color: 'white', width: 2 }
                      },
                      showlegend: true,
                      hovertemplate: '<b>Cash Outflow</b><br>Month: %{x}<br>Amount: $%{z:,.0f}K<extra></extra>'
                    },
                    // Net cash flow line (blue)
                    {
                      type: 'scatter3d',
                      mode: 'lines+markers',
                      x: cashFlow3DData.netLine.x,
                      y: cashFlow3DData.netLine.y,
                      z: cashFlow3DData.netLine.z,
                      name: 'Net Cash Flow',
                      line: {
                        color: cashFlow3DData.netLine.color,
                        width: 8
                      },
                      marker: {
                        size: 10,
                        color: cashFlow3DData.netLine.color,
                        line: { color: 'white', width: 2 },
                        symbol: 'diamond'
                      },
                      showlegend: true,
                      hovertemplate: '<b>Net Cash Flow</b><br>Month: %{x}<br>Amount: $%{z:,.0f}K<extra></extra>'
                    }
                  ]}
                  layout={{
                    autosize: true,
                    scene: {
                      bgcolor: 'rgba(0,0,0,0)',
                      xaxis: { 
                        title: 'Month', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickfont: { color: 'white' }
                      },
                      yaxis: { 
                        title: 'Flow Type', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickmode: 'array',
                        tickvals: [0, 0.5, 1],
                        ticktext: ['Outflow', 'Net Flow', 'Inflow'],
                        tickfont: { color: 'white' }
                      },
                      zaxis: { 
                        title: 'Amount ($K)', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickfont: { color: 'white' }
                      },
                      camera: {
                        eye: { x: 1.8, y: 1.8, z: 1.8 }
                      }
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: 'white' },
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    showlegend: true,
                    legend: {
                      x: 0.02,
                      y: 0.98,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      bordercolor: 'rgba(255, 255, 255, 0.5)',
                      borderwidth: 2,
                      font: { color: 'white', size: 11 },
                      itemsizing: 'constant'
                    }
                  }}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                    responsive: true
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Loading 3D Cash Flow Analysis...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

          {/* Financial Health Indicators - Enhanced 3D Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl shadow-2xl p-6 border-2 border-indigo-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                Financial Health Indicators
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Liquidity Ratio', value: 1.85, percentage: 92.5, color: 'green' },
                  { label: 'Debt-to-Equity', value: 0.42, percentage: 42, color: 'blue' },
                  { label: 'Current Ratio', value: 2.15, percentage: 71.7, color: 'purple' },
                  { label: 'ROI', value: 18.5, percentage: 74, color: 'teal', suffix: '%' },
                  { label: 'Operating Margin', value: 20.0, percentage: 80, color: 'indigo', suffix: '%' }
                ].map((indicator, index) => (
                  <motion.div
                    key={indicator.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{indicator.label}</span>
                      <span className={`text-sm font-bold text-${indicator.color}-400`}>
                        {indicator.value}{indicator.suffix || ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                      <motion.div
                        className={`bg-gradient-to-r from-${indicator.color}-500 to-${indicator.color}-400 h-3 rounded-full shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{ width: `${indicator.percentage}%` }}
                        transition={{ duration: 1.5, delay: 1.2 + index * 0.1, ease: 'easeOut' }}
                        style={{ 
                          boxShadow: `0 0 10px rgba(var(--${indicator.color}-500), 0.5)`,
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
          </div>
        </motion.div>
        </div>

        {/* 3D Recent Transactions Analysis - Combined with Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* 3D Recent Transactions Analysis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-900 rounded-2xl shadow-2xl p-4 border border-rose-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-fuchsia-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-rose-400" />
                3D Recent Transactions Analysis
              </h3>
              <p className="text-xs text-rose-200 mb-2">Interactive 3D visualization of recent transactions by index, amount, and type</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
              {typeof window !== 'undefined' && recentTransactions3DData && recentTransactions3DData.length > 0 ? (
                <Plot
                  data={[
                    {
                      type: 'scatter3d',
                      mode: 'markers',
                      x: recentTransactions3DData.map(d => d.x),
                      y: recentTransactions3DData.map(d => d.y),
                      z: recentTransactions3DData.map(d => d.z),
                      text: recentTransactions3DData.map(d => d.text),
                      hovertemplate: '<b>%{text}</b><extra></extra>',
                      marker: {
                        size: 14,
                        color: recentTransactions3DData.map(d => d.y), // Color by amount
                        colorscale: 'Plasma',
                        showscale: true,
                        colorbar: {
                          title: 'Amount ($K)',
                          titlefont: { color: 'white' },
                          tickfont: { color: 'white' }
                        },
                        line: {
                          color: 'white',
                          width: 2
                        },
                        symbol: recentTransactions3DData.map(d => 
                          d.status === 'Completed' ? 'circle' : 
                          d.status === 'Pending' ? 'square' : 'diamond'
                        )
                      },
                      showlegend: false
                    }
                  ]}
                  layout={{
                    autosize: true,
                    scene: {
                      bgcolor: 'rgba(0,0,0,0)',
                      xaxis: { 
                        title: 'Transaction Index', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickfont: { color: 'white' }
                      },
                      yaxis: { 
                        title: 'Amount ($K)', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickfont: { color: 'white' }
                      },
                      zaxis: { 
                        title: 'Transaction Type', 
                        titlefont: { color: 'white' }, 
                        color: 'white',
                        tickfont: { color: 'white' },
                        tickmode: 'array',
                        tickvals: [0, 1, 2, 3, 4, 5, 6],
                        ticktext: ['Payment', 'Transfer', 'Deposit', 'Withdrawal', 'Trade', 'Refund', 'Fee']
                      },
                      camera: {
                        eye: { x: 1.8, y: 1.8, z: 1.8 }
                      }
                    },
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: 'white' },
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    showlegend: true,
                    legend: {
                      x: 0.02,
                      y: 0.98,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      bordercolor: 'rgba(255, 255, 255, 0.5)',
                      borderwidth: 2,
                      font: { color: 'white', size: 12 },
                      itemsizing: 'constant'
                    }
                  }}
                  config={{
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                    responsive: true
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Loading 3D Recent Transactions Analysis...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rotate-45 bg-white"></div>
                <span>Failed</span>
              </div>
            </div>
          </div>
        </motion.div>

          {/* 3D Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 rounded-2xl shadow-2xl p-4 border border-teal-500/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 to-blue-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-teal-400" />
                3D Expense Breakdown
              </h3>
              <p className="text-xs text-teal-200 mb-2">Interactive 3D visualization of expenses by category and amount</p>
              <div className="h-[400px] bg-black/20 rounded-lg backdrop-blur-sm">
                {typeof window !== 'undefined' && expenseBreakdown3DData && expenseBreakdown3DData.length > 0 ? (
                  <Plot
                    data={expenseBreakdown3DData.map((slice) => ({
                      type: 'mesh3d',
                      x: slice.x,
                      y: slice.y,
                      z: slice.z,
                      i: slice.i,
                      j: slice.j,
                      k: slice.k,
                      color: slice.color,
                      opacity: 0.9,
                      name: `${slice.category} (${slice.percentage}%)`,
                      hovertemplate: `<b>${slice.text}</b><extra></extra>`,
                      showlegend: true,
                      lighting: {
                        ambient: 0.7,
                        diffuse: 0.8,
                        specular: 0.1,
                        roughness: 0.5,
                        fresnel: 0.2
                      },
                      lightposition: {
                        x: 100,
                        y: 100,
                        z: 100
                      }
                    }))}
                    layout={{
                      autosize: true,
                      scene: {
                        bgcolor: 'rgba(0,0,0,0)',
                        xaxis: { 
                          title: '', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' },
                          showgrid: true,
                          gridcolor: 'rgba(255,255,255,0.1)',
                          showbackground: false
                        },
                        yaxis: { 
                          title: '', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' },
                          showgrid: true,
                          gridcolor: 'rgba(255,255,255,0.1)',
                          showbackground: false
                        },
                        zaxis: { 
                          title: '', 
                          titlefont: { color: 'white' }, 
                          color: 'white',
                          tickfont: { color: 'white' },
                          showgrid: true,
                          gridcolor: 'rgba(255,255,255,0.1)',
                          showbackground: false
                        },
                        camera: {
                          eye: { x: 1.8, y: 1.8, z: 1.2 },
                          center: { x: 0, y: 0, z: 0 },
                          up: { x: 0, y: 0, z: 1 }
                        },
                        aspectmode: 'data'
                      },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: 'white' },
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      showlegend: true,
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        bordercolor: 'rgba(255, 255, 255, 0.5)',
                        borderwidth: 2,
                        font: { color: 'white', size: 11 },
                        itemsizing: 'constant'
                      }
                    }}
                    config={{
                      displayModeBar: true,
                      displaylogo: false,
                      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                      responsive: true
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading 3D Pie Chart...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-teal-200">
                {expenseBreakdown3DData.map((expense, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></div>
                    <span>{expense.category} ({expense.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/compliance"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            >
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Compliance Reports</p>
                <p className="text-sm text-gray-500">View compliance dashboard</p>
              </div>
            </Link>
            <Link
              href="/risk-assessment"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Risk Assessment</p>
                <p className="text-sm text-gray-500">Analyze potential risks</p>
              </div>
            </Link>
            <Link
              href="/chatbot"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">AI Audit Assistant</p>
                <p className="text-sm text-gray-500">Ask questions about your data</p>
              </div>
            </Link>
            <button 
              onClick={generateComplianceReport}
              disabled={isGeneratingReport}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </p>
                <p className="text-sm text-gray-500">
                  {isGeneratingReport ? 'Creating PDF report...' : 'Create compliance report'}
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
