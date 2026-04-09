'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User, DollarSign, Percent, Shield, Calendar,
  LogOut, Trash2, ChevronRight, CheckCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { AxiosError } from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  salary: z.coerce.number().min(0, 'Valor inválido'),
  savingsGoal: z.coerce.number().min(0).max(100, 'Máximo 100%'),
  safetyAmount: z.coerce.number().min(0),
  paymentDay: z.coerce.number().min(1).max(31),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const qc = useQueryClient();
  const router = useRouter();

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      salary: user?.salary || 0,
      savingsGoal: user?.savingsGoal || 20,
      safetyAmount: user?.safetyAmount || 500,
      paymentDay: user?.paymentDay || 5,
    },
  });

  const salary = watch('salary') || 0;
  const savingsGoal = watch('savingsGoal') || 0;
  const savedAmount = (salary * savingsGoal) / 100;
  const available = salary - savedAmount;

  const onSubmit = async (data: FormData) => {
    try {
      const res = await userApi.updateProfile(data);
      updateUser(res.data.data);
      qc.invalidateQueries({ queryKey: ['summary'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userApi.deleteAccount();
      await logout();
      router.push('/auth/login');
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-24">
      <Header title="Perfil" />

      <div className="page-container space-y-4">
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm"
          >
            <CheckCircle size={16} /> Perfil atualizado com sucesso!
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Dados pessoais</CardTitle></CardHeader>
            <Input label="Nome" leftIcon={<User size={15} />} error={errors.name?.message} {...register('name')} />
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign size={16} /> Financeiro</CardTitle></CardHeader>
            <div className="space-y-3">
              <Input label="Salário (R$)" type="number" step="0.01" leftIcon={<DollarSign size={15} />}
                error={errors.salary?.message} {...register('salary')} />
              <Input label="% para guardar" type="number" min="0" max="100"
                leftIcon={<Percent size={15} />} error={errors.savingsGoal?.message} {...register('savingsGoal')} />
              <Input label="Dia do pagamento" type="number" min="1" max="31"
                leftIcon={<Calendar size={15} />} error={errors.paymentDay?.message} {...register('paymentDay')} />
              <Input label="Reserva de segurança (R$)" type="number" step="0.01"
                leftIcon={<Shield size={15} />} error={errors.safetyAmount?.message} {...register('safetyAmount')} />

              {salary > 0 && (
                <div className="bg-surface-300 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-400 mb-2">Simulação</p>
                  {[
                    { label: 'Salário', value: salary, color: 'text-gray-200' },
                    { label: `Guardado (${savingsGoal}%)`, value: savedAmount, color: 'text-emerald-400' },
                    { label: 'Disponível para gastos', value: available, color: 'text-brand-400' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={`font-mono font-medium ${row.color}`}>{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Salvar alterações
          </Button>
        </form>

        <Card className="border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Conta</p>
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="text-gray-500" />
                <span className="text-sm">Sair da conta</span>
              </div>
              <ChevronRight size={14} className="text-gray-600" />
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-red-500/5 text-red-400 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={16} />
                <span className="text-sm">Excluir conta</span>
              </div>
              <ChevronRight size={14} className="text-red-600" />
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-700">
          Fin v1.0.0 • Dados protegidos conforme LGPD
        </p>
      </div>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Excluir conta" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Esta ação é <strong className="text-white">irreversível</strong>. Todos os seus dados serão excluídos permanentemente.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={handleDeleteAccount} loading={isDeleting}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
