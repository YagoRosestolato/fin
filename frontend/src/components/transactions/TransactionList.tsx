'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatCurrency, formatDate, TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS, CATEGORY_ICONS,
} from '@/lib/utils';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction: tx }: TransactionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteTransaction = useDeleteTransaction();
  const setEditing = useUIStore(s => s.setEditingTransaction);

  const handleDelete = async (deleteAll: boolean) => {
    await deleteTransaction.mutateAsync({ id: tx.id, deleteAll });
    setShowDeleteConfirm(false);
  };

  const categoryIcon = CATEGORY_ICONS[tx.category?.toLowerCase() || ''] || '📦';
  const typeColor = TRANSACTION_TYPE_COLORS[tx.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="bg-surface-200 border border-white/5 rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
          {categoryIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">{tx.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className={`text-xs ${typeColor}`} variant="default">
              {TRANSACTION_TYPE_LABELS[tx.type]}
            </Badge>
            {tx.isFixed && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <RefreshCw size={10} /> Fixo
              </span>
            )}
            {tx.installments && (
              <span className="text-xs text-purple-400">
                {tx.installmentNumber}/{tx.installments}x
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-mono font-semibold text-red-400">
            -{formatCurrency(tx.amount)}
          </p>
          <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
        </div>
        <div className="ml-1 text-gray-600">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-3">
              {tx.notes && (
                <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">{tx.notes}</p>
              )}
              {tx.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {tx.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
              )}

              {showDeleteConfirm ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 text-center">
                    {tx.isFixed || tx.installments ? 'Excluir apenas este ou todos futuros?' : 'Confirmar exclusão?'}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDelete(false)}
                      loading={deleteTransaction.isPending}>
                      Só este
                    </Button>
                    {(tx.isFixed || tx.installments) && (
                      <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDelete(true)}
                        loading={deleteTransaction.isPending}>
                        Todos
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditing(tx.id)}>
                    <Pencil size={13} /> Editar
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={13} /> Excluir
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-surface-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-4xl mb-3">💸</p>
        <p className="text-sm">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {transactions.map(tx => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </AnimatePresence>
    </div>
  );
}
