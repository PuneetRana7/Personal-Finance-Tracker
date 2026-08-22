// Date handling utilities for weekly, monthly, and yearly calendar operations

/**
 * Returns today's ISO date string YYYY-MM-DD
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Formats YYYY-MM-DD into readable string like "21 Aug 2026"
 */
export const formatReadableDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Get start and end dates of the current week (Monday to Sunday)
 */
export const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startStr: monday.toISOString().split('T')[0],
    endStr: sunday.toISOString().split('T')[0],
    monday,
    sunday
  };
};

/**
 * Filter expenses for a date range [startISO, endISO]
 */
export const filterExpensesByDateRange = (expenses, startISO, endISO) => {
  return expenses.filter(exp => {
    if (!exp.date) return false;
    return exp.date >= startISO && exp.date <= endISO;
  });
};

/**
 * Filter expenses for current month YYYY-MM
 */
export const filterExpensesByMonth = (expenses, yearMonthStr) => {
  const target = yearMonthStr || new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  return expenses.filter(exp => exp.date && exp.date.startsWith(target));
};

/**
 * Generate 365 days of the current year for heatmap calendar
 */
export const generateYearCalendarDays = (year = new Date().getFullYear()) => {
  const days = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let current = new Date(startDate);
  while (current <= endDate) {
    const iso = current.toISOString().split('T')[0];
    days.push({
      dateStr: iso,
      dayOfMonth: current.getDate(),
      month: current.getMonth(),
      year: current.getFullYear(),
      dayOfWeek: current.getDay()
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

/**
 * Calculate spending intensity level for a day (None, Low, Medium, High)
 */
export const getSpendingIntensity = (amount, avgDaily = 1500) => {
  if (!amount || amount <= 0) return 'none';
  if (amount < avgDaily * 0.5) return 'low';
  if (amount < avgDaily * 1.5) return 'medium';
  return 'high';
};
