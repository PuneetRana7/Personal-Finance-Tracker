import React from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  Receipt, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Award, 
  Bot, 
  Settings,
  X
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget Setup', icon: Sliders },
  { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
  { id: 'weekly', label: 'Weekly Analysis', icon: TrendingUp },
  { id: 'monthly', label: 'Monthly Analysis', icon: PieChart },
  { id: 'calendar', label: 'Yearly Calendar', icon: Calendar },
  { id: 'score', label: 'Financial Score', icon: Award },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Smart' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Drawer Container (Dark Navy Contrast) */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto lg:h-[calc(100vh-4rem)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 lg:hidden bg-slate-900">
          <span className="font-bold text-white text-lg">Navigation Menu</span>
          <button 
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onMobileClose();
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Helper Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <p className="font-bold text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              50:30:20 Budget Rule
            </p>
            <p className="text-slate-300 text-[11px] leading-snug">
              Needs: 50% | Wants: 30% | Savings: 20%
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
