'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

interface QuickAction {
  id: string;
  text: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Audit Assistant powered by real audit data. I can help you with data analysis, compliance checks, risk assessments, and audit processes. How can I assist you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState<string>('');

  const quickActions: QuickAction[] = [
    {
      id: '1',
      text: 'Show customer data',
      description: 'Get information about customer records and KYC status',
      icon: UserIcon
    },
    {
      id: '2',
      text: 'Audit reports',
      description: 'View recent audit reports and findings',
      icon: ChartBarIcon
    },
    {
      id: '3',
      text: 'Compliance status',
      description: 'Check regulatory compliance and filings',
      icon: CheckCircleIcon
    },
    {
      id: '4',
      text: 'Financial data',
      description: 'Access balance sheets, P&L statements, and cash flow',
      icon: ChartBarIcon
    },
    {
      id: '5',
      text: 'Transaction analysis',
      description: 'Analyze journal entries, payments, and trades',
      icon: BoltIcon
    },
    {
      id: '6',
      text: 'System access logs',
      description: 'Review login records and system access history',
      icon: Cog6ToothIcon
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced typewriter effect
  const startTypewriter = (messageId: string, fullText: string) => {
    setTypingMessageId(messageId);
    setTypingText('');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTypingMessageId(null);
        setTypingText('');
      }
    }, 30);
  };

  const handleQuickAction = async (action: QuickAction) => {
    setInputText(action.text);
    await handleSendMessage(action.text);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot/query', {
        query: messageText,
        limit: 5
      }, {
        timeout: 30000
      });

      if (response.data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: response.data.data.response || 'Chatbot functionality coming soon. Please use the dashboard for data queries.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => prev.map(msg => msg.isLoading ? aiMessage : msg));
        
        setTimeout(() => {
          startTypewriter(aiMessage.id, response.data.data.response);
        }, 300);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Error calling RAG API:', error);
      const errorText = `I apologize, but I encountered an error while processing your request. ${error.response?.data?.details || error.message || 'Please try again.'}`;
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        error: 'API Error'
      };
      setMessages(prev => prev.map(msg => msg.isLoading ? errorMessage : msg));
      
      setTimeout(() => {
        startTypewriter(errorMessage.id, errorText);
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputText.trim()) {
      handleSendMessage(inputText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputText.trim()) {
        handleSendMessage(inputText);
      }
    }
  };

  // Format message text with markdown-like formatting
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|•|-\s)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20">
                  <SparklesIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  AI Audit Assistant
                </h1>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Powered by RAG & Real-Time Data
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/landing"
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Chat Interface */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 h-[calc(100vh-12rem)] min-h-[700px] flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] md:max-w-[75%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.isUser
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {message.isUser ? (
                        <UserIcon className="h-5 w-5" />
                      ) : (
                        <SparklesIcon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-5 py-4 shadow-lg ${
                      message.isUser
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-200/80'
                    }`}>
                      {message.isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm font-medium">Analyzing your query...</span>
                        </div>
                      ) : message.error ? (
                        <div className="flex items-start space-x-2">
                          <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-red-600 mb-1">Error</div>
                            <div className="text-sm text-red-500">{message.text}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {typingMessageId === message.id ? (
                            <>
                              {formatMessage(typingText)}
                              <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse"></span>
                            </>
                          ) : (
                            formatMessage(message.text)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-8 pb-4 border-t border-slate-200/60 pt-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="group relative p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left overflow-hidden"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                      <div className="relative flex items-start space-x-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                          <Icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm mb-1">{action.text}</div>
                          <div className="text-xs text-slate-600 line-clamp-2">{action.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Input Area */}
          <div className="border-t border-slate-200/60 p-6 bg-gradient-to-b from-white/80 to-slate-50/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about compliance, transactions, risk assessment, or any audit-related questions..."
                  className="relative w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md text-base placeholder:text-slate-400"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-indigo-500/30 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>Send</span>
              </button>
            </form>

            {isLoading && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-slate-600">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="font-medium">Processing with RAG...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
