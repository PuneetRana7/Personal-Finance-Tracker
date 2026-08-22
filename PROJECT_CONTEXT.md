# Project Context: Personal Finance Tracker

## 1. Project Purpose
A user-input-driven **Personal Finance Tracker** web application designed for students and developers. Translates Excel-based financial logic (50:30:20 rule, budget progress, weekly/monthly visual analysis, calendar heatmaps, financial health score, and contextual AI financial advisory) into an intuitive, modern React web application.

---

## 2. Technical Stack
- **Frontend Framework**: React 18 (Vite, JSX)
- **Styling**: Tailwind CSS (Clean, readable, professional UI without excessive gradients or template clutter)
- **Database & Authentication**: Firebase Auth (Email/Password + Google Sign-In with exported `updateProfile`) + local account validation & session persistence + Firestore DB (isolated per authenticated user UID) + isolated Demo Account scope (`demo_user`)
- **Data Visualization**: Recharts (Responsive bar charts, donut charts, budget vs actual comparisons, live filtered distribution charts)
- **Icons**: Lucide React
- **Build Tool**: Vite (`npm run dev`, `npm run build`)

---

## 3. Core Features & Navigation Architecture
1. **Authentication Flow & Validation**: Login & Signup screens with password visibility toggle, desktop showcase panel highlighting 50:30:20 allocation & analytics features, and responsive design. Supporting Email, Password, and Google Sign-In. Unregistered logins are blocked with `"Account not found. Please sign up first."` with quick navigation to Signup.
2. **Demo Mode / Demo Account**: One-click **"Try Demo Account"** entry point loading realistic sample financial data (Demo User, ₹50k income, 50:30:20 budget, 10 category-distributed transactions across recent dates). Fully integrated with Dashboard, Expense Tracker, Filters, Charts, Financial Health Score, and AI Financial Assistant. Features `"Demo Mode — Sample Data"` badge, **Reset Demo Data**, and **Exit Demo Mode** controls with strict isolation from real user accounts.
3. **Dashboard**: Live financial overview with 4 summary cards (Monthly Income, Total Expenses, Remaining Balance, Total Savings), 50:30:20 allocation progress meters, and explicit Recharts container sizing. Includes robust empty states (`PieChartIcon` & `Receipt` empty state fallback cards) when zero expenses are logged, preventing rendering glitches. Starting with ₹0 empty default for real users, or calculated demo metrics in Demo Mode.
4. **Expense Tracker with Real-Time Multi-Filtering**: Full expense CRUD (Add, Edit, Delete) with real-time Dual-Ended Amount Slider (Min & Max ₹), Category Filter, Date Range (From/To), Payment Mode, Type, Text Search, **"Clear Filters"** button, and live filtered category charts.
5. **Educational AI Financial Assistant**: Smart advisor combining live user data analysis (spending, budget targets, remaining balance) with comprehensive general financial education (SIP, Mutual Funds, Index Funds, Stocks, ETFs, Bonds, PPF/NPS, Diversification, Compound Interest, Risk vs Return, Saving vs Investing, Emergency Funds) and interactive quick-question buttons.
6. **Settings & Data Management**: User session sign out, backup export (.json), Firestore security rules reference, **Reset Demo Data**, **Exit Demo Mode**, and optional **"Load Sample Data"** trigger.
7. **UI Theme & Professional Finance + Analytics Backdrop**: Light-first theme with a low-opacity SVG backdrop mixture in `index.css`:
   - Technical 50px grid with dotted intersections (`fill-slate-400` opacity `0.4`).
   - Smooth Bézier trend line curves with soft blue gradient area overlays (`stop-color-blue-500` opacity `0.08`).
   - Mini stock candlestick indicators (`fill-emerald-600` & `fill-blue-600` opacity `0.12`).
   - Histogram bar clusters (`fill-blue-700` opacity `0.07–0.10`).
   - Subtle currency (`₹`), percentage (`%`), trend (`↗`), and delta (`Δ`) symbols (`opacity-0.05–0.07`).

---

## 4. Firestore Security & Data Schemas

### Document: `users/{userId}/budget/config`
```json
{
  "monthlyIncome": 40000,
  "needsPct": 50,
  "wantsPct": 30,
  "savingsPct": 20,
  "isConfigured": true,
  "updatedAt": "Timestamp"
}
```

### Collection: `users/{userId}/expenses/{expenseId}`
```json
{
  "id": "exp_123",
  "description": "Grocery Shopping",
  "amount": 2500,
  "category": "Food",
  "paymentMode": "UPI",
  "type": "Need",
  "date": "2026-08-21",
  "notes": "Weekly essentials",
  "createdAt": "Timestamp",
  "userId": "usr_abc"
}
```

---

## 5. Folder Structure
```
finance-tracker/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/ (Navbar, Sidebar, PageContainer)
│   │   ├── common/ (StatCard, ProgressBar, Modal)
│   │   └── expenses/ (ExpenseModal)
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   ├── FirstTimeSetupPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── BudgetPage.jsx
│   │   ├── ExpenseTrackerPage.jsx
│   │   ├── WeeklyAnalysisPage.jsx
│   │   ├── MonthlyAnalysisPage.jsx
│   │   ├── YearlyCalendarPage.jsx
│   │   ├── FinancialScorePage.jsx
│   │   ├── AssistantPage.jsx
│   │   └── SettingsPage.jsx
│   ├── context/ (AuthContext.jsx, FinanceContext.jsx)
│   ├── firebase/ (firebase.js, dbService.js)
│   ├── hooks/ (useAuth.js, useFinance.js)
│   ├── utils/ (calculations.js, dateUtils.js, formatters.js, aiEngine.js)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── PROJECT_CONTEXT.md
├── CURRENT_PROGRESS.md
├── AI_HANDOFF.md
├── package.json
└── vite.config.js
```

---

## 6. Development Rules & Design Principles
- **Real User Data Priority**: Default experience starts empty. Sample data is only loaded on explicit user request in Settings.
- **Strict Account Validation**: Unregistered login attempts are blocked with clear feedback.
- **Real-Time Data Filtering**: All filters in Expense Tracker execute live against user data without page reload.
