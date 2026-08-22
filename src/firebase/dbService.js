import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from './firebase';

// User-specific storage key helpers
export const getBudgetStorageKey = (userId) => `finance_tracker_${userId || 'guest'}_budget`;
export const getExpensesStorageKey = (userId) => `finance_tracker_${userId || 'guest'}_expenses`;

const getDemoDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 10 Realistic Demo Transactions distributed across categories and recent dates
export const getSampleExpenses = () => [
  { id: 'demo_exp_1', description: 'Lunch', amount: 350, category: 'Food', paymentMode: 'UPI', type: 'Need', date: getDemoDate(1), notes: 'Lunch with colleagues', createdAt: Date.now() - 86400000 * 1 },
  { id: 'demo_exp_2', description: 'Cab', amount: 180, category: 'Transport', paymentMode: 'UPI', type: 'Need', date: getDemoDate(2), notes: 'Commute to office', createdAt: Date.now() - 86400000 * 2 },
  { id: 'demo_exp_3', description: 'Clothes', amount: 1500, category: 'Shopping', paymentMode: 'Credit Card', type: 'Want', date: getDemoDate(4), notes: 'Casual shirts', createdAt: Date.now() - 86400000 * 4 },
  { id: 'demo_exp_4', description: 'Electricity bill', amount: 2500, category: 'Bills', paymentMode: 'Bank Transfer', type: 'Need', date: getDemoDate(6), notes: 'Monthly electricity bill', createdAt: Date.now() - 86400000 * 6 },
  { id: 'demo_exp_5', description: 'Movie', amount: 600, category: 'Entertainment', paymentMode: 'Debit Card', type: 'Want', date: getDemoDate(8), notes: 'Weekend movie tickets', createdAt: Date.now() - 86400000 * 8 },
  { id: 'demo_exp_6', description: 'Dinner', amount: 450, category: 'Food', paymentMode: 'Cash', type: 'Need', date: getDemoDate(10), notes: 'Dinner with family', createdAt: Date.now() - 86400000 * 10 },
  { id: 'demo_exp_7', description: 'Course materials', amount: 1200, category: 'Education', paymentMode: 'UPI', type: 'Need', date: getDemoDate(12), notes: 'Web development books & materials', createdAt: Date.now() - 86400000 * 12 },
  { id: 'demo_exp_8', description: 'Weekend travel', amount: 900, category: 'Travel', paymentMode: 'UPI', type: 'Want', date: getDemoDate(14), notes: 'Weekend outstation trip', createdAt: Date.now() - 86400000 * 14 },
  { id: 'demo_exp_9', description: 'Accessories', amount: 750, category: 'Shopping', paymentMode: 'Debit Card', type: 'Want', date: getDemoDate(16), notes: 'Mobile & desk accessories', createdAt: Date.now() - 86400000 * 16 },
  { id: 'demo_exp_10', description: 'Snacks', amount: 250, category: 'Food', paymentMode: 'Cash', type: 'Need', date: getDemoDate(18), notes: 'Evening snacks and tea', createdAt: Date.now() - 86400000 * 18 },
];

export const SAMPLE_EXPENSES = getSampleExpenses();

export const SAMPLE_BUDGET = {
  monthlyIncome: 50000,
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
  isConfigured: true,
};

export const DEFAULT_BUDGET = {
  monthlyIncome: 0,
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
  isConfigured: false,
};

// --- BUDGET SERVICES ---

export const getBudgetConfig = async (userId) => {
  if (isFirebaseConfigured && db && userId) {
    try {
      const budgetRef = doc(db, 'users', userId, 'budget', 'config');
      const snap = await getDoc(budgetRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('Firestore fetch budget failed, reading local fallback', err);
    }
  }

  // Local storage fallback
  const stored = localStorage.getItem(getBudgetStorageKey(userId));
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* ignore */ }
  }
  return DEFAULT_BUDGET;
};

