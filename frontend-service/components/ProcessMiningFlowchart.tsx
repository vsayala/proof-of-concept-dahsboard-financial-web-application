'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  BeakerIcon,
  DocumentCheckIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  ClipboardIcon,
  DocumentMagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProcessStep {
  id: string;
  name: string;
  description: string;
  kpi: string;
  avgTime: string;
  status: 'completed' | 'in-progress' | 'pending' | 'error';
  completionRate: number;
  volume: number;
  phase: number;
  x?: number;
  y?: number;
}

interface FlowConnection {
  from: string;
  to: string;
  type: 'linear' | 'decision' | 'parallel' | 'feedback' | 'recursive' | 'qa-loop' | 'converge';
  condition?: string;
  animated?: boolean;
}

export default function ProcessMiningFlowchart() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || 1200,
          height: containerRef.current.offsetHeight || 800
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Use ResizeObserver for better performance
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Comprehensive financial audit process steps with realistic data
  const processSteps: ProcessStep[] = useMemo(() => [
    {
      id: 'audit-planning',
      name: 'Audit Planning',
      description: 'Strategic planning and scope definition',
      kpi: '96.8%',
      avgTime: '3.2 hrs',
      status: 'completed',
      completionRate: 96.8,
      volume: 45,
      phase: 1
    },
    {
      id: 'data-collection',
      name: 'Data Collection',
      description: 'Gather financial data from multiple sources',
      kpi: '98.5%',
      avgTime: '2.3 hrs',
      status: 'completed',
      completionRate: 98.5,
      volume: 1250,
      phase: 1
    },
    {
      id: 'data-validation',
      name: 'Data Validation',
      description: 'Verify data integrity and completeness',
      kpi: '94.2%',
      avgTime: '1.8 hrs',
      status: 'completed',
      completionRate: 94.2,
      volume: 1180,
      phase: 1
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Identify and evaluate financial risks',
      kpi: '89.7%',
      avgTime: '3.2 hrs',
      status: 'in-progress',
      completionRate: 89.7,
      volume: 1050,
      phase: 2
    },
    {
      id: 'control-testing',
      name: 'Control Testing',
      description: 'Test internal controls effectiveness',
      kpi: '92.1%',
      avgTime: '4.1 hrs',
      status: 'pending',
      completionRate: 92.1,
      volume: 980,
      phase: 3
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      description: 'Verify regulatory compliance',
      kpi: '96.8%',
      avgTime: '2.7 hrs',
      status: 'pending',
      completionRate: 96.8,
      volume: 1100,
      phase: 3
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      description: 'Advanced analytics for fraud identification',
      kpi: '91.3%',
      avgTime: '2.8 hrs',
      status: 'pending',
      completionRate: 91.3,
      volume: 890,
      phase: 3
    },
    {
      id: 'sampling-testing',
      name: 'Sampling & Testing',
      description: 'Statistical sampling and substantive testing',
      kpi: '93.7%',
      avgTime: '3.5 hrs',
      status: 'pending',
      completionRate: 93.7,
      volume: 750,
      phase: 4
    },
    {
      id: 'analytical-procedures',
      name: 'Analytical Procedures',
      description: 'Perform analytical review procedures',
      kpi: '88.9%',
      avgTime: '2.6 hrs',
      status: 'pending',
      completionRate: 88.9,
      volume: 680,
      phase: 4
    },
    {
      id: 'evidence-gathering',
      name: 'Evidence Gathering',
      description: 'Collect and document audit evidence',
      kpi: '95.4%',
      avgTime: '2.1 hrs',
      status: 'pending',
      completionRate: 95.4,
      volume: 1120,
      phase: 4
    },
    {
      id: 'management-inquiry',
      name: 'Management Inquiry',
      description: 'Interviews and management representations',
      kpi: '97.1%',
      avgTime: '1.9 hrs',
      status: 'pending',
      completionRate: 97.1,
      volume: 320,
      phase: 5
    },
    {
      id: 'workpaper-review',
      name: 'Workpaper Review',
      description: 'Review and quality check workpapers',
      kpi: '94.6%',
      avgTime: '2.4 hrs',
      status: 'pending',
      completionRate: 94.6,
      volume: 850,
      phase: 5
    },
    {
      id: 'finding-documentation',
      name: 'Finding Documentation',
      description: 'Document audit findings and exceptions',
      kpi: '92.8%',
      avgTime: '1.7 hrs',
      status: 'pending',
      completionRate: 92.8,
      volume: 420,
      phase: 5
    },
    {
      id: 'report-generation',
      name: 'Report Generation',
      description: 'Generate audit reports and findings',
      kpi: '97.3%',
      avgTime: '1.5 hrs',
      status: 'pending',
      completionRate: 97.3,
      volume: 1150,
      phase: 6
    },
    {
      id: 'management-response',
      name: 'Management Response',
      description: 'Management response to audit findings',
      kpi: '89.2%',
      avgTime: '2.9 hrs',
      status: 'pending',
      completionRate: 89.2,
      volume: 380,
      phase: 6
    },
    {
      id: 'follow-up-review',
      name: 'Follow-up Review',
      description: 'Follow-up on management responses',
      kpi: '91.7%',
      avgTime: '1.3 hrs',
      status: 'pending',
      completionRate: 91.7,
      volume: 290,
      phase: 6
    }
  ], []);

  // Comprehensive process flow with all audit steps, decision points, and feedback loops
  const processFlow: FlowConnection[] = useMemo(() => [
    // Phase 1: Planning & Data
    { from: 'audit-planning', to: 'data-collection', type: 'linear' },
    { from: 'data-collection', to: 'data-validation', type: 'linear' },
    { from: 'data-validation', to: 'risk-assessment', type: 'linear' },
    
    // Phase 2: Risk-based branching
    { from: 'risk-assessment', to: 'control-testing', type: 'decision', condition: 'High Risk' },
    { from: 'risk-assessment', to: 'compliance-check', type: 'decision', condition: 'Medium Risk' },
    { from: 'risk-assessment', to: 'fraud-detection', type: 'decision', condition: 'Low Risk' },
    
    // Phase 3: Parallel testing processes
    { from: 'control-testing', to: 'sampling-testing', type: 'parallel' },
    { from: 'compliance-check', to: 'analytical-procedures', type: 'parallel' },
    { from: 'fraud-detection', to: 'evidence-gathering', type: 'parallel' },
    
    // Phase 4: Evidence and documentation
    { from: 'sampling-testing', to: 'evidence-gathering', type: 'converge' },
    { from: 'analytical-procedures', to: 'evidence-gathering', type: 'converge' },
    { from: 'evidence-gathering', to: 'management-inquiry', type: 'linear' },
    { from: 'management-inquiry', to: 'workpaper-review', type: 'linear' },
    
    // Phase 5: Review and reporting
    { from: 'workpaper-review', to: 'finding-documentation', type: 'linear' },
    { from: 'finding-documentation', to: 'report-generation', type: 'linear' },
    { from: 'report-generation', to: 'management-response', type: 'linear' },
    { from: 'management-response', to: 'follow-up-review', type: 'linear' },
    
    // Feedback loops and quality assurance
    { from: 'control-testing', to: 'data-validation', type: 'feedback', condition: 'Control Failure' },
    { from: 'compliance-check', to: 'risk-assessment', type: 'feedback', condition: 'Compliance Gap' },
    { from: 'fraud-detection', to: 'data-collection', type: 'feedback', condition: 'Suspicious Activity' },
    { from: 'sampling-testing', to: 'data-validation', type: 'feedback', condition: 'Sample Issues' },
    { from: 'workpaper-review', to: 'evidence-gathering', type: 'feedback', condition: 'Insufficient Evidence' },
    { from: 'finding-documentation', to: 'control-testing', type: 'feedback', condition: 'New Findings' },
    { from: 'management-response', to: 'finding-documentation', type: 'feedback', condition: 'Response Inadequate' },
    { from: 'follow-up-review', to: 'audit-planning', type: 'recursive', condition: 'New Audit Cycle' },
    
    // Quality assurance loops
    { from: 'report-generation', to: 'workpaper-review', type: 'qa-loop', condition: 'Quality Review' },
    { from: 'evidence-gathering', to: 'data-collection', type: 'qa-loop', condition: 'Data Revalidation' },
    { from: 'analytical-procedures', to: 'risk-assessment', type: 'qa-loop', condition: 'Risk Reassessment' }
  ], []);

  // Professional hierarchical layout algorithm - uses full container space
  const layoutNodes = useCallback((steps: ProcessStep[], containerWidth: number, containerHeight: number): ProcessStep[] => {
    if (containerWidth === 0 || containerHeight === 0) {
      // Fallback to default layout if container size not available
      const nodeWidth = 120; // Circular nodes
      const horizontalSpacing = 300;
      const verticalSpacing = 220;
      const startX = 150;
      const startY = 100;

      const phaseGroups: { [key: number]: ProcessStep[] } = {};
      steps.forEach(step => {
        if (!phaseGroups[step.phase]) {
          phaseGroups[step.phase] = [];
        }
        phaseGroups[step.phase].push(step);
      });

      const positionedSteps: ProcessStep[] = [];
      const phases = Object.keys(phaseGroups).map(Number).sort((a, b) => a - b);

      phases.forEach((phase, phaseIndex) => {
        const phaseNodes = phaseGroups[phase];
        phaseNodes.forEach((step, nodeIndex) => {
          const x = startX + (nodeIndex * horizontalSpacing);
          const y = startY + (phaseIndex * verticalSpacing);
          positionedSteps.push({ ...step, x, y });
        });
      });

      return positionedSteps;
    }

    const nodeWidth = 120; // Circular nodes
    const nodeHeight = 120;
    // Padding to keep content inside container
    const padding = 60;
    const availableWidth = Math.max(800, containerWidth - (padding * 2));
    const availableHeight = Math.max(600, containerHeight - (padding * 2));

    // Group nodes by phase
    const phaseGroups: { [key: number]: ProcessStep[] } = {};
    steps.forEach(step => {
      if (!phaseGroups[step.phase]) {
        phaseGroups[step.phase] = [];
      }
      phaseGroups[step.phase].push(step);
    });

    const phases = Object.keys(phaseGroups).map(Number).sort((a, b) => a - b);
    const numPhases = phases.length;
    
    // Calculate optimal spacing to use FULL horizontal space
    const maxNodesPerPhase = Math.max(...phases.map(phase => phaseGroups[phase].length));
    
    // Use full width - start from left edge with minimal padding
    const startX = padding;
    const verticalSpacing = Math.max(200, Math.min(280, availableHeight / Math.max(numPhases, 6)));
    const startY = padding + Math.max(0, (availableHeight - (numPhases * verticalSpacing)) / 2);

    // Calculate positions using hierarchical layout - FULL WIDTH
    const positionedSteps: ProcessStep[] = [];

    phases.forEach((phase, phaseIndex) => {
      const phaseNodes = phaseGroups[phase];
      const nodesInPhase = phaseNodes.length;
      
      // Distribute nodes across FULL width - edge to edge
      if (nodesInPhase === 1) {
        // Single node - center it
        const x = startX + availableWidth / 2;
        const y = startY + (phaseIndex * verticalSpacing);
        positionedSteps.push({
          ...phaseNodes[0],
          x,
          y
        });
      } else {
        // Multiple nodes - spread from left edge to right edge
        // First node at left edge, last node at right edge
        const phaseStartX = startX;
        const phaseEndX = startX + availableWidth;
        const spacingBetweenNodes = (phaseEndX - phaseStartX) / (nodesInPhase - 1);
        
        phaseNodes.forEach((step, nodeIndex) => {
          const x = phaseStartX + (nodeIndex * spacingBetweenNodes);
          const y = startY + (phaseIndex * verticalSpacing);
          
          positionedSteps.push({
            ...step,
            x,
            y
          });
        });
      }
    });

    return positionedSteps;
  }, []);

  const positionedNodes = useMemo(() => 
    layoutNodes(processSteps, containerSize.width, containerSize.height), 
    [processSteps, layoutNodes, containerSize.width, containerSize.height]
  );

  // Calculate edge paths - Neo4j style: mostly straight lines with minimal curves
  const getEdgePath = useCallback((fromNode: ProcessStep, toNode: ProcessStep, flowType: string): string => {
    if (!fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return '';

    // Neo4j uses circular nodes, so calculate edge of circle
    const nodeRadius = 60; // Radius for circular nodes (120px diameter)
    const fromX = fromNode.x + 60; // Center X of circular node
    const fromY = fromNode.y + 60;  // Center Y of circular node
    const toX = toNode.x + 60;
    const toY = toNode.y + 60;

    // Calculate direction
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Calculate start and end points on node edges (Neo4j style)
    const startX = fromX + Math.cos(angle) * nodeRadius;
    const startY = fromY + Math.sin(angle) * nodeRadius;
    const endX = toX - Math.cos(angle) * nodeRadius;
    const endY = toY - Math.sin(angle) * nodeRadius;
    
    // Neo4j uses mostly straight lines, with slight curves only for feedback loops
    if (flowType === 'feedback' || flowType === 'recursive' || flowType === 'qa-loop') {
      // Minimal curve for feedback - Neo4j style
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const perpAngle = angle + Math.PI / 2;
      const curveOffset = Math.min(distance * 0.15, 80);
      const controlX = midX + Math.cos(perpAngle) * curveOffset;
      const controlY = midY + Math.sin(perpAngle) * curveOffset;
      return `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;
    } else {
      // Straight line - Neo4j default style
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  }, []);

  // Get edge style based on flow type - Neo4j style (simpler, cleaner)
  const getEdgeStyle = useCallback((flowType: string) => {
    const styles = {
      linear: { color: '#68BDF6', width: 2, dashArray: '0', marker: 'arrowhead', opacity: 0.9 },
      decision: { color: '#FFA94D', width: 2.5, dashArray: '0', marker: 'arrowhead-decision', opacity: 0.9 },
      parallel: { color: '#51CF66', width: 2, dashArray: '0', marker: 'arrowhead-parallel', opacity: 0.9 },
      feedback: { color: '#FF6B6B', width: 2, dashArray: '5,3', marker: 'arrowhead-feedback', opacity: 0.8 },
      recursive: { color: '#9775FA', width: 2.5, dashArray: '8,4', marker: 'arrowhead-recursive', opacity: 0.8 },
      'qa-loop': { color: '#3BC9DB', width: 2, dashArray: '4,2', marker: 'arrowhead-qa', opacity: 0.8 },
      converge: { color: '#F783AC', width: 2, dashArray: '0', marker: 'arrowhead-converge', opacity: 0.9 }
    };
    return styles[flowType as keyof typeof styles] || styles.linear;
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setRefreshKey(prev => prev + 1);
      
      // Update process data with realistic variations
      setCurrentStep(prev => (prev + 1) % processSteps.length);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [processSteps.length]);

  // Get icon for each process step
  const getStepIcon = (stepId: string) => {
    const iconMap: { [key: string]: any } = {
      'audit-planning': DocumentTextIcon,
      'data-collection': ClipboardDocumentCheckIcon,
      'data-validation': ShieldCheckIcon,
      'risk-assessment': MagnifyingGlassIcon,
      'control-testing': ChartBarIcon,
      'compliance-check': ShieldCheckIcon,
      'fraud-detection': MagnifyingGlassIcon,
      'sampling-testing': BeakerIcon,
      'analytical-procedures': ChartBarIcon,
      'evidence-gathering': DocumentCheckIcon,
      'management-inquiry': UserGroupIcon,
      'workpaper-review': PresentationChartLineIcon,
      'finding-documentation': ClipboardIcon,
      'report-generation': DocumentArrowDownIcon,
      'management-response': ChatBubbleLeftRightIcon,
      'follow-up-review': ArrowPathIcon
    };
    return iconMap[stepId] || DocumentTextIcon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return {
        gradient: 'from-emerald-500/90 via-green-500/90 to-teal-500/90',
        border: 'border-emerald-400/50',
        bg: 'bg-emerald-500/10'
      };
      case 'in-progress': return {
        gradient: 'from-blue-500/90 via-cyan-500/90 to-sky-500/90',
        border: 'border-blue-400/50',
        bg: 'bg-blue-500/10'
      };
      case 'pending': return {
        gradient: 'from-amber-500/90 via-yellow-500/90 to-orange-500/90',
        border: 'border-amber-400/50',
        bg: 'bg-amber-500/10'
      };
      case 'error': return {
        gradient: 'from-rose-500/90 via-red-500/90 to-pink-500/90',
        border: 'border-rose-400/50',
        bg: 'bg-rose-500/10'
      };
      default: return {
        gradient: 'from-slate-500/90 via-gray-500/90 to-zinc-500/90',
        border: 'border-slate-400/50',
        bg: 'bg-slate-500/10'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'in-progress': return ArrowPathIcon;
      case 'pending': return ClockIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getNodeById = (id: string) => positionedNodes.find(n => n.id === id);

  // Calculate SVG viewBox to keep content inside container
  const svgViewBox = useMemo(() => {
    if (positionedNodes.length === 0 || containerSize.width === 0 || containerSize.height === 0) {
      return '0 0 2000 1200';
    }
    
    const nodeWidth = 120; // Circular nodes
    const nodeHeight = 120;
    const padding = 60;
    
    // Calculate bounds including node dimensions
    const xs = positionedNodes.map(n => (n.x || 0));
    const ys = positionedNodes.map(n => (n.y || 0));
    
    const minX = Math.max(0, Math.min(...xs) - padding);
    const maxX = Math.min(containerSize.width, Math.max(...xs) + nodeWidth + padding);
    const minY = Math.max(0, Math.min(...ys) - padding);
    const maxY = Math.min(containerSize.height, Math.max(...ys) + nodeHeight + padding);
    
    // Ensure viewBox matches container size to keep content inside
    return `0 0 ${containerSize.width} ${containerSize.height}`;
  }, [positionedNodes, containerSize.width, containerSize.height]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900/95 via-purple-900/70 to-slate-800/95 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl flex flex-col">
      <div className="text-center mb-6 flex-shrink-0">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Comprehensive Financial Audit Process
        </h3>
        <p className="text-gray-300 text-lg mb-6">
          Real-time process mining with 16 audit steps, decision points, and feedback loops
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-blue-400">
            <motion.div 
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>Auto-refreshing every 15s</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>16 Process Steps</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Complex Branching</span>
          </div>
        </div>
      </div>

      {/* Professional Flow Diagram Container - Content Inside */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 min-h-[700px] bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-2xl border border-white/10 overflow-hidden"
        style={{ padding: '60px' }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox={svgViewBox}
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Neo4j-style simple arrow markers */}
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#68BDF6" />
            </marker>
            <marker
              id="arrowhead-feedback"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#FF6B6B" />
            </marker>
            <marker
              id="arrowhead-decision"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#FFA94D" />
            </marker>
            <marker
              id="arrowhead-parallel"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#51CF66" />
            </marker>
            <marker
              id="arrowhead-converge"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#F783AC" />
            </marker>
            <marker
              id="arrowhead-qa"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#3BC9DB" />
            </marker>
            <marker
              id="arrowhead-recursive"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0,0 8,4 0,8" fill="#9775FA" />
            </marker>
          </defs>

          {/* Render all edges */}
          <AnimatePresence>
          {processFlow.map((flow, index) => {
              const fromNode = getNodeById(flow.from);
              const toNode = getNodeById(flow.to);
              if (!fromNode || !toNode || !fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return null;

              const pathD = getEdgePath(fromNode, toNode, flow.type);
              const edgeStyle = getEdgeStyle(flow.type);
              const isHighlighted = hoveredNode === flow.from || hoveredNode === flow.to;

            return (
                <g key={`edge-${flow.from}-${flow.to}-${index}`}>
                  {/* Neo4j-style connection path */}
                <motion.path
                  d={pathD}
                    stroke={edgeStyle.color}
                    strokeWidth={edgeStyle.width}
                    strokeDasharray={edgeStyle.dashArray}
                  fill="none"
                    markerEnd={`url(#${edgeStyle.marker})`}
                    opacity={isHighlighted ? edgeStyle.opacity : edgeStyle.opacity * 0.7}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: isHighlighted ? edgeStyle.opacity : edgeStyle.opacity * 0.7
                    }}
                    transition={{ 
                      pathLength: { duration: 1.2, delay: index * 0.03, ease: 'easeInOut' },
                      opacity: { duration: 0.2 }
                    }}
                    style={{ 
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round'
                    }}
                  />
                  {/* Neo4j-style edge label positioned along path */}
                  {flow.condition && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.8 }}
                    >
                      {/* Label background - Neo4j style */}
                      <rect
                        x={(fromNode.x + toNode.x) / 2 - 40}
                        y={(fromNode.y + toNode.y) / 2 - 9}
                        width="80"
                        height="18"
                        rx="9"
                        fill="rgba(30, 41, 59, 0.95)"
                        stroke={edgeStyle.color}
                        strokeWidth="1"
                        className="backdrop-blur-sm"
                      />
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 + 4}
                        textAnchor="middle"
                        className="text-[10px] fill-white font-medium"
                        style={{ 
                          pointerEvents: 'none'
                        }}
                      >
                        {flow.condition}
                      </text>
                    </motion.g>
                  )}
                </g>
            );
          })}
          </AnimatePresence>
        </svg>

        {/* Render all nodes */}
        <div className="relative z-10">
          <AnimatePresence>
            {positionedNodes.map((step, index) => {
              if (!step.x || !step.y) return null;

              const isHovered = hoveredNode === step.id;
              const isSelected = selectedNode === step.id;
              const isActive = currentStep === index && isAnimating;
            
            return (
              <motion.div
                key={step.id}
                  initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                    scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
                    opacity: 1
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 200
                  }}
                className="absolute group cursor-pointer"
                  style={{ 
                    left: step.x, 
                    top: step.y,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered || isSelected ? 50 : 10
                  }}
                  onMouseEnter={() => setHoveredNode(step.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === step.id ? null : step.id)}
                >
                  {/* Neo4j-style Circular Node */}
                  {(() => {
                    const statusColors = getStatusColor(step.status);
                    const StepIcon = getStepIcon(step.id);
                    const StatusIcon = getStatusIcon(step.status);
                    
                    return (
                      <div 
                        className={`
                          relative w-[120px] h-[120px]
                          rounded-full
                          transition-all duration-300 
                          ${isHovered ? 'scale-110 shadow-2xl' : 'shadow-lg'}
                          ${isSelected ? 'ring-4 ring-blue-400/60 ring-offset-2 ring-offset-slate-900' : ''}
                          overflow-visible
                          border-2 ${isHovered ? statusColors.border : 'border-white/20'}
                          flex items-center justify-center
                        `}
                        style={{
                          background: step.status === 'completed' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
                                     step.status === 'in-progress' ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' :
                                     step.status === 'pending' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
                                     'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        }}
                      >
                        {/* Neo4j-style Node Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          {/* Icon */}
                          <div className="mb-2">
                            <StepIcon className="w-8 h-8 text-white" />
                          </div>
                          
                          {/* Status Indicator */}
                  <motion.div 
                            className="absolute -top-1 -right-1"
                    animate={{ 
                              scale: isActive ? [1, 1.3, 1] : 1,
                      rotate: step.status === 'in-progress' ? 360 : 0
                    }}
                            transition={{ 
                              scale: { duration: 0.5 },
                              rotate: { duration: 2, repeat: step.status === 'in-progress' ? Infinity : 0 }
                            }}
                          >
                            <StatusIcon 
                              className={`w-5 h-5 ${
                                step.status === 'completed' ? 'text-white' :
                                step.status === 'in-progress' ? 'text-white animate-spin' :
                                'text-white'
                              }`}
                            />
                  </motion.div>
                        </div>
                        
                        {/* Node Label - Neo4j style (below node) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[140px]">
                          <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20 shadow-lg">
                            <div className="text-xs font-semibold text-white text-center leading-tight">
                      {step.name}
                            </div>
                            <div className="text-[10px] text-gray-300 text-center mt-0.5">
                              {step.avgTime} • {step.kpi}
                            </div>
                          </div>
                        </div>
                    </div>
                    );
                  })()}

                    {/* Enhanced Detailed Overlay */}
                    <AnimatePresence>
                      {(isHovered || isSelected) && (
                      <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2 w-[280px] z-50"
                        >
                          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
                            {/* Arrow pointer */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900/95" />
                            
                            <div className="text-white">
                              <div className="flex items-center gap-3 mb-3">
                                {(() => {
                                  const StepIcon = getStepIcon(step.id);
                                  return (
                                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/20">
                                      <StepIcon className="w-5 h-5 text-blue-300" />
                                    </div>
                                  );
                                })()}
                                <div>
                                  <h4 className="font-bold text-base mb-1">{step.name}</h4>
                                  <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>

                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1">KPI</div>
                          <div className="text-sm font-bold">{step.kpi}</div>
                        </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1">Time</div>
                                  <div className="text-sm font-bold">{step.avgTime}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
                                  <div className="text-xs text-gray-400 mb-1">Volume</div>
                          <div className="text-sm font-bold">{step.volume.toLocaleString()}</div>
                        </div>
                      </div>

                              <div className="mb-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-gray-400">Completion Rate</span>
                                  <span className="text-sm font-bold">{step.completionRate}%</span>
                        </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                                    className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${step.completionRate}%` }}
                          />
                        </div>
                      </div>

                              <div className="flex items-center justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  step.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {step.status === 'completed' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                  {step.status === 'in-progress' && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                                  {step.status === 'pending' && <ClockIcon className="w-3.5 h-3.5" />}
                          {step.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      </div>

      {/* Process Flow Legend */}
      <div className="mt-6 flex-shrink-0 bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-white/10">
        <h4 className="text-xl font-bold text-white mb-4 text-center">Process Flow Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'linear', label: 'Linear Flow', color: '#3B82F6' },
            { type: 'decision', label: 'Decision Point', color: '#F59E0B' },
            { type: 'parallel', label: 'Parallel Process', color: '#10B981' },
            { type: 'feedback', label: 'Feedback Loop', color: '#EF4444', dash: true },
            { type: 'recursive', label: 'Recursive Loop', color: '#8B5CF6', dash: true },
            { type: 'qa-loop', label: 'QA Loop', color: '#06B6D4', dash: true },
            { type: 'converge', label: 'Converge Flow', color: '#EC4899' }
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-3 group cursor-pointer">
              <div 
                className="w-12 h-1 rounded-full transition-transform group-hover:scale-110"
                style={{ 
                  backgroundColor: item.color,
                  borderTop: item.dash ? '2px dashed' : 'none'
                }}
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
          </div>
          ))}
        </div>
      </div>

      {/* Process Statistics */}
      <div className="mt-4 flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">16</div>
          <div className="text-xs text-gray-300 mt-1">Process Steps</div>
          <div className="text-xs text-blue-300 mt-1">Comprehensive Audit</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 text-center border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">93.8%</div>
          <div className="text-xs text-gray-300 mt-1">Avg Completion</div>
          <div className="text-xs text-green-300 mt-1">High Efficiency</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 text-center border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">42.3h</div>
          <div className="text-xs text-gray-300 mt-1">Total Process Time</div>
          <div className="text-xs text-purple-300 mt-1">Including Loops</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 text-center border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-400">12,450</div>
          <div className="text-xs text-gray-300 mt-1">Total Volume</div>
          <div className="text-xs text-orange-300 mt-1">Transactions</div>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="mt-4 flex-shrink-0 text-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center text-sm text-blue-400"
        >
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
          Live Process Monitoring Active
        </motion.div>
      </div>
    </div>
  );
}
