import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const BudgetPage = () => {
  const { budget, budgetTargets, updateBudget } = useFinance();

  const [income, setIncome] = useState(budget.monthlyIncome || 50000);
  const [needsPct, setNeedsPct] = useState(budget.needsPct || 50);
  const [wantsPct, setWantsPct] = useState(budget.wantsPct || 30);
  const [savingsPct, setSavingsPct] = useState(budget.savingsPct || 20);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIncome(budget.monthlyIncome || 50000);
    setNeedsPct(budget.needsPct || 50);
    setWantsPct(budget.wantsPct || 30);
    setSavingsPct(budget.savingsPct || 20);
  }, [budget]);

  const totalPct = Number(needsPct) + Number(wantsPct) + Number(savingsPct);

  const handleSave = async (e) => {
    e.preventDefault();
    if (totalPct !== 100) {
      setErrorMsg(`Total percentage must equal 100%. Currently: ${totalPct}%`);
      return;
    }
    if (income <= 0) {
      setErrorMsg('Please enter a valid monthly income greater than 0.');
      return;
    }

    setErrorMsg('');
    await updateBudget({
      monthlyIncome: Number(income),
      needsPct: Number(needsPct),
      wantsPct: Number(wantsPct),
      savingsPct: Number(savingsPct),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    setNeedsPct(50);
    setWantsPct(30);
    setSavingsPct(20);
    setErrorMsg('');
  };

  const calcNeedsAmount = (income * needsPct) / 100;
  const calcWantsAmount = (income * wantsPct) / 100;
  const calcSavingsAmount = (income * savingsPct) / 100;

  return (
    <PageContainer
      title="Budget Setup (50:30:20 Rule)"
      subtitle="Configure your monthly income and split it into Needs, Wants, and Savings."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Configure Monthly Allocation</h2>
            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to 50:30:20 Standard
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Monthly Income Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Monthly Income (₹)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={income}
                  onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold text-slate-900"
                  placeholder="e.g. 50000"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter your total net take-home salary or monthly income.
              </p>
            </div>

            {/* Percentage Sliders / Inputs */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Custom Category Ratios</h3>

              {/* Needs Ratio */}
              <div className="space-y-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-blue-900">Needs (Essentials & Bills)</span>
                  <span className="text-blue-700 font-bold">{needsPct}% ({formatCurrency(calcNeedsAmount)})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={needsPct}
                  onChange={(e) => setNeedsPct(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[11px] text-blue-800">Rent, groceries, utilities, EMI, health, basic transport.</p>
              </div>

              {/* Wants Ratio */}
              <div className="space-y-2 p-4 rounded-xl bg-pink-50/50 border border-pink-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-pink-900">Wants (Lifestyle & Entertainment)</span>
                  <span className="text-pink-700 font-bold">{wantsPct}% ({formatCurrency(calcWantsAmount)})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={wantsPct}
                  onChange={(e) => setWantsPct(Number(e.target.value))}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
                <p className="text-[11px] text-pink-800">Dining out, hobbies, shopping, trips, subscriptions.</p>
              </div>

              {/* Savings Ratio */}
              <div className="space-y-2 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-emerald-900">Savings & Investments</span>
                  <span className="text-emerald-700 font-bold">{savingsPct}% ({formatCurrency(calcSavingsAmount)})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={savingsPct}
                  onChange={(e) => setSavingsPct(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <p className="text-[11px] text-emerald-800">Emergency funds, mutual funds SIP, fixed deposits, retirement.</p>
              </div>

            </div>

            {/* Error or Total Percentage Warning */}
            {totalPct !== 100 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Total percentage must equal 100%. Currently: {totalPct}% ({totalPct > 100 ? `${totalPct - 100}% over` : `${100 - totalPct}% missing`})</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Budget settings updated successfully in Firestore!</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={totalPct !== 100}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Budget Configuration
              </button>
            </div>

          </form>
        </div>

        {/* Dynamic Preview Card Column */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Calculated Monthly Limits
            </h3>

            <div className="space-y-4">
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-medium text-slate-500 block">Total Income</span>
                <span className="text-xl font-extrabold text-slate-900">{formatCurrency(income)}</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex justify-between items-center text-xs font-semibold text-blue-900">
                  <span>Needs Target ({needsPct}%)</span>
                  <span className="text-blue-700">{formatCurrency(calcNeedsAmount)}</span>
                </div>
                <p className="text-[11px] text-blue-600 mt-1">Monthly cap for essential survival expenses.</p>
              </div>

              <div className="p-4 rounded-xl bg-pink-50 border border-pink-100">
                <div className="flex justify-between items-center text-xs font-semibold text-pink-900">
                  <span>Wants Target ({wantsPct}%)</span>
                  <span className="text-pink-700">{formatCurrency(calcWantsAmount)}</span>
                </div>
                <p className="text-[11px] text-pink-600 mt-1">Monthly limit for fun & non-essential items.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-900">
                  <span>Savings Goal ({savingsPct}%)</span>
                  <span className="text-emerald-700">{formatCurrency(calcSavingsAmount)}</span>
                </div>
                <p className="text-[11px] text-emerald-600 mt-1">Monthly minimum contribution to future wealth.</p>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <p className="font-semibold mb-1">💡 What is the 50:30:20 Rule?</p>
            <p className="text-amber-800 leading-snug">
              It is an intuitive budgeting framework: 50% for Needs, 30% for Wants, and 20% for Savings. Adjust the sliders anytime to suit your personal financial goal.
            </p>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};
