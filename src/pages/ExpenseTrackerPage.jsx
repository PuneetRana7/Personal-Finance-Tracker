import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { formatReadableDate } from '../utils/dateUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Receipt, 
  RotateCcw,
  AlertCircle,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const CATEGORIES = ['All Categories', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Health', 'Other'];
const PAYMENT_MODES = ['All Payment Modes', 'Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer'];
const EXPENSE_TYPES = ['All Types', 'Need', 'Want', 'Saving'];

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Transport: '#06b6d4',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Bills: '#f59e0b',
  Education: '#10b981',
  Health: '#ef4444',
  Other: '#64748b',
};

export const ExpenseTrackerPage = ({ isModalOpen, setIsModalOpen }) => {
  const { expenses, addExpense, editExpense, deleteExpense, loading } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All Payment Modes');
  const [selectedType, setSelectedType] = useState('All Types');

  // Amount & Date Filters
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  // Dynamic max amount bound based on stored expenses
  const maxExpenseBound = useMemo(() => {
    if (!expenses.length) return 50000;
    const maxVal = Math.max(...expenses.map((e) => Number(e.amount || 0)));
    return maxVal > 0 ? maxVal : 50000;
  }, [expenses]);

  // Combined Filter Pipeline
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const amt = Number(exp.amount || 0);

      // Search term
      const matchesSearch = 
        !searchTerm || 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory = 
        selectedCategory === 'All Categories' || exp.category === selectedCategory;

      // Payment Mode
      const matchesPaymentMode = 
        selectedPaymentMode === 'All Payment Modes' || exp.paymentMode === selectedPaymentMode;

      // Type
      const matchesType = 
        selectedType === 'All Types' || exp.type === selectedType;

      // Amount Range
      const matchesMinAmount = minAmount === '' || amt >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || amt <= Number(maxAmount);

      // Date Range
      const matchesFromDate = !fromDate || (exp.date && exp.date >= fromDate);
      const matchesToDate = !toDate || (exp.date && exp.date <= toDate);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPaymentMode &&
        matchesType &&
        matchesMinAmount &&
        matchesMaxAmount &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMode, selectedType, minAmount, maxAmount, fromDate, toDate]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filteredExpenses]);

  // Filtered Category Chart Data
  const filteredCategoryChartData = useMemo(() => {
    const totals = filteredExpenses.reduce((acc, exp) => {
      const cat = exp.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
      return acc;
    }, {});

    return Object.keys(totals).map((cat) => ({
      name: cat,
      value: totals[cat],
      color: CATEGORY_COLORS[cat] || '#64748b',
    }));
  }, [filteredExpenses]);

  const isFilterActive = 
    searchTerm !== '' || 
    selectedCategory !== 'All Categories' || 
    selectedPaymentMode !== 'All Payment Modes' || 
    selectedType !== 'All Types' || 
    minAmount !== '' || 
    maxAmount !== '' || 
    fromDate !== '' || 
    toDate !== '';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedPaymentMode('All Payment Modes');
    setSelectedType('All Types');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
  };

  const handleSaveExpense = async (data) => {
    if (editingExpense) {
      await editExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      await addExpense(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingExpenseId) {
      await deleteExpense(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  return (
    <PageContainer
      title="Expense Tracker"
      subtitle="Log, edit, and explore your personal expense data with real-time numerical range, category, and date filtering."
      actions={
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      }
    >
      {/* 1. Real-Time Multi-Filter Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Real-Time Expense Filters</h2>
          </div>
          {isFilterActive && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Row 1: Text Search, Category, Payment Mode, Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description or notes..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Payment Mode Filter */}
          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_MODES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Row 2: Dual Amount Range Sliders & Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          
          {/* Dual-Ended Amount Slider Filter */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Amount Range Filter (₹)</span>
              <span className="text-blue-700">
                {formatCurrency(minAmount || 0)} – {formatCurrency(maxAmount || maxExpenseBound)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Min Amount (₹)</label>
                <input
                  type="range"
                  min="0"
                  max={maxExpenseBound}
                  step="100"
                  value={minAmount === '' ? 0 : minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Max Amount (₹)</label>
                <input
                  type="range"
                  min="0"
                  max={maxExpenseBound}
                  step="100"
                  value={maxAmount === '' ? maxExpenseBound : maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-800">Date Range Filter</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Active Filter Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredExpenses.length}</strong> of {expenses.length} transactions
          </span>
          <span className="font-semibold text-slate-900">
            Total Filtered: <span className="text-blue-700 text-sm font-bold">{formatCurrency(filteredTotal)}</span>
          </span>
        </div>
      </div>

      {/* 2. Live Filtered Distribution Chart */}
      {filteredCategoryChartData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Filtered Category Spending</h2>
            <span className="text-xs font-semibold text-blue-700">{formatCurrency(filteredTotal)}</span>
          </div>
          <div className="h-40 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCategoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(v) => formatCurrency(v)} 
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {filteredCategoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Expense Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <span>Loading transactions from Firestore...</span>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatReadableDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">
                      <p className="font-bold">{exp.description}</p>
                      {exp.notes && <p className="text-[11px] text-slate-400 font-normal">{exp.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {exp.paymentMode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        exp.type === 'Need' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : exp.type === 'Want'
                          ? 'bg-pink-50 text-pink-700 border border-pink-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpenseId(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No expenses matched your filter criteria.</p>
            <p className="text-xs text-slate-400">Try adjusting your amount sliders, dates, or click "Clear Filters".</p>
          </div>
        )}
      </div>

      {/* Expense Modal (Add / Edit) */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingExpenseId)}
        onClose={() => setDeletingExpenseId(null)}
        title="Confirm Expense Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to delete this expense? This action will permanently remove it from Firestore and update your budget calculations.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDeletingExpenseId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
            >
              Delete Expense
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
