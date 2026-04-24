'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpsertMonthlyConfig } from '@/hooks/useFinancial';
import { useAuthStore } from '@/stores/auth.store';
import { MONTH_NAMES } from '@/lib/utils';

const schema = z.object({
  salary: z.coerce.number().positive('Informe o salário recebido'),
  savingsGoal: z.coerce.number().min(0).max(100),
  paymentDay: z.coerce.number().min(1).max(31),
});
type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  existing?: { salary: number; savingsGoal: number; paymentDay: number } | null;
}

export function MonthlyConfigModal({ isOpen, onClose, month, year, existing }: Props) {
  const user = useAuthStore(s => s.user);
  const upsert = useUpsertMonthlyConfig();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      salary: existing?.salary ?? user?.salary ?? 0,
      savingsGoal: existing?.savingsGoal ?? user?.savingsGoal ?? 20,
      paymentDay: existing?.paymentDay ?? user?.paymentDay ?? 5,
    },
  });

  // Reset form when existing data arrives or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        salary: existing?.salary ?? user?.salary ?? 0,
        savingsGoal: existing?.savingsGoal ?? user?.savingsGoal ?? 20,
        paymentDay: existing?.paymentDay ?? user?.paymentDay ?? 5,
      });
    }
  }, [isOpen, existing, user, reset]);

  const onSubmit = async (data: FormData) => {
    await upsert.mutateAsync({ month, year, ...data });
    onClose();
  };

  const monthName = MONTH_NAMES[month - 1];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${monthName} ${year}`} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 mb-2">
          <Wallet size={15} className="text-brand-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            Configure quanto você recebeu e quer guardar neste mês.
          </p>
        </div>

        <Input
          label="Salário recebido (R$)"
          type="number"
          step="0.01"
          placeholder="Ex: 5000,00"
          error={errors.salary?.message}
          {...register('salary')}
        />

        <Input
          label="% para guardar"
          type="number"
          min="0"
          max="100"
          step="0.5"
          placeholder="Ex: 20"
          error={errors.savingsGoal?.message}
          {...register('savingsGoal')}
        />

        <Input
          label="Dia que recebe o salário"
          type="number"
          min="1"
          max="31"
          placeholder="Ex: 5"
          error={errors.paymentDay?.message}
          {...register('paymentDay')}
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" loading={upsert.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
