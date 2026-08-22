import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuthContext } from './AuthContext';
import { 
  getBudgetConfig, 
  saveBudgetConfig, 
  subscribeToExpenses, 
  addExpenseToDb, 
  updateExpenseInDb, 
  deleteExpenseFromDb,
  resetToSampleData 
} from '../firebase/dbService';
import { 
  calculateBudgetTargets, 
  calculateExpenseSummary, 
  calculateFinancialScore 
} from '../utils/calculations';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { user } = useAuthContext();
  const userId = user?.uid || 'demo_user';

  const [budget, setBudget] = useState({
    monthlyIncome: 50000,
    needsPct: 50,
    wantsPct: 30,
    savingsPct: 20,
  });

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load budget config when user changes
  useEffect(() => {
    let isMounted = true;
    getBudgetConfig(userId).then((config) => {
      if (isMounted && config) {
        setBudget(config);
      }
    });
    return () => { isMounted = false; };
  }, [userId]);

  // Subscribe to realtime expenses (Firestore or LocalStorage)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToExpenses(userId, (items) => {
      setExpenses(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  // Derived budget targets
  const budgetTargets = useMemo(() => {
    return calculateBudgetTargets(
      budget.monthlyIncome,
      budget.needsPct,
      budget.wantsPct,
      budget.savingsPct
    );
  }, [budget]);

  // Derived expense summary calculations
  const expenseSummary = useMemo(() => {
    return calculateExpenseSummary(expenses, budgetTargets);
  }, [expenses, budgetTargets]);

  // Derived financial health score
  const financialScore = useMemo(() => {
    return calculateFinancialScore(budget.monthlyIncome, expenseSummary, budgetTargets);
  }, [budget.monthlyIncome, expenseSummary, budgetTargets]);

  // Actions
  const updateBudget = async (newBudget) => {
    const saved = await saveBudgetConfig(userId, newBudget);
    setBudget(saved);
  };

  const addExpense = async (expenseData) => {
    await addExpenseToDb(userId, expenseData);
  };

  const editExpense = async (id, updatedData) => {
    await updateExpenseInDb(userId, id, updatedData);
  };

  const deleteExpense = async (id) => {
    await deleteExpenseFromDb(userId, id);
  };

  const resetData = () => {
    resetToSampleData(userId);
  };

  return (
    <FinanceContext.Provider 
      value={{
        budget,
        budgetTargets,
        expenses,
        expenseSummary,
        financialScore,
        loading,
        updateBudget,
        addExpense,
        editExpense,
        deleteExpense,
        resetData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinanceContext = () => useContext(FinanceContext);
