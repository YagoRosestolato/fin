'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, Calendar, DollarSign, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SavingsChart } from '@/components/charts/SavingsChart';
import { MonthlyConfigModal } from '@/components/MonthlyConfigModal';
import { useSavingsHistory } from '@/hooks/useFinancial';
import { useUIStore } from '@/stores/ui.store';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';
import { MonthlySaving } from '@/types';

export default function SavingsPage() {
  const { data: history = [], isLoading } = useSavingsHistory();
  const { selectedMonth, selectedYear } = useUIStore();
  const [configOpen, setConfigOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ month: number; year: number } | null>(null);

  const totalSaved = history.reduce((sum: number, h: MonthlySaving) => sum + h.savedAmount, 0);
  const totalSpent = history.reduce((sum: number, h: MonthlySaving) => sum + h.totalSpent, 0);
  const avgMonthly = history.length > 0 ? totalSaved / history.length : 0;

  const handleOpenConfig = (month?: number, year?: number) => {
    setEditTarget(month && year ? { month, year } : null);
    setConfigOpen(true);
  };

  // Find existing config for the edit target
  const editingEntry = editTarget
    ? (history as MonthlySaving[]).find(h => h.month === editTarget.month && h.year === editTarget.year)
    : null;

  return (
    <div className="pb-24">
      <Header title="Economia" showMonthPicker />

      <div className="page-container space-y-4">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank size={18} className="text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">Total Guardado (histórico)</span>
              </div>
              <p className="text-4xl font-bold font-mono text-emerald-400">
                {formatCurrency(totalSaved)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Em {history.length} {history.length === 1 ? 'mês configurado' : 'meses configurados'}
              </p>
            </div>
            <button
              onClick={() => handleOpenConfig()}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
            >
              <Plus size={13} /> Configurar mês
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Média guardada', value: avgMonthly, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Total gasto', value: totalSpent, icon: DollarSign, color: 'text-red-400' },
            { label: 'Meses', value: history.length, icon: Calendar, color: 'text-brand-400', isCount: true },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="text-center p-3">
                <item.icon size={16} className={`${item.color} mx-auto mb-2`} />
                <p className={`text-sm font-bold font-mono ${item.color} break-all`}>
                  {item.isCount ? item.value : formatCurrency(item.value as number)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="h-56 bg-surface-200 rounded-2xl animate-pulse" />
        ) : history.length > 0 ? (
          <SavingsChart history={history} />
        ) : null}

        {/* Monthly history */}
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
              <p className="text-3xl mb-2">💰</p>
              <p className="text-sm mb-1">Nenhum mês configurado ainda</p>
              <p className="text-xs text-gray-600 mb-4">Configure o salário e economia de cada mês para ver o histórico</p>
              <button
                onClick={() => handleOpenConfig()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
              >
                <Plus size={14} /> Configurar mês atual
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((h: MonthlySaving, i: number) => {
                const pct = h.salary
                  ? Math.min(100, (h.savedAmount / h.salary) * 100)
                  : 0;
                return (
                  <motion.button
                    key={`${h.year}-${h.month}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleOpenConfig(h.month, h.year)}
                    className="w-full flex items-center justify-between bg-surface-300 hover:bg-surface-300/80 rounded-xl px-4 py-3 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {MONTH_NAMES[h.month - 1]} {h.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        {h.transactionCount} lançamentos
                      </p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-mono font-semibold text-emerald-400">
                        +{formatCurrency(h.savedAmount)}
                      </p>
                      <p className="text-xs text-red-400 font-mono">
                        -{formatCurrency(h.totalSpent)}
                      </p>
                    </div>
                    <div className="w-10 h-10 relative flex-shrink-0">
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
                  </motion.button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <MonthlyConfigModal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        month={editTarget?.month ?? selectedMonth}
        year={editTarget?.year ?? selectedYear}
        existing={editingEntry
          ? { salary: editingEntry.salary, savingsGoal: editingEntry.savingsGoal, paymentDay: editingEntry.paymentDay }
          : null
        }
      />
    </div>
  );
}
