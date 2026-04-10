'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useUIStore } from '@/stores/ui.store';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  type: z.enum(['DEBIT', 'CREDIT']),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

interface WalletQuickFormProps {
  onSuccess?: () => void;
}

export function WalletQuickForm({ onSuccess }: WalletQuickFormProps) {
  const closeModal = useUIStore(s => s.closeAddTransaction);
  const create = useCreateTransaction();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'DEBIT',
    },
  });

  const onSubmit = async (data: FormData) => {
    const d = new Date(data.date);
    // Adjust for timezone offset so date isn't shifted
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    try {
      await create.mutateAsync({
        name: data.name,
        amount: data.amount,
        type: data.type,
        date: data.date,
        referenceMonth: localDate.getMonth() + 1,
        referenceYear: localDate.getFullYear(),
        isFixed: false,
        tags: [],
      });
      onSuccess?.();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Apple Pay badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        <svg viewBox="0 0 30 12" className="h-5 w-auto" fill="currentColor">
          <path className="text-white" d="M5.6 2.3C5.2 2.8 4.6 3 4 3c-.1-.6.2-1.2.5-1.6C4.9.9 5.5.7 6 .6c.1.6-.2 1.2-.4 1.7zm.4.7c-.9 0-1.6.5-2 .5s-1-.5-1.7-.5C1.4 3 .5 3.6 0 4.5c-1 1.8-.3 4.4.7 5.9.5.7 1.1 1.5 1.9 1.5.7 0 1-.5 1.9-.5s1.1.5 1.9.5c.8 0 1.3-.7 1.8-1.5.6-.8.8-1.6.8-1.6-.1 0-1.5-.6-1.5-2.2 0-1.4 1.1-2 1.2-2.1-.7-1-1.7-1.1-2.1-1.1z" />
          <path className="text-white" d="M11.3.9v10.5h1.6V8h2.2c2 0 3.4-1.4 3.4-3.6S17.1.9 15.1.9h-3.8zm1.6 1.4H15c1.3 0 2.1.7 2.1 2.2 0 1.4-.8 2.2-2.1 2.2h-2.1V2.3zm8.1 9.2c1 0 1.9-.5 2.3-1.3h.1v1.2H25V5.7c0-1.6-1.3-2.7-3.2-2.7-1.8 0-3.1 1.1-3.2 2.6h1.5c.1-.7.8-1.2 1.6-1.2 1 0 1.6.5 1.6 1.4v.6l-2.1.1c-2 .1-3 .9-3 2.3 0 1.4 1.1 2.4 2.7 2.4zm.5-1.3c-.9 0-1.5-.4-1.5-1.1 0-.7.6-1.1 1.7-1.2l1.9-.1v.6c0 1-.8 1.8-2.1 1.8zm6.8 4.3c1.5 0 2.2-.6 2.8-2.3l2.7-7.5h-1.6l-1.8 5.8h-.1L28.5 6.7h-1.7l2.6 7.2-.1.4c-.2.7-.6 1-1.2 1-.1 0-.4 0-.5-.1v1.3c.1 0 .6.1.7.1z" />
        </svg>
        <span className="text-xs text-gray-400">Entrada rápida · Apple Pay / Wallet</span>
      </div>

      <Input
        label="Estabelecimento"
        placeholder="Ex: Supermercado, Posto, Farmácia..."
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

        {/* Credit / Debit toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400">Tipo</span>
          <div className="flex rounded-xl overflow-hidden border border-white/10 h-10">
            <label className="flex-1 flex items-center justify-center cursor-pointer has-[:checked]:bg-brand-500/20 has-[:checked]:text-brand-300 text-gray-400 text-sm transition-colors">
              <input type="radio" value="DEBIT" className="sr-only" {...register('type')} />
              Débito
            </label>
            <label className="flex-1 flex items-center justify-center cursor-pointer has-[:checked]:bg-brand-500/20 has-[:checked]:text-brand-300 text-gray-400 text-sm transition-colors border-l border-white/10">
              <input type="radio" value="CREDIT" className="sr-only" {...register('type')} />
              Crédito
            </label>
          </div>
        </div>
      </div>

      <Input
        label="Data"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <p className="text-xs text-gray-500">
        A categoria será detectada automaticamente pelo nome do estabelecimento.
      </p>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={create.isPending}>
          Adicionar
        </Button>
      </div>
    </form>
  );
}
