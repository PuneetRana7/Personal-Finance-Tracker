import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Modal } from '../components/common/Modal';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency } from '../utils/formatters';
import { generateYearCalendarDays, getSpendingIntensity, formatReadableDate } from '../utils/dateUtils';
import { Calendar as CalendarIcon, Info, Receipt } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const YearlyCalendarPage = () => {
  const { expenses } = useFinance();
  const [selectedDay, setSelectedDay] = useState(null);

  const currentYear = new Date().getFullYear();
  const days = useMemo(() => generateYearCalendarDays(currentYear), [currentYear]);

  // Map expenses by date string YYYY-MM-DD
  const expenseMap = useMemo(() => {
    const map = {};
    expenses.forEach(exp => {
      if (exp.date) {
        if (!map[exp.date]) {
          map[exp.date] = { total: 0, items: [] };
        }
        map[exp.date].total += Number(exp.amount || 0);
        map[exp.date].items.push(exp);
      }
    });
    return map;
  }, [expenses]);

  // Average daily expense benchmark for intensity thresholds
  const totalSpentAll = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const avgDailyBenchmark = totalSpentAll > 0 ? Math.round(totalSpentAll / 30) : 1500;

  // Selected day's expenses for drilldown modal
  const selectedDayDetails = selectedDay ? (expenseMap[selectedDay.dateStr] || { total: 0, items: [] }) : null;

  return (
    <PageContainer
      title="Yearly Spending Heatmap Calendar"
      subtitle={`Visual daily spending intensity across ${currentYear}. Click any day to view transaction details.`}
    >
      {/* 1. Heatmap Legend & Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-900 text-sm">{currentYear} Activity Grid</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span>Intensity:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-xs bg-slate-100 border border-slate-200" title="No spending" />
            <span className="text-[11px] font-normal">None</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-xs bg-emerald-200 border border-emerald-300" title="Low spending (< ₹750)" />
            <span className="text-[11px] font-normal">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-xs bg-amber-400 border border-amber-500" title="Medium spending (₹750 - ₹2,250)" />
            <span className="text-[11px] font-normal">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-xs bg-rose-500 border border-rose-600" title="High spending (> ₹2,250)" />
            <span className="text-[11px] font-normal">High</span>
          </div>
        </div>
      </div>

      {/* 2. Heatmap Grid Month by Month */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTH_NAMES.map((monthName, monthIdx) => {
            const monthDays = days.filter(d => d.month === monthIdx);

            return (
              <div key={monthName} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/40">
                <h3 className="text-xs font-bold text-slate-900 mb-2.5 text-center">{monthName} {currentYear}</h3>
                
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-400 font-semibold text-center mb-1">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>

                {/* Day squares */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Padding offset for first day of month */}
                  {Array.from({ length: (monthDays[0]?.dayOfWeek + 6) % 7 }).map((_, i) => (
                    <div key={`offset-${i}`} className="w-full aspect-square" />
                  ))}

                  {monthDays.map(day => {
                    const dayData = expenseMap[day.dateStr];
                    const amount = dayData ? dayData.total : 0;
                    const intensity = getSpendingIntensity(amount, avgDailyBenchmark);

                    let bgClass = 'bg-slate-100 hover:bg-slate-200 border-slate-200';
                    if (intensity === 'low') bgClass = 'bg-emerald-200 hover:bg-emerald-300 border-emerald-300';
                    if (intensity === 'medium') bgClass = 'bg-amber-400 hover:bg-amber-500 border-amber-500 text-slate-900 font-bold';
                    if (intensity === 'high') bgClass = 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white font-bold';

                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDay(day)}
                        className={`w-full aspect-square rounded-md border text-[10px] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                        title={`${day.dateStr}: ${formatCurrency(amount)}`}
                      >
                        {day.dayOfMonth}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Day Expenses Drilldown Modal */}
      <Modal
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Expenses for ${formatReadableDate(selectedDay.dateStr)}` : ''}
        maxWidth="max-w-md"
      >
        {selectedDayDetails && selectedDayDetails.items.length > 0 ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex justify-between items-center text-xs font-bold text-blue-900">
              <span>Total Day Spending</span>
              <span className="text-sm font-extrabold text-blue-700">{formatCurrency(selectedDayDetails.total)}</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedDayDetails.items.map(item => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">{item.description}</p>
                    <p className="text-[11px] text-slate-500">{item.category} • {item.paymentMode}</p>
                    {item.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{item.notes}</p>}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="text-xs font-semibold text-slate-600">No expenses recorded on this date.</p>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};
