import { create } from 'zustand';

interface UIState {
  isAddTransactionOpen: boolean;
  editingTransaction: string | null;
  selectedMonth: number;
  selectedYear: number;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  setEditingTransaction: (id: string | null) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

const now = new Date();

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  editingTransaction: null,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  openAddTransaction: () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false, editingTransaction: null }),
  setEditingTransaction: (id) => set({ editingTransaction: id, isAddTransactionOpen: !!id }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
}));
