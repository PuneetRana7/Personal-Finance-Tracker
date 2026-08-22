/**
 * Financial calculation utilities for 50:30:20 rule, budget progress,
 * and financial health scoring.
 */

// Calculate target budget amounts based on income and percentage breakdown
export const calculateBudgetTargets = (income = 0, needsPct = 50, wantsPct = 30, savingsPct = 20) => {
  const inc = Number(income) || 0;
  const needsTarget = (inc * needsPct) / 100;
  const wantsTarget = (inc * wantsPct) / 100;
  const savingsTarget = (inc * savingsPct) / 100;

  return {
    income: inc,
    needsTarget,
    wantsTarget,
    savingsTarget,
    needsPct,
    wantsPct,
    savingsPct,
  };
};

// Calculate summary totals from an expense list
export const calculateExpenseSummary = (expenses = [], budgetTargets = {}) => {
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const needsSpent = expenses
    .filter((e) => e.type === 'Need')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const wantsSpent = expenses
    .filter((e) => e.type === 'Want')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const savingsSpent = expenses
    .filter((e) => e.type === 'Saving')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const income = budgetTargets.income || 0;
  const remainingBalance = income - totalExpenses;

  // Actual total savings = Savings target - Overspending or direct savings entries
  const netSavings = (budgetTargets.savingsTarget || 0) + (remainingBalance > 0 ? 0 : remainingBalance) + savingsSpent;

  return {
    totalExpenses,
    needsSpent,
    wantsSpent,
    savingsSpent,
    remainingBalance,
    netSavings,
    needsRemaining: (budgetTargets.needsTarget || 0) - needsSpent,
    wantsRemaining: (budgetTargets.wantsTarget || 0) - wantsSpent,
    savingsRemaining: (budgetTargets.savingsTarget || 0) - savingsSpent,
  };
};

// Calculate Financial Health Score (out of 100)
export const calculateFinancialScore = (income = 0, summary = {}, targets = {}) => {
  if (!income || income <= 0) {
    return {
      totalScore: 50,
      grade: 'C',
      label: 'Getting Started',
      factors: [
        { name: 'Budget Adherence', score: 20, max: 40, feedback: 'Set up your monthly income to get accurate scoring.' },
        { name: 'Savings Performance', score: 15, max: 30, feedback: 'Log your budget details to track savings.' },
        { name: 'Needs vs Wants Balance', score: 15, max: 30, feedback: 'Categorize expenses as Need, Want, or Saving.' },
      ],
    };
  }

  // 1. Budget Adherence Score (Max 40 points)
  let budgetScore = 40;
  const totalSpent = summary.totalExpenses || 0;
  if (totalSpent > income) {
    const overspendRatio = (totalSpent - income) / income;
    budgetScore = Math.max(0, Math.round(40 - overspendRatio * 100));
  }

  // 2. Savings Performance (Max 30 points)
  let savingsScore = 30;
  const savingsTarget = targets.savingsTarget || income * 0.2;
  const actualSaved = (summary.remainingBalance > 0 ? summary.remainingBalance : 0) + (summary.savingsSpent || 0);
  if (savingsTarget > 0) {
    const savingsRatio = actualSaved / savingsTarget;
    savingsScore = Math.min(30, Math.max(0, Math.round(savingsRatio * 30)));
  }

  // 3. Needs vs Wants Balance (Max 30 points)
  let balanceScore = 30;
  const wantsTarget = targets.wantsTarget || income * 0.3;
  const wantsSpent = summary.wantsSpent || 0;
  if (wantsSpent > wantsTarget) {
    const overWantsRatio = (wantsSpent - wantsTarget) / (wantsTarget || 1);
    balanceScore = Math.max(0, Math.round(30 - overWantsRatio * 50));
  }

  const totalScore = Math.min(100, Math.max(0, budgetScore + savingsScore + balanceScore));

  let grade = 'A';
  let label = 'Excellent';
  if (totalScore < 50) { grade = 'D'; label = 'Needs Attention'; }
  else if (totalScore < 70) { grade = 'C'; label = 'Fair'; }
  else if (totalScore < 85) { grade = 'B'; label = 'Good'; }

  return {
    totalScore,
    grade,
    label,
    factors: [
      {
        name: 'Budget Adherence',
        score: budgetScore,
        max: 40,
        feedback: totalSpent <= income 
          ? 'Great job keeping total expenses within your overall income!' 
          : `You are spending ${Math.round(((totalSpent - income) / income) * 100)}% over your income.`,
      },
      {
        name: 'Savings Performance',
        score: savingsScore,
        max: 30,
        feedback: actualSaved >= savingsTarget
          ? 'On track to meet or exceed your savings goal this month!'
          : `Savings are lower than your target by ${Math.round(savingsTarget - actualSaved)}.`,
      },
      {
        name: 'Needs vs Wants Balance',
        score: balanceScore,
        max: 30,
        feedback: wantsSpent <= wantsTarget
          ? 'Wants spending is well-controlled under your allocated budget.'
          : 'Overspending detected in Wants category. Try reducing discretionary purchases.',
      },
    ],
  };
};
