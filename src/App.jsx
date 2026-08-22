import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { FinanceProvider, useFinanceContext } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage';
import { WeeklyAnalysisPage } from './pages/WeeklyAnalysisPage';
import { MonthlyAnalysisPage } from './pages/MonthlyAnalysisPage';
import { YearlyCalendarPage } from './pages/YearlyCalendarPage';
import { FinancialScorePage } from './pages/FinancialScorePage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { FirstTimeSetupPage } from './pages/FirstTimeSetupPage';
import { Wallet } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading } = useAuthContext();
  const { budget, loading: financeLoading } = useFinanceContext();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
          <Wallet className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Loading Personal Finance Tracker...</p>
      </div>
    );
  }

  // Auth Protection Gate
  if (!user) {
    return <AuthPage onAuthSuccess={() => setActiveTab('dashboard')} />;
  }

  // First-Time User Financial Setup Flow Gate
  const isSetupIncomplete = !budget?.isConfigured && (!budget?.monthlyIncome || budget.monthlyIncome <= 0);

  if (isSetupIncomplete && activeTab !== 'settings') {
    return <FirstTimeSetupPage onComplete={() => setActiveTab('dashboard')} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage 
            setActiveTab={setActiveTab} 
            onOpenAddExpense={() => {
              setActiveTab('expenses');
              setIsAddExpenseModalOpen(true);
            }} 
          />
        );
      case 'budget':
        return <BudgetPage />;
      case 'expenses':
        return (
          <ExpenseTrackerPage 
            isModalOpen={isAddExpenseModalOpen}
            setIsModalOpen={setIsAddExpenseModalOpen}
          />
        );
      case 'weekly':
        return <WeeklyAnalysisPage />;
      case 'monthly':
        return <MonthlyAnalysisPage />;
      case 'calendar':
        return <YearlyCalendarPage />;
      case 'score':
        return <FinancialScorePage />;
      case 'assistant':
        return <AssistantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Right Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
