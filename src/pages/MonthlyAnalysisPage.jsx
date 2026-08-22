import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { PieChart as PieIcon, Wallet, ArrowDownRight, PiggyBank } from 'lucide-react';

export const MonthlyAnalysisPage = () => {
  const { budgetTargets, expenseSummary, expenses } = useFinance();

  // Budget vs Actual Chart Data
  const budgetVsActualData = [
    {
      category: 'Needs',
      Budget: budgetTargets.needsTarget,
      Actual: expenseSummary.needsSpent,
    },
    {
      category: 'Wants',
      Budget: budgetTargets.wantsTarget,
      Actual: expenseSummary.wantsSpent,
    },
    {
      category: 'Savings',
      Budget: budgetTargets.savingsTarget,
      Actual: expenseSummary.savingsSpent,
    },
  ];

  // Category Breakdown Data
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});

  const categoryPieData = Object.keys(categoryTotals).map((cat, idx) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  const COLORS = ['#3b82f6', '#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

  return (
    <PageContainer
      title="Monthly Financial Analysis"
      subtitle="Comprehensive view of monthly budget vs actual spending across Needs, Wants, and Savings."
    >
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(budgetTargets.income)}
          subtitle="Configured income limit"
          icon={Wallet}
          color="blue"
        />

        <StatCard
          title="Total Monthly Spending"
          value={formatCurrency(expenseSummary.totalExpenses)}
          subtitle={`${Math.round((expenseSummary.totalExpenses / (budgetTargets.income || 1)) * 100)}% of income`}
          icon={ArrowDownRight}
          color="amber"
        />

        <StatCard
          title="Remaining Monthly Budget"
          value={formatCurrency(expenseSummary.remainingBalance)}
          subtitle={expenseSummary.remainingBalance >= 0 ? "Under overall budget" : "Over overall budget"}
          icon={PieIcon}
          color={expenseSummary.remainingBalance >= 0 ? "emerald" : "rose"}
        />

        <StatCard
          title="Total Savings Progress"
          value={formatCurrency(expenseSummary.netSavings)}
          subtitle="Includes remaining balance"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* 2. Budget vs Actual Comparison Recharts Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Budget vs Actual Comparison Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Budget vs Actual Spending</h2>
            <p className="text-xs text-slate-500">Allocated budget vs actual spent per 50:30:20 category</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Budget" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Category Share Distribution</h2>
            <p className="text-xs text-slate-500">Proportion of spending across categories</p>
          </div>

          {categoryPieData.length > 0 ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* 3. Detailed Category Progress Meters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          50:30:20 Category Adherence Meters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900">
              <span>Needs Allocation (50%)</span>
              <span>Target: {formatCurrency(budgetTargets.needsTarget)}</span>
            </div>
            <ProgressBar
              label="Spent vs Target"
              current={expenseSummary.needsSpent}
              target={budgetTargets.needsTarget}
              color="blue"
            />
            <p className="text-[11px] text-blue-700">
              Actual Spent: <strong>{formatCurrency(expenseSummary.needsSpent)}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-pink-900">
              <span>Wants Allocation (30%)</span>
              <span>Target: {formatCurrency(budgetTargets.wantsTarget)}</span>
            </div>
            <ProgressBar
              label="Spent vs Target"
              current={expenseSummary.wantsSpent}
              target={budgetTargets.wantsTarget}
              color="pink"
            />
            <p className="text-[11px] text-pink-700">
              Actual Spent: <strong>{formatCurrency(expenseSummary.wantsSpent)}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>Savings Goal (20%)</span>
              <span>Target: {formatCurrency(budgetTargets.savingsTarget)}</span>
            </div>
            <ProgressBar
              label="Target Achievement"
              current={expenseSummary.savingsSpent + (expenseSummary.remainingBalance > 0 ? expenseSummary.remainingBalance : 0)}
              target={budgetTargets.savingsTarget}
              color="emerald"
            />
            <p className="text-[11px] text-emerald-700">
              Direct Saved: <strong>{formatCurrency(expenseSummary.savingsSpent)}</strong>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
