import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { getCurrentWeekRange, filterExpensesByDateRange, formatReadableDate } from '../utils/dateUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export const WeeklyAnalysisPage = () => {
  const { expenses, budgetTargets } = useFinance();
  const { startStr, endStr, monday, sunday } = getCurrentWeekRange();

  // Filter current week's expenses
  const weeklyExpenses = filterExpensesByDateRange(expenses, startStr, endStr);

  const totalWeeklySpent = weeklyExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  
  // Weekly budget = Monthly income / 4.33
  const weeklyBudget = budgetTargets.income > 0 ? Math.round(budgetTargets.income / 4.33) : 0;
  const remainingWeeklyBudget = weeklyBudget - totalWeeklySpent;

  // Build daily spending breakdown (Monday to Sunday)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyDataMap = {};
  
  // Initialize days
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    dailyDataMap[iso] = {
      dayLabel: daysOfWeek[i],
      dateStr: iso,
      total: 0,
      expenses: []
    };
  }

  weeklyExpenses.forEach(exp => {
    if (dailyDataMap[exp.date]) {
      dailyDataMap[exp.date].total += Number(exp.amount || 0);
      dailyDataMap[exp.date].expenses.push(exp);
    }
  });

  const dailyChartData = Object.values(dailyDataMap);

  // Highest spending day
  let highestDay = { dayLabel: 'None', total: 0 };
  dailyChartData.forEach(d => {
    if (d.total > highestDay.total) {
      highestDay = d;
    }
  });

  // Category breakdown for current week
  const weeklyCategoryTotals = weeklyExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  return (
    <PageContainer
      title="Weekly Spending Analysis"
      subtitle={`Current week tracking (${formatReadableDate(startStr)} - ${formatReadableDate(endStr)})`}
    >
      {/* 1. Stat Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Weekly Spending"
          value={formatCurrency(totalWeeklySpent)}
          subtitle="Spent in current 7-day period"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="Allocated Weekly Budget"
          value={formatCurrency(weeklyBudget)}
          subtitle="Monthly Income ÷ 4.33 weeks"
          icon={Calendar}
          color="emerald"
        />

        <StatCard
          title="Remaining Weekly Budget"
          value={formatCurrency(remainingWeeklyBudget)}
          subtitle={remainingWeeklyBudget >= 0 ? "Under weekly allocation" : "Over weekly limit"}
          icon={remainingWeeklyBudget >= 0 ? CheckCircle : AlertTriangle}
          color={remainingWeeklyBudget >= 0 ? "emerald" : "rose"}
        />

        <StatCard
          title="Highest Spending Day"
          value={highestDay.total > 0 ? `${highestDay.dayLabel}` : 'N/A'}
          subtitle={highestDay.total > 0 ? `${formatCurrency(highestDay.total)} spent` : 'No expenses logged'}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* 2. Daily Spending Recharts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Spending Trend (Mon - Sun)</h2>
              <p className="text-xs text-slate-500">Breakdown of expenses logged per day</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              Week Target: {formatCurrency(weeklyBudget)}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(val) => formatCurrency(val)} 
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {dailyChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.dayLabel === highestDay.dayLabel && entry.total > 0 ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Natural language weekly callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center justify-between">
            <span>
              {remainingWeeklyBudget >= 0 
                ? `You're ${formatCurrency(remainingWeeklyBudget)} under your target budget for this week.`
                : `You've exceeded your target weekly budget by ${formatCurrency(Math.abs(remainingWeeklyBudget))}.`}
            </span>
            {highestDay.total > 0 && (
              <span className="text-amber-800 font-semibold shrink-0 ml-2">
                Peak: {highestDay.dayLabel} ({formatCurrency(highestDay.total)})
              </span>
            )}
          </div>
        </div>

        {/* Weekly Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Weekly Categories</h2>
            <p className="text-xs text-slate-500 mb-4">Where your money went this week</p>

            {Object.keys(weeklyCategoryTotals).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(weeklyCategoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amt]) => {
                    const pct = Math.round((amt / (totalWeeklySpent || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{cat}</span>
                          <span className="text-slate-900">{formatCurrency(amt)} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No expenses logged for this week yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
            {weeklyExpenses.length} total transactions this week
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
