'use client';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingDown, PiggyBank, CalendarDays,
  Shield, Zap, Plus, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { TransactionList } from '@/components/transactions/TransactionList';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useSummary } from '@/hooks/useFinancial';
import { useTransactions } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';
import { FinancialSummary } from '@/types';

export default function DashboardPage() {
  const { selectedMonth, selectedYear } = useUIStore();
  const { data: summary, isLoading: summaryLoading } = useSummary(selectedMonth, selectedYear);
  const { data: txData, isLoading: txLoading } = useTransactions({
    month: selectedMonth,
    year: selectedYear,
    limit: 5,
  });

  return (
    <div className="pb-24">
      <Header title="Fin" showMonthPicker showAddButton />

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {summaryLoading ? <DashboardSkeleton /> : summary ? (
          <>
            {/* Layout desktop: 2 colunas | mobile: 1 coluna */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Coluna esquerda: resumo principal */}
              <div className="lg:col-span-2 space-y-4">
                <OverviewGrid summary={summary} />
                <DailyBudgetBanner summary={summary} />
                <CategoryDonutChart
                  spendingByCategory={summary.spendingByCategory}
                  totalSpent={summary.totalSpent}
                />
              </div>

              {/* Coluna direita: últimos gastos */}
              <div className="space-y-4">
                <RecentTransactions
                  transactions={txData?.transactions || []}
                  isLoading={txLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

/* ── Overview Grid ─────────────────────────────── */
function OverviewGrid({ summary }: { summary: FinancialSummary }) {
  const spentPct = summary.salary > 0
    ? Math.min(100, (summary.totalSpent / (summary.salary - summary.savedAmount)) * 100)
    : 0;

  const cards = [
    {
      label: 'Saldo disponível',
      value: summary.availableBalance,
      icon: Wallet,
      color: summary.isBelowSafety ? 'text-red-400' : 'text-emerald-400',
      bg: summary.isBelowSafety ? 'from-red-500/10' : 'from-emerald-500/10',
      alert: summary.isBelowSafety ? '⚠ Abaixo da reserva' : null,
    },
    {
      label: 'Total gasto',
      value: summary.totalSpent,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'from-red-500/10',
      sub: `${summary.transactionCount} lançamento${summary.transactionCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Guardando',
      value: summary.savedAmount,
      icon: PiggyBank,
      color: 'text-brand-400',
      bg: 'from-brand-500/10',
      sub: `${summary.savingsGoal}% do salário`,
    },
    {
      label: 'Gasto diário',
      value: summary.dailyBudget,
      icon: CalendarDays,
      color: 'text-amber-400',
      bg: 'from-amber-500/10',
      sub: `${summary.daysRemaining} dias restantes`,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl bg-gradient-to-br ${c.bg} to-transparent border border-white/5 p-4 min-h-[90px]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 leading-tight">{c.label}</span>
              <c.icon size={15} className={c.color} />
            </div>
            <p className={`text-sm sm:text-base font-bold font-mono ${c.color} leading-tight break-all`}>
              {formatCurrency(c.value)}
            </p>
            {c.sub && <p className="text-xs text-gray-500 mt-1">{c.sub}</p>}
            {c.alert && (
              <p className="text-xs text-red-400 mt-1">{c.alert}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Barra de progresso do orçamento */}
      <div className="rounded-2xl bg-surface-200 border border-white/5 px-4 py-3">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Uso do orçamento mensal</span>
          <span className="font-mono">{spentPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={spentPct} />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Salário: {formatCurrency(summary.salary)}</span>
          <span>Guardado: {formatCurrency(summary.savedAmount)}</span>
        </div>

        {summary.safetyAmount > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <Shield size={13} className="text-amber-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">
              Reserva de segurança: {formatCurrency(summary.safetyAmount)} —{' '}
              {summary.isBelowSafety
                ? <span className="text-red-400 font-medium">⚠ Atenção!</span>
                : <span className="text-emerald-400">Seguro ✓</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Daily Budget Banner ────────────────────────── */
function DailyBudgetBanner({ summary }: { summary: FinancialSummary }) {
  const { openAddTransaction } = useUIStore();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-brand-500/20 via-brand-600/10 to-transparent border border-brand-500/20"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-brand-400" />
            <span className="text-xs font-medium text-gray-400">Método diário</span>
          </div>
          <p className="text-3xl font-bold font-mono text-white">
            {formatCurrency(summary.dailyBudget)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            disponível hoje · {summary.daysRemaining} dias até dia {summary.paymentDay}
          </p>
        </div>
        <button
          onClick={openAddTransaction}
          className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30 active:scale-95"
        >
          <Plus size={22} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Recent Transactions ────────────────────────── */
function RecentTransactions({ transactions, isLoading }: { transactions: import('@/types').Transaction[]; isLoading: boolean }) {
  return (
    <div className="rounded-2xl bg-surface-200 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-gray-200">Últimos gastos</h3>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>
      <div className="p-3">
        <TransactionList transactions={transactions || []} isLoading={isLoading} />
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-200 rounded-2xl" />)}
      </div>
      <div className="h-14 bg-surface-200 rounded-2xl" />
      <div className="h-72 bg-surface-200 rounded-2xl" />
    </div>
  );
}

/* ── Empty State ────────────────────────────────── */
function EmptyState() {
  const openAdd = useUIStore(s => s.openAddTransaction);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-20">
      <p className="text-5xl mb-4">💰</p>
      <h2 className="text-xl font-bold text-gray-200 mb-2">Tudo zerado</h2>
      <p className="text-gray-500 text-sm mb-6">Configure seu salário e comece a registrar seus gastos</p>
      <button onClick={openAdd}
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
        Adicionar primeiro gasto
      </button>
    </motion.div>
  );
}
