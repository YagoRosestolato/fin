'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { Modal } from '@/components/ui/Modal';
import { CSVImport } from '@/components/transactions/CSVImport';
import { Button } from '@/components/ui/Button';
import { useTransactions, useCategories } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { formatCurrency } from '@/lib/utils';
import { TransactionType } from '@/types';

interface FiltersState {
  search: string;
  type: TransactionType | '';
  category: string;
}

export default function TransactionsPage() {
  const { selectedMonth, selectedYear } = useUIStore();
  const [filters, setFilters] = useState<FiltersState>({ search: '', type: '', category: '' });
  const [csvOpen, setCsvOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTransactions({
    month: selectedMonth,
    year: selectedYear,
    search: filters.search || undefined,
    type: (filters.type as TransactionType) || undefined,
    category: filters.category || undefined,
    page,
    limit: 20,
  });

  const { data: categories = [] } = useCategories();

  const totalAmount = data?.transactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;

  return (
    <div className="pb-24">
      <Header title="Gastos" showMonthPicker showAddButton />

      <div className="page-container space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total do mês</p>
            <p className="text-xl font-bold font-mono text-red-400">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{data?.pagination?.total || 0} lançamentos</span>
            <Button variant="secondary" size="sm" onClick={() => setCsvOpen(true)}>
              <FileUp size={14} /> CSV
            </Button>
          </div>
        </div>

        <TransactionFilters
          filters={filters}
          categories={categories}
          onChange={f => { setFilters(f); setPage(1); }}
        />

        <TransactionList
          transactions={data?.transactions || []}
          isLoading={isLoading}
        />

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs text-gray-400">
              {page} / {data.pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === data.pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={csvOpen} onClose={() => setCsvOpen(false)} title="Importar CSV">
        <CSVImport onClose={() => setCsvOpen(false)} />
      </Modal>
    </div>
  );
}
