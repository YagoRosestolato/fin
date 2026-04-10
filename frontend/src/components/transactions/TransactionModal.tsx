'use client';
import { useState } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from './TransactionForm';
import { WalletQuickForm } from './WalletQuickForm';
import { useTransactions } from '@/hooks/useTransactions';

type Tab = 'manual' | 'wallet';

export function TransactionModal() {
  const { isAddTransactionOpen, editingTransaction, closeAddTransaction } = useUIStore();
  const { data } = useTransactions({ limit: 100 });
  const [activeTab, setActiveTab] = useState<Tab>('manual');

  const editingTx = editingTransaction
    ? data?.transactions?.find((t: { id: string }) => t.id === editingTransaction)
    : undefined;

  const isEditing = !!editingTx;

  const title = isEditing ? 'Editar gasto' : 'Novo gasto';

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={closeAddTransaction}
      title={title}
      size="md"
    >
      {/* Tabs — only shown when adding (not editing) */}
      {!isEditing && (
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5 -mt-1">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'bg-brand-500/20 text-brand-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-white/10 ${
              activeTab === 'wallet'
                ? 'bg-brand-500/20 text-brand-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Apple Pay
          </button>
        </div>
      )}

      {isEditing || activeTab === 'manual' ? (
        <TransactionForm transaction={editingTx} onSuccess={closeAddTransaction} />
      ) : (
        <WalletQuickForm onSuccess={closeAddTransaction} />
      )}
    </Modal>
  );
}
