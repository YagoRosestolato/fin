'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { getCurrentMonthYear, MONTH_NAMES } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { format } from 'date-fns';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  type: z.enum(['DEBIT', 'PIX', 'CREDIT', 'INSTALLMENT']),
  category: z.string().optional(),
  notes: z.string().optional(),
  date: z.string(),
  referenceMonth: z.coerce.number().min(1).max(12),
  referenceYear: z.coerce.number(),
  isFixed: z.boolean().optional().default(false),
  installments: z.coerce.number().min(1).max(120).optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = ['alimentação', 'transporte', 'saúde', 'lazer', 'moradia', 'vestuário', 'educação', 'tecnologia', 'outros'];

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const { month, year } = getCurrentMonthYear();
  const closeModal = useUIStore(s => s.closeAddTransaction);
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: transaction ? {
      name: transaction.name,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category || '',
      notes: transaction.notes || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      referenceMonth: transaction.referenceMonth,
      referenceYear: transaction.referenceYear,
      isFixed: transaction.isFixed,
      installments: transaction.installments || undefined,
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      referenceMonth: month,
      referenceYear: year,
      type: 'PIX',
      isFixed: false,
    },
  });

  const type = watch('type');
  const isFixed = watch('isFixed');

  const onSubmit = async (data: FormData) => {
    try {
      if (transaction) {
        await update.mutateAsync({ id: transaction.id, data });
      } else {
        await create.mutateAsync(data);
      }
      onSuccess?.();
      closeModal();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const isLoading = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome do gasto"
        placeholder="Ex: iFood, Uber, Academia..."
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          placeholder="0,00"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Select
          label="Tipo"
          options={[
            { value: 'PIX', label: 'Pix' },
            { value: 'DEBIT', label: 'Débito' },
            { value: 'CREDIT', label: 'Crédito' },
            { value: 'INSTALLMENT', label: 'Parcelado' },
          ]}
          {...register('type')}
        />
      </div>

      {type === 'INSTALLMENT' && (
        <Input
          label="Número de parcelas"
          type="number"
          min="2"
          max="120"
          placeholder="Ex: 12"
          error={errors.installments?.message}
          {...register('installments')}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Mês de referência"
          options={MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }))}
          {...register('referenceMonth')}
        />
        <Input
          label="Ano"
          type="number"
          min="2020"
          max="2100"
          {...register('referenceYear')}
        />
      </div>

      <Input
        label="Data"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <Select
        label="Categoria (opcional)"
        options={[
          { value: '', label: 'Detectar automaticamente' },
          ...CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
        ]}
        {...register('category')}
      />

      <Input
        label="Observações (opcional)"
        placeholder="Detalhes adicionais..."
        {...register('notes')}
      />

      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" className="sr-only peer" {...register('isFixed')} />
          <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-brand-500 transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </div>
        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
          Gasto fixo (repete mensalmente)
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={isLoading}>
          {transaction ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}
