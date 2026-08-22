import { useFinanceContext } from '../context/FinanceContext';

export const useFinance = () => {
  return useFinanceContext();
};
