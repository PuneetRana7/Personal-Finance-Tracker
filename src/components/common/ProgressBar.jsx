import React from 'react';

export const ProgressBar = ({ label, current, target, percentage, color = 'blue' }) => {
  const percentVal = percentage !== undefined 
    ? percentage 
    : target > 0 ? Math.round((current / target) * 100) : 0;

  const isOver = percentVal > 100;

  const barColors = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
  }[color] || 'bg-blue-600';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-bold text-slate-800">{label}</span>
        <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>
          {percentVal}% {isOver && <span className="text-rose-600 text-xs font-bold ml-1">(Over Limit)</span>}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-600' : barColors}`}
          style={{ width: `${Math.min(100, Math.max(0, percentVal))}%` }}
        />
      </div>
    </div>
  );
};
