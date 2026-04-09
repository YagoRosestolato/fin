'use client';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Wallet, Shield, CalendarDays, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/utils';
import { FinancialSummary } from '@/types';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const spentPercentage = summary.salary > 0
    ? (summary.totalSpent / (summary.salary - summary.savedAmount)) * 100
    : 0;

  const cards = [
    {
      title: 'Disponível',
      value: summary.availableBalance,
      icon: Wallet,
      color: summary.isBelowSafety ? 'text-red-400' : 'text-emerald-400',
      bg: summary.isBelowSafety ? 'from-red-500/10 to-transparent' : 'from-emerald-500/10 to-transparent',
      badge: summary.isBelowSafety ? '⚠ Saldo baixo' : null,
    },
    {
      title: 'Gasto Total',
      value: summary.totalSpent,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'from-red-500/10 to-transparent',
    },
    {
      title: 'Guardado',
      value: summary.savedAmount,
      icon: PiggyBank,
      color: 'text-brand-400',
      bg: 'from-brand-500/10 to-transparent',
      sub: `${summary.savingsGoal}% do salário`,
    },
    {
      title: 'Gasto Diário',
      value: summary.dailyBudget,
      icon: CalendarDays,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-transparent',
      sub: `${summary.daysRemaining} dias restantes`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`bg-gradient-to-br ${card.bg} border-white/5`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{card.title}</span>
                <card.icon size={16} className={card.color} />
              </div>
              <p className={`text-lg font-bold font-mono ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
              {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
              {card.badge && (
                <span className="inline-flex mt-1 text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                  {card.badge}
                </span>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Uso do orçamento</span>
          <span className="text-xs text-gray-500">{spentPercentage.toFixed(0)}% usado</span>
        </div>
        <ProgressBar value={spentPercentage} showPercentage={false} />
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>Gasto: {formatCurrency(summary.totalSpent)}</span>
          <span>Disponível: {formatCurrency(summary.availableBalance)}</span>
        </div>
      </Card>

      {summary.safetyAmount > 0 && (
        <Card className="border-amber-500/10 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-300">Reserva de segurança</p>
              <p className="text-xs text-gray-500">
                Meta: {formatCurrency(summary.safetyAmount)} •{' '}
                {summary.isBelowSafety
                  ? <span className="text-red-400">Atenção: abaixo do limite!</span>
                  : <span className="text-emerald-400">Seguro</span>}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
