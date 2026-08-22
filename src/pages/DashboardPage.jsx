import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  TrendingUp,
  Receipt,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { formatReadableDate } from '../utils/dateUtils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Bills: '#f59e0b',
  Education: '#10b981',
  Health: '#ef4444',
  Other: '#64748b',
};

export const DashboardPage = ({ setActiveTab, onOpenAddExpense }) => {
  const { budgetTargets, expenseSummary, expenses, budget } = useFinance();

  // Category breakdown for chart
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || '#64748b',
  }));

  // Type breakdown (Needs vs Wants vs Savings)
  const typeChartData = [
    { name: 'Needs', value: expenseSummary.needsSpent, target: budgetTargets.needsTarget, color: '#2563eb' },
    { name: 'Wants', value: expenseSummary.wantsSpent, target: budgetTargets.wantsTarget, color: '#db2777' },
    { name: 'Savings', value: expenseSummary.savingsSpent, target: budgetTargets.savingsTarget, color: '#059669' },
  ];

  // Recent transactions (Top 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  const budgetUsedPct = budgetTargets.income > 0 
    ? Math.round((expenseSummary.totalExpenses / budgetTargets.income) * 100)
    : 0;

  return (
    <PageContainer
      title="Financial Dashboard"
      subtitle="Real-time summary of your monthly income, 50:30:20 budget progress, and active spending."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('budget')}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Edit Budget
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      }
    >
      {/* Empty State Banner for New Users */}
      {expenses.length === 0 && (
        <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your financial dashboard is ready.</h3>
            <p className="text-xs text-slate-600 mt-0.5">Add your income and first expense to start tracking your finances.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('budget')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Set Up Budget
            </button>
            <button
              onClick={onOpenAddExpense}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* 1. Main Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(budgetTargets.income)}
          subtitle="Total allocated income"
          icon={Wallet}
          color="blue"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(expenseSummary.totalExpenses)}
          subtitle={`${budgetUsedPct}% of monthly budget`}
          icon={ArrowDownRight}
          color={expenseSummary.totalExpenses > budgetTargets.income ? 'rose' : 'amber'}
          percentage={budgetUsedPct}
          statusText={`${budgetUsedPct}% used`}
        />

        <StatCard
          title="Remaining Balance"
          value={formatCurrency(expenseSummary.remainingBalance)}
          subtitle={expenseSummary.remainingBalance >= 0 ? "Under allocated budget" : "Over budget limit"}
          icon={ArrowUpRight}
          color={expenseSummary.remainingBalance >= 0 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="Total Savings"
          value={formatCurrency(expenseSummary.netSavings)}
          subtitle="Target 20% + remaining balance"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* 2. Budget Progress Meters & Human Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 50:30:20 Rule Breakdown Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">50:30:20 Budget Allocation</h2>
              <p className="text-xs text-slate-500">Target allocation vs actual logged spending</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Income: {formatCurrency(budgetTargets.income)}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <ProgressBar
                label={`Needs (50% Target: ${formatCurrency(budgetTargets.needsTarget)})`}
                current={expenseSummary.needsSpent}
                target={budgetTargets.needsTarget}
                color="blue"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500 mt-1">
                <span>Spent: <strong className="text-slate-900">{formatCurrency(expenseSummary.needsSpent)}</strong></span>
                <span>Remaining: <strong className="text-slate-900">{formatCurrency(expenseSummary.needsRemaining)}</strong></span>
              </div>
            </div>

            <div>
              <ProgressBar
                label={`Wants (30% Target: ${formatCurrency(budgetTargets.wantsTarget)})`}
                current={expenseSummary.wantsSpent}
                target={budgetTargets.wantsTarget}
                color="pink"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500 mt-1">
                <span>Spent: <strong className="text-slate-900">{formatCurrency(expenseSummary.wantsSpent)}</strong></span>
                <span>Remaining: <strong className="text-slate-900">{formatCurrency(expenseSummary.wantsRemaining)}</strong></span>
              </div>
            </div>

            <div>
              <ProgressBar
                label={`Savings (20% Target: ${formatCurrency(budgetTargets.savingsTarget)})`}
                current={expenseSummary.savingsSpent}
                target={budgetTargets.savingsTarget}
                color="emerald"
              />
              <div className="flex justify-between text-xs font-medium text-slate-500 mt-1">
                <span>Direct Savings Logged: <strong className="text-slate-900">{formatCurrency(expenseSummary.savingsSpent)}</strong></span>
                <span>Target: <strong className="text-slate-900">{formatCurrency(budgetTargets.savingsTarget)}</strong></span>
              </div>
            </div>
          </div>

          {/* Natural Language Insights Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            {expenseSummary.wantsRemaining >= 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            )}
            <div className="text-xs sm:text-sm text-slate-700">
              {expenseSummary.wantsRemaining >= 0 ? (
                <p>
                  You're <strong className="text-emerald-700 font-bold">{formatCurrency(expenseSummary.wantsRemaining)}</strong> under your monthly wants budget. Keep it up to hit your savings goal!
                </p>
              ) : (
                <p>
                  You're <strong className="text-rose-700 font-bold">{formatCurrency(Math.abs(expenseSummary.wantsRemaining))}</strong> over your monthly wants allocation. Consider reviewing non-essential purchases.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Needs vs Wants vs Savings Donut Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-1">Expense Breakdown</h2>
            <p className="text-xs text-slate-500 mb-4">Distribution by Needs, Wants, & Savings</p>
            
            {(expenseSummary.totalExpenses > 0 || expenseSummary.savingsSpent > 0) ? (
              <div className="h-52 w-full flex items-center justify-center min-h-[200px]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatCurrency(val)} 
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 w-full flex flex-col items-center justify-center text-slate-400 text-xs min-h-[200px]">
                <PieChartIcon className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                <span className="font-semibold text-slate-600">No expense data yet</span>
                <span className="text-slate-400 text-[11px] mt-0.5">Add expenses to see your breakdown!</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {typeChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Category Breakdown & Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category Spending Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Category-Wise Spending</h2>
              <p className="text-xs text-slate-500">Expenses grouped by major category</p>
            </div>
            <button
              onClick={() => setActiveTab('monthly')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Full Analysis →
            </button>
          </div>

          {categoryChartData.length > 0 ? (
            <div className="h-64 w-full pt-2 min-h-[220px]">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(v) => formatCurrency(v)} 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 mb-2 stroke-1" />
              <span>No expenses added yet. Click "Add Expense" to start!</span>
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Expenses</h2>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All ({expenses.length})
              </button>
            </div>

            {recentExpenses.length > 0 ? (
              <div className="space-y-2.5">
                {recentExpenses.map((exp) => (
                  <div 
                    key={exp.id} 
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{exp.category}</span>
                        <span>•</span>
                        <span>{formatReadableDate(exp.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(exp.amount)}
                      </span>
                      <p className={`text-[10px] font-bold ${
                        exp.type === 'Need' ? 'text-blue-600' : exp.type === 'Want' ? 'text-pink-600' : 'text-emerald-600'
                      }`}>
                        {exp.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <span>No recent transactions recorded.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button
              onClick={onOpenAddExpense}
              className="w-full py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              + Log New Transaction
            </button>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
