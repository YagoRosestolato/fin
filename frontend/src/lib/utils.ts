import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatMonth(month: number, year: number): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1));
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  DEBIT: 'Débito',
  PIX: 'Pix',
  CREDIT: 'Crédito',
  INSTALLMENT: 'Parcelado',
};

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  DEBIT: 'bg-red-500/20 text-red-400',
  PIX: 'bg-green-500/20 text-green-400',
  CREDIT: 'bg-yellow-500/20 text-yellow-400',
  INSTALLMENT: 'bg-purple-500/20 text-purple-400',
};

export const CATEGORY_ICONS: Record<string, string> = {
  alimentação: '🍔',
  transporte: '🚗',
  saúde: '💊',
  lazer: '🎬',
  moradia: '🏠',
  vestuário: '👕',
  educação: '📚',
  tecnologia: '💻',
  outros: '📦',
};

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, (value / total) * 100);
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
