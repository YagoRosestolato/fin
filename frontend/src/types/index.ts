export type TransactionType = 'DEBIT' | 'PIX' | 'CREDIT' | 'INSTALLMENT';
export type NotificationType = 'LOW_BALANCE' | 'DAILY_LIMIT' | 'BILL_REMINDER' | 'SAVING_GOAL' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string;
  salary: number;
  savingsGoal: number;
  safetyAmount: number;
  paymentDay: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string | null;
  tags: string[];
  notes: string | null;
  date: string;
  referenceMonth: number;
  referenceYear: number;
  isFixed: boolean;
  installments: number | null;
  installmentNumber: number | null;
  parentId: string | null;
  createdAt: string;
}

export interface FinancialSummary {
  salary: number;
  savingsGoal: number;
  savedAmount: number;
  totalSpent: number;
  availableBalance: number;
  safetyAmount: number;
  isBelowSafety: boolean;
  dailyBudget: number;
  daysRemaining: number;
  paymentDay: number;
  spendingByCategory: Record<string, number>;
  spendingByType: Record<string, number>;
  transactionCount: number;
}

export interface MonthlySaving {
  month: number;
  year: number;
  totalSpent: number;
  transactionCount: number;
  savedAmount: number;
  balance: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  category?: string;
  type?: TransactionType;
  search?: string;
  page?: number;
  limit?: number;
}
