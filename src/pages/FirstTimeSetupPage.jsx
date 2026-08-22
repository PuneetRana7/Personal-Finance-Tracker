import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Wallet, Sparkles, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const FirstTimeSetupPage = ({ onComplete }) => {
  const { updateBudget } = useFinance();

  const [income, setIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [budgetPreference, setBudgetPreference] = useState('503020'); // '503020' or 'custom'
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);
  const [error, setError] = useState('');

  const totalPct = Number(needsPct) + Number(wantsPct) + Number(savingsPct);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numIncome = Number(income);
    if (!income || isNaN(numIncome) || numIncome <= 0) {
      setError('Please enter your monthly income (greater than ₹0).');
      return;
    }

    if (budgetPreference === 'custom' && totalPct !== 100) {
      setError(`Custom ratios must equal 100%. Currently: ${totalPct}%`);
      return;
    }

    let finalNeeds = 50;
    let finalWants = 30;
    let finalSavings = 20;

    if (budgetPreference === 'custom') {
      finalNeeds = Number(needsPct);
      finalWants = Number(wantsPct);
      finalSavings = Number(savingsPct);
    } else if (savingsGoal && Number(savingsGoal) > 0) {
      const goalPct = Math.min(80, Math.max(5, Math.round((Number(savingsGoal) / numIncome) * 100)));
      const remaining = 100 - goalPct;
      finalSavings = goalPct;
      finalNeeds = Math.round(remaining * (50 / 80));
      finalWants = 100 - finalNeeds - finalSavings;
    }

    await updateBudget({
      monthlyIncome: numIncome,
      needsPct: finalNeeds,
      wantsPct: finalWants,
      savingsPct: finalSavings,
      isConfigured: true
    });

    if (onComplete) {
      onComplete();
    }
  };

  const calculatedIncome = Number(income) || 0;
  const previewNeeds = (calculatedIncome * (budgetPreference === 'custom' ? needsPct : 50)) / 100;
  const previewWants = (calculatedIncome * (budgetPreference === 'custom' ? wantsPct : 30)) / 100;
  const previewSavings = (calculatedIncome * (budgetPreference === 'custom' ? savingsPct : 20)) / 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Let's set up your finances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Configure your monthly income and savings target to build your personalized budget engine.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Monthly Income Input */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-900">
              Monthly Income <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="40000"
                className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-bold text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">Enter your net monthly take-home income.</p>
          </div>

          {/* Monthly Savings Goal Input */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-900">
              Monthly Savings Goal (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                placeholder="8000"
                className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-semibold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400">How much would you like to save each month?</p>
          </div>

          {/* Budget Preference Radio Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs sm:text-sm font-bold text-slate-900">
              Budget Preference
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  budgetPreference === '503020' 
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetPref"
                  value="503020"
                  checked={budgetPreference === '503020'}
                  onChange={() => setBudgetPreference('503020')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">50:30:20 Rule</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Standard framework: 50% Needs, 30% Wants, 20% Savings.
                  </span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  budgetPreference === 'custom' 
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="budgetPref"
                  value="custom"
                  checked={budgetPreference === 'custom'}
                  onChange={() => setBudgetPreference('custom')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block">Custom Budget</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Customize your own target percentage allocation.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Sliders (only if Custom is selected) */}
          {budgetPreference === 'custom' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Needs (Essentials)</span>
                  <span>{needsPct}% ({formatCurrency(previewNeeds)})</span>
                </div>
                <input
                  type="range"
                  min="10" max="80" step="5"
                  value={needsPct}
                  onChange={(e) => setNeedsPct(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Wants (Discretionary)</span>
                  <span>{wantsPct}% ({formatCurrency(previewWants)})</span>
                </div>
                <input
                  type="range"
                  min="5" max="60" step="5"
                  value={wantsPct}
                  onChange={(e) => setWantsPct(Number(e.target.value))}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Savings & Investments</span>
                  <span>{savingsPct}% ({formatCurrency(previewSavings)})</span>
                </div>
                <input
                  type="range"
                  min="5" max="60" step="5"
                  value={savingsPct}
                  onChange={(e) => setSavingsPct(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Summary Preview Box */}
          {calculatedIncome > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <span className="text-xs font-bold text-blue-900 block">Calculated Budget Split</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-semibold text-slate-500 block">Needs</span>
                  <span className="font-bold text-blue-700">{formatCurrency(previewNeeds)}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-pink-100">
                  <span className="text-[10px] font-semibold text-slate-500 block">Wants</span>
                  <span className="font-bold text-pink-700">{formatCurrency(previewWants)}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-semibold text-slate-500 block">Savings</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(previewSavings)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>
    </div>
  );
};
