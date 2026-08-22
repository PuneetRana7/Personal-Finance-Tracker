import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { Award, CheckCircle2, AlertCircle, Info, Sparkles, TrendingUp } from 'lucide-react';

export const FinancialScorePage = () => {
  const { financialScore, budgetTargets, expenseSummary } = useFinance();
  const { totalScore, grade, label, factors } = financialScore;

  let scoreBg = 'bg-blue-600';
  let scoreText = 'text-blue-600';
  if (totalScore < 50) { scoreBg = 'bg-rose-500'; scoreText = 'text-rose-600'; }
  else if (totalScore < 70) { scoreBg = 'bg-amber-500'; scoreText = 'text-amber-600'; }
  else if (totalScore < 85) { scoreBg = 'bg-blue-600'; scoreText = 'text-blue-600'; }
  else { scoreBg = 'bg-emerald-600'; scoreText = 'text-emerald-600'; }

  return (
    <PageContainer
      title="Financial Health Score"
      subtitle="Comprehensive 100-point rating based on your budget discipline, savings rate, and spending balance."
    >
      {/* 1. Score Gauge Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Score Gauge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * totalScore) / 100}
                className={`${scoreText} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{totalScore}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">out of 100</span>
            </div>
          </div>

          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${scoreBg}`}>
              Grade {grade}: {label}
            </span>
          </div>
        </div>

        {/* Right Score Breakdown Summary */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Financial Discipline Rating</h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculated dynamically using your active monthly income of <strong className="text-slate-800">{formatCurrency(budgetTargets.income)}</strong> and real recorded transactions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 block">Total Expenses</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(expenseSummary.totalExpenses)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 block">Net Savings</span>
              <span className="text-sm font-bold text-emerald-600">{formatCurrency(expenseSummary.netSavings)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 block">Wants Spent</span>
              <span className="text-sm font-bold text-pink-600">{formatCurrency(expenseSummary.wantsSpent)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Factor Breakdown & Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Score Factor Analysis (How your score is calculated)
        </h2>

        <div className="space-y-4">
          {factors.map((factor) => {
            const pct = Math.round((factor.score / factor.max) * 100);
            return (
              <div key={factor.name} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-900">{factor.name}</span>
                  <span className="text-blue-700 font-extrabold">{factor.score} / {factor.max} pts ({pct}%)</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>

                <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{factor.feedback}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Actionable Recommendations */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-950">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Tips to boost your score to 90+</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Keep total expenses strictly under your total income allocation ({formatCurrency(budgetTargets.income)}).</li>
          <li>Cap discretionary "Wants" spending under 30% ({formatCurrency(budgetTargets.wantsTarget)}).</li>
          <li>Maintain automated monthly SIP or direct savings transfers at the start of the month.</li>
        </ul>
      </div>
    </PageContainer>
  );
};
