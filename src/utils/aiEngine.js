import { formatCurrency } from './formatters';

/**
 * Contextual AI Financial Engine
 * Dynamically analyzes live user financial data (Income, Expenses, Categories, 50:30:20 status)
 * and generates specific, data-grounded responses for arbitrary user questions.
 */
export const generateFinancialAdvice = (queryText, budgetTargets, expenseSummary, expenses = []) => {
  const queryLower = (queryText || '').trim().toLowerCase();
  const totalExpenses = expenseSummary?.totalExpenses || 0;
  const income = budgetTargets?.income || 0;
  const remainingBalance = expenseSummary?.remainingBalance || 0;

  if (!queryLower) {
    return "Please ask a question about your spending, savings, or budget!";
  }

  // 1. Specific Category Spending Check (e.g., "How much did I spend on food?")
  const categoryKeywords = {
    Food: ['food', 'grocery', 'groceries', 'dining', 'swiggy', 'zomato', 'restaurant', 'eat', 'eating', 'lunch', 'dinner'],
    Transport: ['transport', 'travel', 'cab', 'metro', 'bus', 'fuel', 'petrol', 'commute', 'auto', 'uber', 'ola'],
    Shopping: ['shopping', 'clothes', 'sneakers', 'shoes', 'amazon', 'flipkart', 'dress'],
    Entertainment: ['entertainment', 'movie', 'movies', 'game', 'games', 'hobby', 'netflix', 'outing', 'party'],
    Bills: ['bill', 'bills', 'electricity', 'water', 'utility', 'utilities', 'wifi', 'recharge', 'rent'],
    Education: ['education', 'course', 'books', 'tuition', 'fee', 'fees', 'school', 'college'],
    Health: ['health', 'medicine', 'medicines', 'doctor', 'hospital', 'gym', 'fitness', 'medical'],
    Other: ['other', 'misc', 'miscellaneous']
  };

  for (const [catName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      const catExpenses = expenses.filter(e => 
        (e.category && e.category.toLowerCase() === catName.toLowerCase()) ||
        keywords.some(kw => (e.description || '').toLowerCase().includes(kw))
      );
      const catTotal = catExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      const count = catExpenses.length;
      
      if (count === 0) {
        return `You haven't logged any expenses for **${catName}** yet. Your total spending in this category is **₹0**.`;
      }
      const catPct = totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0;
      return `You have spent **${formatCurrency(catTotal)}** on **${catName}** across **${count}** transaction${count > 1 ? 's' : ''}${totalExpenses > 0 ? ` (${catPct}% of your total monthly spending)` : ''}.`;
    }
  }

  // 2. Total spent this month ("How much did I spend this month?")
  if (queryLower.includes('how much did i spend') || queryLower.includes('total spend') || queryLower.includes('total spent') || queryLower.includes('spent this month') || queryLower.includes('overall spent')) {
    if (expenses.length === 0) {
      return "You haven't recorded any expenses yet for this month! Click **Add Expense** to start tracking.";
    }
    return `So far this month, you have spent a total of **${formatCurrency(totalExpenses)}** across **${expenses.length}** transactions.
- **Needs (Essentials)**: ${formatCurrency(expenseSummary.needsSpent || 0)}
- **Wants (Discretionary)**: ${formatCurrency(expenseSummary.wantsSpent || 0)}
- **Direct Savings**: ${formatCurrency(expenseSummary.savingsSpent || 0)}

${income > 0 ? `Your remaining balance is **${formatCurrency(remainingBalance)}** out of your ${formatCurrency(income)} income.` : ''}`;
  }

  // 3. Where am I spending the most? ("Where am I spending the most?")
  if (queryLower.includes('where am i spending') || queryLower.includes('most') || queryLower.includes('highest spending') || queryLower.includes('top category') || queryLower.includes('biggest expense')) {
    if (expenses.length === 0) {
      return "You haven't logged any expenses yet! Once you add transactions, I'll identify your highest spending categories.";
    }
    const categoryTotals = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
      return acc;
    }, {});

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const [topCat, topAmount] = sorted[0];
    const topPct = totalExpenses > 0 ? Math.round((topAmount / totalExpenses) * 100) : 0;
    const secondCat = sorted[1] ? `${sorted[1][0]} (${formatCurrency(sorted[1][1])})` : null;

    return `Your highest spending category is **${topCat}**, where you've spent **${formatCurrency(topAmount)}** (${topPct}% of total expenses). ${secondCat ? `Your second highest category is **${secondCat}**.` : ''} Reviewing purchases in ${topCat} is a great way to optimize your budget.`;
  }

  // 4. Am I overspending? ("Am I overspending?")
  if (queryLower.includes('overspend') || queryLower.includes('over budget') || queryLower.includes('spending too much')) {
    if (income <= 0) {
      return "Please set up your monthly income first so I can analyze whether you are overspending!";
    }
    const wantsSpent = expenseSummary.wantsSpent || 0;
    const wantsTarget = budgetTargets.wantsTarget || 0;

    if (totalExpenses > income) {
      return `⚠️ **Yes, you are overspending overall.** Your total spending of **${formatCurrency(totalExpenses)}** exceeds your monthly income of **${formatCurrency(income)}** by **${formatCurrency(totalExpenses - income)}**. Pause non-essential purchases immediately to regain balance.`;
    }

    if (wantsTarget > 0 && wantsSpent > wantsTarget) {
      return `⚠️ **You are overspending in your Wants category.** You've spent **${formatCurrency(wantsSpent)}** against your 30% target limit of **${formatCurrency(wantsTarget)}** (over by **${formatCurrency(wantsSpent - wantsTarget)}**). Your total spending is still under your income limit, but trimming Wants will protect your savings goal.`;
    }

    return `✅ **No, you are on track!** Your total monthly spending of **${formatCurrency(totalExpenses)}** is safely within your income limit of **${formatCurrency(income)}**, leaving a positive balance of **${formatCurrency(remainingBalance)}**.`;
  }

  // 5. How much can I save? / Savings advice
  if (queryLower.includes('how much can i save') || queryLower.includes('savings goal') || queryLower.includes('savings progress') || queryLower.includes('how much to save') || queryLower.includes('saving')) {
    const savingsTarget = budgetTargets.savingsTarget || 0;
    const savingsSpent = expenseSummary.savingsSpent || 0;
    const netSavings = expenseSummary.netSavings || 0;

    if (income <= 0) {
      return "Set your monthly income in Budget Setup to calculate your recommended 20% savings target!";
    }

    return `Target 20% Monthly Savings Goal: **${formatCurrency(savingsTarget)}**.
- **Direct Savings Investments Logged**: ${formatCurrency(savingsSpent)}
- **Remaining Unspent Balance**: ${formatCurrency(remainingBalance)}
- **Estimated Net Savings Potential**: **${formatCurrency(netSavings)}**

${remainingBalance > 0 ? `Tip: Transfer your remaining balance of **${formatCurrency(remainingBalance)}** into an automated SIP or high-yield savings account!` : `Note: You are currently spending up to your income limit. Reduce Wants to unlock more savings.`}`;
  }

  // 6. Remaining budget / balance ("What is my remaining budget?")
  if (queryLower.includes('remaining budget') || queryLower.includes('remaining balance') || queryLower.includes('balance left') || queryLower.includes('how much left') || queryLower.includes('money left')) {
    if (income <= 0) {
      return "Please set up your monthly income to track your remaining budget!";
    }
    return `Your total remaining monthly balance is **${formatCurrency(remainingBalance)}** (out of ${formatCurrency(income)} total income).
- **Needs Budget Remaining**: ${formatCurrency(expenseSummary.needsRemaining || 0)}
- **Wants Budget Remaining**: ${formatCurrency(expenseSummary.wantsRemaining || 0)}`;
  }

  // 7. Ways to reduce expenses ("Give me some ways to reduce my expenses")
  if (queryLower.includes('reduce') || queryLower.includes('cut back') || queryLower.includes('cut cost') || queryLower.includes('save money') || queryLower.includes('ways to reduce')) {
    const wantsExpenses = expenses.filter(e => e.type === 'Want');
    const catMap = wantsExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
      return acc;
    }, {});

    const sortedWants = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    if (sortedWants.length > 0) {
      return `Here are practical ways to reduce your expenses based on your data:
1. **Target ${sortedWants[0][0]}**: You have spent **${formatCurrency(sortedWants[0][1])}** on discretionary ${sortedWants[0][0]}. Trimming 20% here will instantly save **${formatCurrency(sortedWants[0][1] * 0.2)}**.
${sortedWants[1] ? `2. **Review ${sortedWants[1][0]}**: You spent **${formatCurrency(sortedWants[1][1])}** here. Consider looking for discounts or alternatives.` : ''}
3. **Use the 24-Hour Rule**: Wait 24 hours before making non-essential purchases over ₹1,000 to prevent impulse buys.`;
    }

    return `Here are top actionable strategies to cut expenses:
1. **Track Discretionary Spending**: Ensure non-essential purchases stay within 30% of your net income.
2. **Audit Utility Subscriptions**: Cancel unused streaming or digital subscriptions.
3. **Plan Meals & Groceries**: Buy bulk groceries to prevent frequent food delivery orders.`;
  }

  // 8. Educational Topic: SIP (Systematic Investment Plan)
  if (queryLower.includes('sip') || queryLower.includes('systematic investment')) {
    return `💡 **What is a SIP (Systematic Investment Plan)?**
A SIP allows you to invest a fixed amount regularly (e.g., monthly) into a mutual fund rather than making a single lump-sum investment.

**Key Benefits:**
- **Rupee Cost Averaging**: You buy more units when prices are low and fewer units when prices are high.
- **Disciplined Investing**: Automates regular monthly wealth building.
- **Power of Compounding**: Small, consistent contributions grow exponentially over long periods.

${remainingBalance > 0 ? `*Context for your account:* You currently have **${formatCurrency(remainingBalance)}** in remaining monthly balance that could be allocated towards automated investments.` : ''}
*Note: Educational information only. Mutual fund investments are subject to market risks.*`;
  }

  // 9. Educational Topic: Saving vs Investing
  if (queryLower.includes('saving vs investing') || queryLower.includes('savings vs investment') || queryLower.includes('difference between saving and investing') || (queryLower.includes('saving') && queryLower.includes('investing'))) {
    return `📊 **Saving vs. Investing — Key Differences:**

1. **Saving**:
   - **Goal**: Capital preservation and short-term liquidity.
   - **Where**: Savings accounts, fixed deposits (FDs), emergency funds.
   - **Risk**: Very low, but may lose purchasing power against inflation.

2. **Investing**:
   - **Goal**: Long-term wealth creation and outpacing inflation.
   - **Where**: Index funds, mutual funds, stocks, bonds, real estate.
   - **Risk**: Variable short-term risk with higher long-term growth potential.

**Golden Rule:** Build an Emergency Fund first (3–6 months of Needs), then invest surplus savings for long-term goals.`;
  }

  // 10. Educational Topic: Diversification
  if (queryLower.includes('diversif')) {
    return `🛡️ **What is Diversification?**
Diversification means spreading your investments across different asset classes (equity, debt, gold, real estate) and sectors to reduce risk.

**Why it matters:**
- If one company or market sector underperforms, gains in other assets help cushion your overall portfolio.
- *"Don't put all your eggs in one basket."*
- Combining equities for growth with fixed income for stability builds a resilient portfolio.

*Note: Educational information only. Tailor asset allocation to your personal risk tolerance.*`;
  }

  // 11. Educational Topic: Compound Interest
  if (queryLower.includes('compound') || queryLower.includes('compounding')) {
    return `📈 **What is Compound Interest?**
Compound interest is earning interest on both your initial principal amount AND on the interest accumulated from previous periods.

**Why Time is Key:**
- Year 1: Interest earned on Principal.
- Year 5: Interest earned on Principal + 4 years of accumulated growth.
- Starting 5 years earlier can double your eventual retirement fund due to exponential compounding growth.

**Albert Einstein:** *"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."*`;
  }

  // 12. Educational Topic: Mutual Funds
  if (queryLower.includes('mutual fund') || queryLower.includes('mutual funds')) {
    return `🏢 **What are Mutual Funds?**
A mutual fund pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or money market instruments managed by professional fund managers.

**Main Types:**
- **Equity Funds**: Invest in company stocks for long-term growth.
- **Debt Funds**: Invest in government and corporate bonds for income and stability.
- **Hybrid Funds**: Mix both equity and debt for balanced growth.

*Note: Past performance is not indicative of future returns. Review fund riskometers before investing.*`;
  }

  // 13. Educational Topic: Index Funds
  if (queryLower.includes('index fund') || queryLower.includes('nifty 50') || queryLower.includes('s&p 500')) {
    return `📉 **What is an Index Fund?**
An index fund is a passive mutual fund or ETF designed to match the components and performance of a market benchmark (such as the Nifty 50 or S&P 500).

**Why Investors Choose Index Funds:**
- **Low Expense Ratio**: Lower management fees because there is no active stock-picker manager.
- **Broad Market Coverage**: Instantly owns the top companies in the index.
- **Historical Performance**: Historically outperforms many actively managed funds over 10+ year horizons.`;
  }

  // 14. Educational Topic: Stocks / Equities
  if (queryLower.includes('stock') || queryLower.includes('shares') || queryLower.includes('equity') || queryLower.includes('equities')) {
    return `📈 **What are Stocks (Equities)?**
Buying a stock means purchasing a fractional ownership share in a publicly listed company.

**Characteristics:**
- **Growth Potential**: Offers high potential returns through share price appreciation and dividends over long horizons.
- **Volatility**: Prices fluctuate daily based on market sentiment, company earnings, and economic indicators.
- **Ideal Horizon**: Best suited for long-term financial goals (5+ years).

*Note: Educational guide only. Avoid day-trading without research.*`;
  }

  // 15. Educational Topic: ETFs (Exchange-Traded Funds)
  if (queryLower.includes('etf') || queryLower.includes('exchange traded')) {
    return `⚡ **What is an ETF (Exchange-Traded Fund)?**
An ETF is a basket of securities (stocks, commodities, or bonds) that trades on a stock exchange throughout the day just like an individual stock.

**ETFs vs. Mutual Funds:**
- **Real-Time Trading**: ETFs are bought/sold at live market prices during exchange hours.
- **Low Cost**: Generally feature low expense ratios similar to index funds.
- **Requires Demat Account**: Traded through a stock brokerage account.`;
  }

  // 16. Educational Topic: Bonds / Fixed Income
  if (queryLower.includes('bond') || queryLower.includes('debenture') || queryLower.includes('fixed income')) {
    return `🏛️ **What are Bonds (Debt Instruments)?**
A bond is a fixed-income loan made by an investor to a borrower (government or corporation). In return, the borrower pays periodic interest (coupon) and returns the principal at maturity.

**Role in Portfolio:**
- **Capital Protection**: Lower risk than equities.
- **Regular Cash Flow**: Provides predictable interest income.
- **Stability**: Balances equity volatility in a diversified portfolio.`;
  }

  // 17. Educational Topic: PPF & NPS
  if (queryLower.includes('ppf') || queryLower.includes('nps') || queryLower.includes('provident fund') || queryLower.includes('pension system')) {
    return `📜 **PPF vs. NPS — Government Backed Savings:**

1. **PPF (Public Provident Fund)**:
   - **Nature**: Fixed-income government scheme with guaranteed tax-free interest.
   - **Tenure**: 15-year lock-in with EEE (Exempt-Exempt-Exempt) tax status.
   - **Best For**: Safe, guaranteed long-term debt savings.

2. **NPS (National Pension System)**:
   - **Nature**: Market-linked retirement scheme with exposure to equity (E), corporate bonds (C), and government securities (G).
   - **Tenure**: Locked in until age 60.
   - **Tax Benefit**: Additional tax deduction under Section 80CCD(1B).`;
  }

  // 18. Educational Topic: Risk vs Return
  if (queryLower.includes('risk vs return') || queryLower.includes('risk and return') || queryLower.includes('risk profile')) {
    return `⚖️ **Risk vs. Return Tradeoff:**
In financial markets, higher potential returns always come with higher short-term risk and price fluctuations.

- **Low Risk / Low Return**: Savings accounts, FDs, PPF, short-term debt funds.
- **Moderate Risk / Moderate Return**: Hybrid funds, corporate bonds, index funds.
- **Higher Risk / Higher Potential Return**: Individual stocks, small-cap equity funds.

**Recommendation:** Match asset choices to your investment timeframe. Money needed in <3 years belongs in low-risk accounts; long-term money (5+ years) can tolerate equity volatility.`;
  }

  // 19. Educational Topic: Emergency Funds
  if (queryLower.includes('emergency fund') || queryLower.includes('contingency fund')) {
    const needsSpent = expenseSummary?.needsSpent || 0;
    const recommended3M = needsSpent > 0 ? needsSpent * 3 : income * 1.5;
    const recommended6M = needsSpent > 0 ? needsSpent * 6 : income * 3;

    return `🚨 **What is an Emergency Fund?**
An emergency fund is a liquid cash reserve reserved exclusively for unexpected financial crises (medical emergencies, sudden job loss, urgent repairs).

**Rule of Thumb:**
- **3 to 6 Months of Essential Needs**: Store in high-yield savings accounts or liquid mutual funds.
${needsSpent > 0 ? `- Based on your monthly Needs spending of **${formatCurrency(needsSpent)}**, your recommended emergency fund is **${formatCurrency(recommended3M)}** to **${formatCurrency(recommended6M)}**.` : ''}

**Crucial Benefit:** Having an emergency fund prevents you from selling long-term investments at a loss during market downturns.`;
  }

  // Default intelligent fallback based on user data
  return `Based on your live financial summary:
- **Monthly Income**: ${formatCurrency(income)}
- **Total Spent**: ${formatCurrency(totalExpenses)} (${expenses.length} transactions)
- **Remaining Balance**: ${formatCurrency(remainingBalance)}

Feel free to ask me questions like:
- *"What is SIP?"*
- *"Saving vs Investing"*
- *"What is diversification?"*
- *"What is compound interest?"*
- *"How much did I spend on food?"*
- *"Where am I spending the most?"*
- *"What are Index Funds or ETFs?"*`;
};
