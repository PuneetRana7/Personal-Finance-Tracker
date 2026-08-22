import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useFinance } from '../hooks/useFinance';
import { generateFinancialAdvice } from '../utils/aiEngine';
import { formatCurrency } from '../utils/formatters';
import { Bot, Send, Sparkles, User, HelpCircle, RefreshCw } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What is SIP?",
  "Saving vs Investing",
  "What is diversification?",
  "What is compound interest?",
  "Emergency funds",
  "How much did I spend this month?",
  "Where am I spending the most?",
  "How much did I spend on food?",
];

export const AssistantPage = () => {
  const { budgetTargets, expenseSummary, expenses } = useFinance();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I'm your AI Financial Advisor. I analyze your real 50:30:20 budget, active transactions, and offer general financial & investment education. How can I help you manage your finances today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate contextual AI advice based on real user finance data & educational topics
    setTimeout(() => {
      const responseText = generateFinancialAdvice(query, budgetTargets, expenseSummary, expenses);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <PageContainer
      title="AI Financial Assistant"
      subtitle="Smart, data-driven financial advice grounded in your actual transactions + financial concepts education."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Interface Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[580px]">
          
          {/* Header (Dark Navy Contrast) */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">AI Financial Advisor</h2>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Data Analytics & Educational Engine
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-md rounded-2xl p-4 text-xs sm:text-sm space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                }`}>
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>
                  <span className={`block text-[10px] text-right mt-1 ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Quick-Question Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Quick Questions:</span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shrink-0 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your spending, budget, or concepts like SIP, Index Funds, Compound Interest..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Live Context Data Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Active Financial Context
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Monthly Income</span>
                <span className="font-bold text-slate-900">{formatCurrency(budgetTargets.income)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Total Spent</span>
                <span className="font-bold text-slate-900">{formatCurrency(expenseSummary.totalExpenses)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Wants Spent vs Cap</span>
                <span className="font-bold text-pink-600">
                  {formatCurrency(expenseSummary.wantsSpent)} / {formatCurrency(budgetTargets.wantsTarget)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-bold text-emerald-600">{formatCurrency(expenseSummary.remainingBalance)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-blue-400">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              How it works
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              This AI assistant combines live calculations from your active expenses with an educational knowledge base (SIP, Mutual Funds, Stocks, Diversification, Emergency Funds).
            </p>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
