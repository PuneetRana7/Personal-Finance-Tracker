import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseConfigured } from '../firebase/firebase';
import { 
  Wallet, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, signup, loginWithGoogle, startDemoMode } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo account handler
  const handleDemo = async () => {
    try {
      await startDemoMode();
      if (onAuthSuccess) onAuthSuccess();
    } catch (e) {
      setError(e.message || 'Failed to start demo mode');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
      if (password.length < 6) {
        setError('Password should be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, fullName);
      } else {
        await login(email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Left Column: Finance & Analytics Showcase Banner (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Vector Accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Personal Finance Tracker</h1>
              <p className="text-xs text-slate-400 mt-1">Smart, data-driven financial management.</p>
            </div>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 space-y-4 my-6">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">50:30:20 Rule Allocation</p>
                <p className="text-[11px] text-slate-400">Automated Needs, Wants & Savings targets</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Real-Time Expense Analytics</p>
                <p className="text-[11px] text-slate-400">Dual amount sliders & category filters</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Educational AI Advisor</p>
                <p className="text-[11px] text-slate-400">Contextual answers & financial guidance</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Isolated local & Firebase authenticated sessions.</span>
          </div>
        </div>

        {/* Right Column: Authentication Card & Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div>
            {/* Header (Mobile view brand header) */}
            <div className="lg:hidden text-center mb-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
                <Wallet className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Finance Tracker</h1>
              <p className="text-xs text-slate-500">Track your income, expenses, budget and savings in one place.</p>
            </div>

            {/* Tab Toggle */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${!isSignUp ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${isSignUp ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 space-y-2">
                <p>{error}</p>
                {error.includes('Account not found') && (
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(''); }}
                    className="w-full text-left font-bold text-blue-700 underline hover:text-blue-800 cursor-pointer"
                  >
                    Click here to Sign Up →
                  </button>
                )}
                {error.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(''); }}
                    className="w-full text-left font-bold text-blue-700 underline hover:text-blue-800 cursor-pointer"
                  >
                    Click here to Login →
                  </button>
                )}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
              </button>
            </form>

            {isFirebaseConfigured && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or</span></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Sign In with Google
                </button>
              </>
            )}

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Create Account"}
              </button>
            </div>
          </div>

          {/* Demo Account Preview Section */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <div>
              <p className="text-xs font-bold text-slate-800">Try Demo Account</p>
              <p className="text-[11px] text-slate-500">Explore the Finance Tracker with sample financial data.</p>
            </div>
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Try Demo Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
