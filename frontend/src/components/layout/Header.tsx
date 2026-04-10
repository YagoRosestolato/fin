'use client';
import { useAuthStore } from '@/stores/auth.store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { MONTH_NAMES } from '@/lib/utils';

interface HeaderProps {
  title: string;
  showMonthPicker?: boolean;
  showAddButton?: boolean;
}

export function Header({ title, showMonthPicker, showAddButton }: HeaderProps) {
  const user = useAuthStore(s => s.user);
  const openAdd = useUIStore(s => s.openAddTransaction);
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useUIStore();

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  return (
    <header className="sticky top-0 z-30 bg-surface-DEFAULT/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <h1 className="text-lg font-bold text-gray-100">{title}</h1>
          {user && (
            <p className="text-xs text-gray-500 hidden sm:block">
              Olá, {user.name.split(' ')[0]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showMonthPicker && (
            <div className="flex gap-1.5">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="h-8 px-2 text-xs rounded-lg bg-surface-200 border border-white/10 text-gray-300 focus:outline-none"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={i + 1} className="bg-surface-100">{m.slice(0, 3)}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="h-8 px-2 text-xs rounded-lg bg-surface-200 border border-white/10 text-gray-300 focus:outline-none"
              >
                {yearOptions.map(y => (
                  <option key={y.value} value={y.value} className="bg-surface-100">{y.label}</option>
                ))}
              </select>
            </div>
          )}
          {showAddButton && (
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus size={16} /> <span className="hidden sm:inline">Novo gasto</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
