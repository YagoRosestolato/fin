'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FinancialSummary } from '@/types';

interface DailyBudgetCardProps {
  summary: FinancialSummary;
}

export function DailyBudgetCard({ summary }: DailyBudgetCardProps) {
  const { dailyBudget, daysRemaining, availableBalance, paymentDay } = summary;
  const isGood = dailyBudget > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-brand-500/20 via-brand-600/10 to-transparent border border-brand-500/20"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-brand-500/20 rounded-lg">
            <Zap size={14} className="text-brand-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">Método Diário</span>
        </div>

        <div className="text-center py-3">
          <p className="text-xs text-gray-400 mb-1">Você pode gastar hoje</p>
          <p className={`text-4xl font-bold font-mono ${isGood ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(dailyBudget)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {daysRemaining} dias até o dia {paymentDay}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Total disponível</p>
            <p className="text-sm font-mono font-semibold text-gray-200">{formatCurrency(availableBalance)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Dias restantes</p>
            <p className="text-sm font-mono font-semibold text-gray-200">{daysRemaining}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-3">
          Se não gastar hoje, acumula para amanhã
        </p>
      </div>
    </motion.div>
  );
}
