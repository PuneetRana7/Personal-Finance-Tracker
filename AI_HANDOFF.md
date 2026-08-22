# AI Handoff Document

## Project Overview
- **Name**: Personal Finance Tracker
- **Stack**: React 18, Tailwind CSS, Firebase (Auth + Firestore) + Local Registered Accounts & Session Fallback, Recharts, Lucide React, Vite.
- **Location**: `c:\Users\punee\OneDrive\Desktop\Finance Tracker`

---

## Current Status
- **Current Status**: All requested features and fixes completed!
  1. **Firebase Auth Export Fix**: Added `updateProfile` export to `src/firebase/firebase.js`, eliminating module syntax error in `AuthContext.jsx`.
  2. **Hackathon Demo Mode / Account**:
     - Entry point card & button `[ Try Demo Account ]` on `AuthPage.jsx` with subtitle `"Explore the Finance Tracker with sample financial data."`.
     - Seeded Demo profile: Demo User, ₹50,000 monthly income, 50:30:20 budget.
     - Seeded 10 realistic sample transactions (Food, Transport, Shopping, Bills, Entertainment, Education, Travel, etc.) spread across recent dates.
     - Feeds real application pipeline under `demo_user` scope so Dashboard, Expense Tracker, Real-Time Filters, Recharts, Financial Score, and AI Assistant calculate everything dynamically without static text.
     - Distinct `"Demo Mode — Sample Data"` badge in `Navbar.jsx` along with `[ Reset Demo Data ]` and `[ Exit Demo Mode ]` controls.
     - Strict data separation preventing demo data from polluting real user accounts.
  3. **Strict Authentication**: Unregistered logins blocked with `"Account not found. Please sign up first."`. Sign Up checks duplicate emails.
  4. **Educational AI Assistant**: `aiEngine.js` combines live dataset metrics with educational modules for SIP, Mutual Funds, Index Funds, Stocks, ETFs, Bonds, PPF/NPS, Diversification, Compound Interest, Risk vs Return, Saving vs Investing, and Emergency Funds. Features interactive quick-question buttons (`"What is SIP?"`, `"Saving vs Investing"`, etc.).
  5. **Professional Finance + Analytics Background Mixture**:
     - Background: SVG pattern in `src/index.css` blending technical 50px grid, smooth Bézier trend line curve with soft blue gradient area fill (`#3b82f6` 8% opacity), candlestick stock indicators (`fill-emerald-600` & `fill-blue-600` 12% opacity), bar chart histogram clusters, and financial symbols (`₹`, `%`, `↗`, `Δ` 4–7% opacity).
     - Retains component structures, text readability, sidebar, navbar, cards, and charts 100% intact.

---

## Key Files & Architecture
- `src/firebase/firebase.js`: Firebase initialization, auth exports (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`, `updateProfile`), and Firestore db instance.
- `src/firebase/dbService.js`: `getSampleExpenses()`, `SAMPLE_BUDGET`, `seedSampleData()`, and user-scoped data persistence (`demo_user` fallback).
- `src/context/AuthContext.jsx`: Session provider with `isDemoMode`, `startDemoMode`, `resetDemoData`, and `exitDemoMode`.
- `src/pages/AuthPage.jsx`: Login, Sign Up, and "Try Demo Account" entry point.
- `src/components/layout/Navbar.jsx`: Header with logo, subtitle, "Demo Mode — Sample Data" badge, Reset Demo Data, and Exit Demo Mode buttons.
- `src/utils/aiEngine.js`: Financial query parser calculating metrics directly from active expenses dataset.

---

## How to Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
