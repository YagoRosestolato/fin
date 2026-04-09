import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ className, children, glow }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-200 border border-white/5 p-4',
        glow && 'shadow-lg shadow-brand-500/5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-base font-semibold text-gray-200', className)}>{children}</h3>;
}
