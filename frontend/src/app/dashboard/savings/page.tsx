'use client';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SavingsChart } from '@/components/charts/SavingsChart';
import { useSavingsHistory } from '@/hooks/useFinancial';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';
import { MonthlySaving } from '@/types';

export default function SavingsPage() {
  const { data: history = [], isLoading } = useSavingsHistory();
  const user = useAuthStore(s => s.user);

  const totalSaved = history.reduce((sum: number, h: MonthlySaving) => sum + h.savedAmount, 0);
  const totalSpent = history.reduce((sum: number, h: MonthlySaving) => sum + h.totalSpent, 0);
  const avgMonthly = history.length > 0 ? totalSaved / history.length : 0;
  const savedPerMonth = user ? (user.salary * user.savingsGoal) / 100 : 0;

  return (
    <div className="pb-24">
      <Header title="Economia" />

      <div className="page-container space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank size={18} className="text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Total Guardado (histórico)</span>
            </div>
            <p className="text-4xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalSaved)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Em {history.length} {history.length === 1 ? 'mês' : 'meses'} registrados
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Por mês', value: savedPerMonth, icon: Calendar, color: 'text-brand-400' },
            { label: 'Média guardada', value: avgMonthly, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Total gasto', value: totalSpent, icon: DollarSign, color: 'text-red-400' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="text-center p-3">
                <item.icon size={16} className={`${item.color} mx-auto mb-2`} />
                <p className={`text-sm font-bold font-mono ${item.color}`}>
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="h-56 bg-surface-200 rounded-2xl animate-pulse" />
        ) : (
          <SavingsChart history={history} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico Mensal</CardTitle>
          </CardHeader>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-surface-300 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">Nenhum histórico ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((h: MonthlySaving, i: number) => {
                const pct = h.savedAmount > 0 ? Math.min(100, (h.savedAmount / (h.savedAmount + h.totalSpent)) * 100) : 0;
                return (
                  <motion.div
                    key={`${h.year}-${h.month}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between bg-surface-300 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {MONTH_NAMES[h.month - 1]} {h.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        {h.transactionCount} lançamentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-semibold text-emerald-400">
                        +{formatCurrency(h.savedAmount)}
                      </p>
                      <p className="text-xs text-red-400 font-mono">
                        -{formatCurrency(h.totalSpent)}
                      </p>
                    </div>
                    <div className="ml-3 w-10 h-10 relative">
                      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ffffff08" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#10b981" strokeWidth="3"
                          strokeDasharray={`${pct * 0.88} 88`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-400">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
