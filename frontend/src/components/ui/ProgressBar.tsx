'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger';
  label?: string;
  showPercentage?: boolean;
}

const colors = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export function ProgressBar({ value, max = 100, className, color = 'brand', label, showPercentage }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const computedColor = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : color;

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5 text-xs text-gray-400">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colors[computedColor])}
        />
      </div>
    </div>
  );
}
