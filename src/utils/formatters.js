// Currency and number formatting helper utilities

/**
 * Formats a numeric value into Indian Rupee (INR) standard format.
 * Example: 50000 -> ₹50,000
 */
export const formatCurrency = (amount) => {
  const numericVal = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericVal);
};

/**
 * Formats decimal / percentage values nicely.
 * Example: 50 -> 50%
 */
export const formatPercent = (val) => {
  const numericVal = Number(val) || 0;
  return `${Math.round(numericVal)}%`;
};

/**
 * Capitalizes category or type strings.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
