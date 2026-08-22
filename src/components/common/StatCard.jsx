import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', percentage, statusText }) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', fill: 'bg-blue-600' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', fill: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', fill: 'bg-amber-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', fill: 'bg-rose-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20', fill: 'bg-purple-600' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20', fill: 'bg-indigo-600' },
  }[color] || { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', fill: 'bg-blue-600' };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
          {Icon && (
            <div className={`w-10 h-10 rounded-xl ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} border flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h2>
          {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      {percentage !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mr-3">
            <div 
              className={`h-full rounded-full ${colorStyles.fill} transition-all duration-500`} 
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} 
            />
          </div>
          {statusText && <span className="text-[11px] font-bold text-slate-700 shrink-0">{statusText}</span>}
        </div>
      )}
    </div>
  );
};
