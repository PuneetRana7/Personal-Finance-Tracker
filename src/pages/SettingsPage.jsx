import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../hooks/useAuth';
import { useFinance } from '../hooks/useFinance';
import { isFirebaseConfigured } from '../firebase/firebase';
import { 
  User, 
  ShieldCheck, 
  Database, 
  Download, 
  RotateCcw, 
  LogOut, 
  Key,
  CheckCircle,
  Copy
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, isDemoMode, logout, exitDemoMode, resetDemoData } = useAuth();
  const { expenses, budget, resetData } = useFinance();
  const [copiedRules, setCopiedRules] = useState(false);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      budget,
      expenses,
      exportDate: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `finance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <PageContainer
      title="Settings & Data Controls"
      subtitle="Manage your profile, database status, data backups, and Firebase security rules."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Account & Connection Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Account Session
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isDemoMode
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : (isFirebaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200')
            }`}>
              {isDemoMode ? 'Demo Mode — Sample Data' : (isFirebaseConfigured ? 'Firebase Authenticated' : 'Local Account')}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500">Logged User</span>
              <span className="font-bold text-slate-900">{user?.displayName || 'User'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500">Email Address</span>
              <span className="font-bold text-slate-900">{user?.email || 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span className="text-slate-500">User UID</span>
              <span className="font-mono text-slate-700 font-bold text-[11px]">{user?.uid || 'guest'}</span>
            </div>
          </div>

          {isDemoMode ? (
            <button
              onClick={exitDemoMode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Exit Demo Mode
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>

        {/* 2. Backup & Demo Reset Controls */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900">Export Backup JSON</h3>
              <p className="text-[11px] text-slate-500">Download a complete JSON copy of your budget configuration and transactions.</p>
              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Data Backup (.json)
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <h3 className="text-xs font-bold text-amber-900">
                {isDemoMode ? 'Reset Demo Data' : 'Load Sample Data (For Demonstration)'}
              </h3>
              <p className="text-[11px] text-amber-800">
                {isDemoMode 
                  ? 'Restores the original 10 sample transactions and ₹50,000 budget for demo presentations.'
                  : 'Populates your dashboard with sample transactions and a ₹50,000 budget for quick testing. Real accounts default to empty.'}
              </p>
              <button
                onClick={isDemoMode ? resetDemoData : resetData}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-700" />
                {isDemoMode ? 'Reset Demo Data' : 'Load Sample Data'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Firestore Security Rules Reference */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Firestore Security Rules
              </h2>
              <p className="text-xs text-slate-500">Copy these security rules into your Firebase Console to ensure users only read/write their own records.</p>
            </div>
            <button
              onClick={copyRules}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              {copiedRules ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRules ? 'Copied!' : 'Copy Rules'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto">
            {firestoreRulesText}
          </pre>
        </div>

      </div>
    </PageContainer>
  );
};