export const saveBudgetConfig = async (userId, budgetData) => {
  const dataToSave = { ...budgetData, isConfigured: true };
  // Always update local storage
  localStorage.setItem(getBudgetStorageKey(userId), JSON.stringify(dataToSave));

  if (isFirebaseConfigured && db && userId) {
    try {
      const budgetRef = doc(db, 'users', userId, 'budget', 'config');
      await setDoc(budgetRef, {
        ...dataToSave,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Failed saving budget to Firestore:', err);
    }
  }
  return dataToSave;
};

// --- EXPENSE SERVICES ---

export const subscribeToExpenses = (userId, onUpdate) => {
  if (isFirebaseConfigured && db && userId) {
    try {
      const expensesRef = collection(db, 'users', userId, 'expenses');
      const q = query(expensesRef, orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        // Cache to localStorage
        localStorage.setItem(getExpensesStorageKey(userId), JSON.stringify(items));
        onUpdate(items);
      }, (error) => {
        console.warn('Firestore realtime listener error, using local data', error);
        loadLocalExpenses(userId, onUpdate);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscription failed, falling back to local storage', err);
    }
  }

  // Local Storage Fallback
  return loadLocalExpenses(userId, onUpdate);
};

const loadLocalExpenses = (userId, onUpdate) => {
  const stored = localStorage.getItem(getExpensesStorageKey(userId));
  let expenses = [];
  if (stored) {
    try { expenses = JSON.parse(stored); } catch (e) { expenses = []; }
  }
  onUpdate(expenses);
  return () => {};
};

export const addExpenseToDb = async (userId, expenseData) => {
  const newExpense = {
    ...expenseData,
    amount: Number(expenseData.amount),
    createdAt: new Date().toISOString(),
    userId: userId || 'guest'
  };

  let createdId = 'exp_' + Date.now();

  if (isFirebaseConfigured && db && userId) {
    try {
      const expensesRef = collection(db, 'users', userId, 'expenses');
      const docRef = await addDoc(expensesRef, newExpense);
      createdId = docRef.id;
    } catch (err) {
      console.error('Error adding expense to Firestore:', err);
    }
  }

  // Update local storage array
  const key = getExpensesStorageKey(userId);
  const stored = localStorage.getItem(key);
  let list = stored ? JSON.parse(stored) : [];
  list = [{ id: createdId, ...newExpense }, ...list];
  localStorage.setItem(key, JSON.stringify(list));

  return { id: createdId, ...newExpense };
};

export const updateExpenseInDb = async (userId, expenseId, updatedFields) => {
  const cleanFields = {
    ...updatedFields,
    amount: Number(updatedFields.amount),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db && userId) {
    try {
      const expRef = doc(db, 'users', userId, 'expenses', expenseId);
      await updateDoc(expRef, cleanFields);
    } catch (err) {
      console.error('Error updating expense in Firestore:', err);
    }
  }

  // Local storage update
  const key = getExpensesStorageKey(userId);
  const stored = localStorage.getItem(key);
  let list = stored ? JSON.parse(stored) : [];
  list = list.map(item => item.id === expenseId ? { ...item, ...cleanFields } : item);
  localStorage.setItem(key, JSON.stringify(list));
};

export const deleteExpenseFromDb = async (userId, expenseId) => {
  if (isFirebaseConfigured && db && userId) {
    try {
      const expRef = doc(db, 'users', userId, 'expenses', expenseId);
      await deleteDoc(expRef);
    } catch (err) {
      console.error('Error deleting expense from Firestore:', err);
    }
  }

  // Local storage delete
  const key = getExpensesStorageKey(userId);
  const stored = localStorage.getItem(key);
  let list = stored ? JSON.parse(stored) : [];
  list = list.filter(item => item.id !== expenseId);
  localStorage.setItem(key, JSON.stringify(list));
};

export const seedSampleData = async (userId, shouldReload = false) => {
  const freshExpenses = getSampleExpenses();
  localStorage.setItem(getExpensesStorageKey(userId), JSON.stringify(freshExpenses));
  localStorage.setItem(getBudgetStorageKey(userId), JSON.stringify(SAMPLE_BUDGET));

  if (isFirebaseConfigured && db && userId && userId !== 'demo_user') {
    try {
      const budgetRef = doc(db, 'users', userId, 'budget', 'config');
      await setDoc(budgetRef, SAMPLE_BUDGET, { merge: true });
      for (const exp of freshExpenses) {
        const { id, ...data } = exp;
        const expDoc = doc(db, 'users', userId, 'expenses', id);
        await setDoc(expDoc, data, { merge: true });
      }
    } catch (e) {
      console.warn('Failed seeding Firestore sample data', e);
    }
  }
  if (shouldReload) {
    window.location.reload();
  }
};

export const resetToSampleData = (userId) => {
  return seedSampleData(userId, true);
};
