'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
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
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';
import { applyOrder, saveOrder } from '@/lib/transactionOrder';

/* ─── shared row content ─────────────────────────────────────────── */
function TxBody({
  tx, expanded, onToggle, onEdit, onDeleteConfirm, showDeleteConfirm, onCancelDelete, onDelete, deleting,
}: {
  tx: Transaction;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDeleteConfirm: () => void;
  showDeleteConfirm: boolean;
  onCancelDelete: () => void;
  onDelete: (all: boolean) => void;
  deleting: boolean;
}) {
  const categoryIcon = CATEGORY_ICONS[tx.category?.toLowerCase() || ''] || '📦';
  const typeColor = TRANSACTION_TYPE_COLORS[tx.type];

  return (
    <>
      <button
        className="flex-1 flex items-center gap-3 pr-3.5 py-3.5 text-left hover:bg-white/3 transition-colors min-w-0"
        onClick={onToggle}
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
            className="overflow-hidden w-full"
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
                    <Button size="sm" variant="secondary" className="flex-1" onClick={onCancelDelete}>Cancelar</Button>
                    <Button size="sm" variant="danger" className="flex-1" onClick={() => onDelete(false)} loading={deleting}>Só este</Button>
                    {(tx.isFixed || tx.installments) && (
                      <Button size="sm" variant="danger" className="flex-1" onClick={() => onDelete(true)} loading={deleting}>Todos</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={onEdit}>
                    <Pencil size={13} /> Editar
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={onDeleteConfirm}>
                    <Trash2 size={13} /> Excluir
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Static item (dashboard) ────────────────────────────────────── */
function TransactionItem({ transaction: tx }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeleteTransaction();
  const setEditing = useUIStore(s => s.setEditingTransaction);

  return (
    <motion.div
      layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      className="bg-surface-200 border border-white/5 rounded-xl overflow-hidden flex flex-col"
    >
      <TxBody
        tx={tx} expanded={expanded} onToggle={() => setExpanded(v => !v)}
        onEdit={() => setEditing(tx.id)}
        onDeleteConfirm={() => setConfirmDelete(true)}
        showDeleteConfirm={confirmDelete}
        onCancelDelete={() => setConfirmDelete(false)}
        onDelete={async (all) => { await del.mutateAsync({ id: tx.id, deleteAll: all }); setConfirmDelete(false); }}
        deleting={del.isPending}
      />
    </motion.div>
  );
}

/* ─── Sortable item (transactions page) ─────────────────────────── */
function SortableItem({ transaction: tx }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeleteTransaction();
  const setEditing = useUIStore(s => s.setEditingTransaction);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tx.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1, position: 'relative', zIndex: isDragging ? 20 : 'auto' }}
      className="bg-surface-200 border border-white/5 rounded-xl overflow-hidden flex flex-col"
    >
      <div className="flex flex-col">
        <div className="flex items-stretch">
          {/* drag handle */}
          <button
            {...attributes} {...listeners}
            className="pl-3 pr-1 flex items-center text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            aria-label="Arrastar para reordenar"
            tabIndex={-1}
          >
            <GripVertical size={16} />
          </button>
          <TxBody
            tx={tx} expanded={expanded} onToggle={() => setExpanded(v => !v)}
            onEdit={() => setEditing(tx.id)}
            onDeleteConfirm={() => setConfirmDelete(true)}
            showDeleteConfirm={confirmDelete}
            onCancelDelete={() => setConfirmDelete(false)}
            onDelete={async (all) => { await del.mutateAsync({ id: tx.id, deleteAll: all }); setConfirmDelete(false); }}
            deleting={del.isPending}
          />
        </div>
      </div>
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

  // Sync whenever the source list changes, preserving saved order
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
