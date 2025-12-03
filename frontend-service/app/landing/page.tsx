'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import ProcessMiningFlowchart from '../../components/ProcessMiningFlowchart';

export default function LandingPage() {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Financial Dashboard',
      description: 'Interactive charts, KPIs, and real-time analytics for comprehensive financial oversight',
      href: '/dashboard',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Audit Assistant',
      description: 'Intelligent chatbot powered by RAG technology for data analysis and compliance queries',
      href: '/chatbot',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Compliance Reports',
      description: 'Automated compliance monitoring and regulatory reporting with audit trails',
      href: '/compliance',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Risk Assessment',
      description: 'Advanced risk analysis and fraud detection using machine learning algorithms',
      href: '/risk-assessment',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { label: 'Total Revenue', value: '$18.4M', change: '+12.5%' },
    { label: 'Active Customers', value: '2,900', change: '+8.2%' },
    { label: 'Compliance Rate', value: '85%', change: '+5.7%' },
    { label: 'Pending Transactions', value: '12', change: '-15.3%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Financial Audit
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Intelligence Platform
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced analytics, AI-powered insights, and comprehensive compliance monitoring 
              for modern financial institutions
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                  <div className="text-xs text-green-400 mt-1">{stat.change}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ChartBarIcon className="h-6 w-6 mr-2" />
                View Dashboard
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/chatbot"
                className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
                AI Assistant
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

        {/* Process Mining Flowchart Section - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <ProcessMiningFlowchart />
          </motion.div>
        </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comprehensive Financial Intelligence
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need for modern financial auditing, compliance, and risk management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={feature.href}>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 transform hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-400 mt-4 group-hover:text-blue-300 transition-colors">
                    <span className="font-medium">Explore</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Powered by Advanced Technology</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'MongoDB', description: 'NoSQL Database' },
                { name: 'RAG AI', description: 'Retrieval-Augmented Generation' },
                { name: 'Ollama LLM', description: 'Local Language Model' },
                { name: 'Next.js', description: 'React Framework' }
              ].map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">{tech.name}</h4>
                    <p className="text-gray-300 text-sm">{tech.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Financial Audit Intelligence Platform. Built for modern financial institutions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
