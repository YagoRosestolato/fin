'use client';
import { useUIStore } from '@/stores/ui.store';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from './TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';

export function TransactionModal() {
  const { isAddTransactionOpen, editingTransaction, closeAddTransaction } = useUIStore();
  const { data } = useTransactions({ limit: 100 });

  const editingTx = editingTransaction
    ? data?.transactions?.find((t: { id: string }) => t.id === editingTransaction)
    : undefined;

  const title = editingTx ? 'Editar gasto' : 'Novo gasto';

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={closeAddTransaction}
      title={title}
      size="md"
    >
      <TransactionForm transaction={editingTx} onSuccess={closeAddTransaction} />
    </Modal>
  );
}
