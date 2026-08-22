import React from 'react';
import { Wallet, User, Menu, Sparkles, RotateCcw, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({ activeTab, setActiveTab, onMobileMenuToggle }) => {
  const { user, isDemoMode, resetDemoData, exitDemoMode } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">Personal Finance Tracker</span>
                <p className="hidden md:block text-[11px] text-slate-400 font-normal">
                  Track your income, expenses, budget and savings in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Demo Mode Controls & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isDemoMode && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Demo Mode — </span>Sample Data
                </span>

                <button
                  onClick={resetDemoData}
                  title="Reset to original sample data"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  Reset Demo Data
                </button>

                <button
                  onClick={exitDemoMode}
                  title="Exit Demo Mode and return to Login"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span className="hidden sm:inline">Exit Demo</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-sm border border-slate-700">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {user?.email || 'authenticated'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
