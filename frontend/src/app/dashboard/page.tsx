'use client';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { DailyBudgetCard } from '@/components/dashboard/DailyBudgetCard';
import { SpendingPieChart, SpendingTypeChart } from '@/components/charts/SpendingChart';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useSummary } from '@/hooks/useFinancial';
import { useTransactions } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

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

      <div className="page-container space-y-4">
        {summaryLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : summary ? (
          <>
            <DailyBudgetCard summary={summary} />
            <SummaryCards summary={summary} />

            <div className="grid grid-cols-1 gap-4">
              <SpendingPieChart summary={summary} />
              <SpendingTypeChart summary={summary} />
            </div>
          </>
        ) : (
          <EmptyState />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Últimos gastos</CardTitle>
            <a href="/dashboard/transactions" className="text-xs text-brand-400 hover:text-brand-300">
              Ver todos
            </a>
          </CardHeader>
          <TransactionList
            transactions={txData?.transactions || []}
            isLoading={txLoading}
          />
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  const openAdd = useUIStore(s => s.openAddTransaction);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <p className="text-5xl mb-4">💰</p>
      <h2 className="text-xl font-bold text-gray-200 mb-2">Configure seu perfil</h2>
      <p className="text-gray-500 text-sm mb-6">
        Adicione seu salário nas configurações e comece a controlar seus gastos
      </p>
      <button
        onClick={openAdd}
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
      >
        Adicionar primeiro gasto
      </button>
    </motion.div>
  );
}
