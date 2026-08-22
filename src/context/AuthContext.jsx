import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseConfigured, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile 
} from '../firebase/firebase';
import { seedSampleData, resetToSampleData, getBudgetStorageKey, getExpensesStorageKey } from '../firebase/dbService';



const AuthContext = createContext();

const LOCAL_SESSION_KEY = 'finance_tracker_active_session';
const REGISTERED_ACCOUNTS_KEY = 'finance_tracker_registered_accounts';

const getRegisteredAccounts = () => {
  try {
    const stored = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

const saveRegisteredAccount = (account) => {
  const accounts = getRegisteredAccounts();
  accounts[account.email] = account;
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // --- Demo mode handlers ---
  const startDemoMode = async () => {
    const demoUser = {
      uid: 'demo_user',
      email: 'demo@financetracker.app',
      displayName: 'Demo User',
      isDemo: true
    };
    // Seed demo data (budget + expenses)
    await seedSampleData('demo_user', false);
    // Store session locally
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
  };

  const resetDemoData = async () => {
    await resetToSampleData('demo_user');
  };

  const exitDemoMode = async () => {
    // Clear demo-specific storage
    localStorage.removeItem(getExpensesStorageKey('demo_user'));
    localStorage.removeItem(getBudgetStorageKey('demo_user'));
    // Remove session
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  useEffect(() => {
    const loadSession = () => {
      const stored = localStorage.getItem(LOCAL_SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsDemoMode(Boolean(parsed.isDemo || parsed.uid === 'demo_user'));
        } catch (e) {
          setUser(null);
          setIsDemoMode(false);
        }
      } else {
        setUser(null);
        setIsDemoMode(false);
      }
      setLoading(false);
    };

    if (!isFirebaseConfigured || !auth) {
      loadSession();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsDemoMode(false);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email.split('@')[0]
        }));
      } else {
        const stored = localStorage.getItem(LOCAL_SESSION_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setIsDemoMode(Boolean(parsed.isDemo || parsed.uid === 'demo_user'));
          } catch (e) {
            setUser(null);
            setIsDemoMode(false);
          }
        } else {
          setUser(null);
          setIsDemoMode(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        setIsDemoMode(false);
        return res.user;
      } catch (err) {
        console.warn('Firebase login attempt:', err.code, err.message);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const localAccounts = getRegisteredAccounts();
          if (!localAccounts[cleanEmail]) {
            throw new Error('Account not found. Please sign up first.');
          }
          if (localAccounts[cleanEmail].password !== password) {
            throw new Error('Incorrect email or password.');
          }
          const localUser = localAccounts[cleanEmail];
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
          setUser(localUser);
          setIsDemoMode(true);
          return localUser;
        }
        throw new Error('Incorrect email or password.');
      }
    }

    const accounts = getRegisteredAccounts();
    if (!accounts[cleanEmail]) {
      throw new Error('Account not found. Please sign up first.');
    }

    if (accounts[cleanEmail].password !== password) {
      throw new Error('Incorrect email or password.');
    }

    const localUser = accounts[cleanEmail];
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
    setUser(localUser);
    setIsDemoMode(true);
    return localUser;
  };

  const signup = async (email, password, fullName = '') => {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const displayName = fullName.trim() || cleanEmail.split('@')[0];
        if (fullName && res.user) {
          try { await updateProfile(res.user, { displayName }); } catch (e) { /* ignore */ }
        }
        const newUser = {
          uid: res.user.uid,
          email: cleanEmail,
          password,
          displayName,
          isDemo: false
        };
        saveRegisteredAccount(newUser);
        setIsDemoMode(false);
        return res.user;
      } catch (err) {
        console.warn('Firebase signup attempt error:', err.code, err.message);
        if (err.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists. Please log in.');
        }
      }
    }

    const accounts = getRegisteredAccounts();
    if (accounts[cleanEmail]) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const uid = 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const displayName = fullName.trim() || cleanEmail.split('@')[0];
    const newUser = { uid, email: cleanEmail, password, displayName, isDemo: !isFirebaseConfigured };
    
    saveRegisteredAccount(newUser);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
    setIsDemoMode(true);
    return newUser;
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      const guestUser = { uid: 'guest_user', email: 'guest@financetracker.app', displayName: 'Guest User', isDemo: true };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setIsDemoMode(true);
      return guestUser;
    }
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setIsDemoMode(false);
      return res.user;
    } catch (err) {
      const guestUser = { uid: 'guest_user', email: 'guest@financetracker.app', displayName: 'Guest User', isDemo: true };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setIsDemoMode(true);
      return guestUser;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && !isDemoMode) {
      try { await signOut(auth); } catch (e) { /* ignore */ }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoMode,
      login,
      signup,
      loginWithGoogle,
      logout,
      startDemoMode,
      resetDemoData,
      exitDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
