'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TransactionType } from '@/types';
import { cn } from '@/lib/utils';

interface FiltersState {
  search: string;
  type: TransactionType | '';
  category: string;
}

interface TransactionFiltersProps {
  filters: FiltersState;
  categories: string[];
  onChange: (filters: FiltersState) => void;
}

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'PIX', label: 'Pix' },
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'INSTALLMENT', label: 'Parcelado' },
];

export function TransactionFilters({ filters, categories, onChange }: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = [filters.type, filters.category].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar gastos..."
          leftIcon={<Search size={15} />}
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className="relative px-3"
        >
          <SlidersHorizontal size={16} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-[9px] text-white flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-surface-200 rounded-xl p-3 space-y-3 border border-white/5">
          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onChange({ ...filters, type: t.value as TransactionType | '' })}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    filters.type === t.value
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Categoria</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onChange({ ...filters, category: '' })}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    !filters.category ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  )}
                >
                  Todas
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onChange({ ...filters, category: cat })}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                      filters.category === cat ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeCount > 0 && (
            <button
              onClick={() => onChange({ search: filters.search, type: '', category: '' })}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
