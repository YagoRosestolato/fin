'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp,
  GripVertical, Check, Clock,
} from 'lucide-react';
import {
  DndContext, closestCenter,
  PointerSensor, TouchSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatCurrency, formatDate,
  TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS, CATEGORY_ICONS,
} from '@/lib/utils';
import { useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { applyOrder, saveOrder } from '@/lib/transactionOrder';

/* ─── Paid toggle button ─────────────────────────────────────────── */
function PaidToggle({ txId, initialPaid }: { txId: string; initialPaid: boolean }) {
  const [paid, setPaid] = useState(initialPaid);
  const [loading, setLoading] = useState(false);
  const update = useUpdateTransaction();

  // sync if parent re-renders with new data
  useEffect(() => { setPaid(initialPaid); }, [initialPaid]);

  const toggle = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const next = !paid;
    setPaid(next); // optimistic
    setLoading(true);
    try {
      await update.mutateAsync({ id: txId, data: { paid: next } });
    } catch {
      setPaid(!next); // rollback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      onTouchEnd={toggle}
      disabled={loading}
      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
        paid
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          : 'bg-red-500/15 text-red-400 border-red-500/30'
      } ${loading ? 'opacity-50' : ''}`}
      aria-label={paid ? 'Marcar como pendente' : 'Marcar como pago'}
    >
      {paid
        ? <><Check size={11} strokeWidth={2.5} /> Pago</>
        : <><Clock size={11} strokeWidth={2} /> Pendente</>}
    </button>
  );
}

/* ─── Shared row content (no outer button — avoids nested buttons) ── */
function TxRow({
  tx, expanded, onToggleExpand,
}: {
  tx: Transaction;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const categoryIcon = CATEGORY_ICONS[tx.category?.toLowerCase() || ''] || '📦';
  const typeColor = TRANSACTION_TYPE_COLORS[tx.type];

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleExpand}
      onKeyDown={(e) => e.key === 'Enter' && onToggleExpand()}
      className="flex-1 flex items-center gap-3 pr-3 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors min-w-0"
    >
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
        {categoryIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">{tx.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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

      {/* paid toggle — stopPropagation handled inside PaidToggle */}
      <PaidToggle txId={tx.id} initialPaid={tx.paid} />

      <div className="text-right flex-shrink-0 ml-2">
        <p className="text-sm font-mono font-semibold text-red-400">
          -{formatCurrency(tx.amount)}
        </p>
        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
      </div>
      <div className="ml-1 text-gray-600 flex-shrink-0">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
    </div>
  );
}

/* ─── Expanded detail panel ──────────────────────────────────────── */
function TxExpanded({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const del = useDeleteTransaction();
  const setEditing = useUIStore(s => s.setEditingTransaction);

  const handleDelete = async (all: boolean) => {
    await del.mutateAsync({ id: tx.id, deleteAll: all });
    setShowDeleteConfirm(false);
  };

  return (
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
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDelete(false)} loading={del.isPending}>Só este</Button>
              {(tx.isFixed || tx.installments) && (
                <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDelete(true)} loading={del.isPending}>Todos</Button>
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
  );
}

/* ─── Card shell — drives paid border/bg ────────────────────────── */
function cardClass(paid: boolean) {
  return paid
    ? 'bg-emerald-500/[0.04] border-emerald-500/25 rounded-xl overflow-hidden'
    : 'bg-red-500/[0.04] border-red-500/25 rounded-xl overflow-hidden';
}

/* ─── Static item (dashboard list, no drag) ─────────────────────── */
function TransactionItem({ transaction: tx }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  // Mirror paid state locally so card color updates without refetch
  const [paid, setPaid] = useState(tx.paid);
  useEffect(() => { setPaid(tx.paid); }, [tx.paid]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`border ${cardClass(paid)} transition-colors`}
    >
      <TxRow tx={{ ...tx, paid }} expanded={expanded} onToggleExpand={() => setExpanded(v => !v)} />
      <AnimatePresence>
        {expanded && <TxExpanded key="expanded" tx={tx} onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Sortable item (transactions page) ─────────────────────────── */
function SortableItem({ transaction: tx }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const [paid, setPaid] = useState(tx.paid);
  useEffect(() => { setPaid(tx.paid); }, [tx.paid]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tx.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        position: 'relative',
        zIndex: isDragging ? 20 : 'auto' as React.CSSProperties['zIndex'],
      }}
      className={`border ${cardClass(paid)} transition-colors`}
    >
      <div className="flex items-stretch">
        <button
          {...attributes} {...listeners}
          className="pl-3 pr-1 flex items-center text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Arrastar para reordenar"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>
        <TxRow tx={{ ...tx, paid }} expanded={expanded} onToggleExpand={() => setExpanded(v => !v)} />
      </div>
      <AnimatePresence>
        {expanded && <TxExpanded key="expanded" tx={tx} onClose={() => setExpanded(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Public component ───────────────────────────────────────────── */
interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  draggable?: boolean;
  month?: number;
  year?: number;
}

export function TransactionList({ transactions, isLoading, draggable, month, year }: TransactionListProps) {
  const [ordered, setOrdered] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!draggable || !month || !year) return;
    setOrdered(applyOrder(transactions, month, year));
  }, [transactions, draggable, month, year]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !month || !year) return;
    setOrdered(prev => {
      const oldIdx = prev.findIndex(t => t.id === active.id);
      const newIdx = prev.findIndex(t => t.id === over.id);
      const next = arrayMove(prev, oldIdx, newIdx);
      saveOrder(month, year, next.map(t => t.id));
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface-200 rounded-xl animate-pulse" />)}
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

  if (draggable && month && year) {
    const list = ordered.length > 0 ? ordered : transactions;
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={list.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {list.map(tx => <SortableItem key={tx.id} transaction={tx} />)}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
      </AnimatePresence>
    </div>
  );
}
