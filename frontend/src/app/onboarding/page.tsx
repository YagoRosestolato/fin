'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Percent, Calendar, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { userApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const schema = z.object({
  salary: z.coerce.number().positive('Informe seu salário'),
  savingsGoal: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  paymentDay: z.coerce.number().min(1, 'Mínimo dia 1').max(31, 'Máximo dia 31'),
  safetyAmount: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  {
    id: 'salary',
    title: 'Qual é o seu salário?',
    subtitle: 'Usamos para calcular quanto você pode gastar por dia.',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
  {
    id: 'savings',
    title: 'Quanto quer guardar?',
    subtitle: 'Define a porcentagem do salário que vai direto para a poupança.',
    icon: Percent,
    color: 'text-brand-400',
    bg: 'bg-brand-500/15',
  },
  {
    id: 'payment',
    title: 'Quando você recebe?',
    subtitle: 'O dia do mês em que cai seu salário.',
    icon: Calendar,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  {
    id: 'safety',
    title: 'Reserva de segurança',
    subtitle: 'Te avisamos quando o saldo cair abaixo desse valor.',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const { user, updateUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { savingsGoal: 20, paymentDay: 5, safetyAmount: 500 },
  });

  const salary = watch('salary') || 0;
  const savingsGoal = watch('savingsGoal') || 0;
  const savedAmount = (salary * savingsGoal) / 100;
  const available = salary - savedAmount;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    const fieldMap: Record<number, (keyof FormData)[]> = {
      0: ['salary'],
      1: ['savingsGoal'],
      2: ['paymentDay'],
      3: ['safetyAmount'],
    };
    const valid = await trigger(fieldMap[step]);
    if (!valid) return;
    if (!isLast) {
      setStep(s => s + 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile(data);
      updateUser(res.data.data);
      router.push('/dashboard');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh min-h-screen bg-surface-DEFAULT flex flex-col">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full px-6 pt-12 pb-8">

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step ? 'bg-brand-500 flex-1' :
                i === step ? 'bg-brand-400 flex-[2]' :
                'bg-white/10 flex-1'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              {/* Icon + title */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${currentStep.bg}`}>
                <currentStep.icon size={26} className={currentStep.color} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
              <p className="text-gray-400 text-sm mb-8">{currentStep.subtitle}</p>

              {/* Step inputs */}
              {step === 0 && (
                <div className="space-y-4">
                  <Input
                    label="Salário mensal (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3500,00"
                    leftIcon={<DollarSign size={15} />}
                    error={errors.salary?.message}
                    autoFocus
                    {...register('salary')}
                  />
                  {salary > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400"
                    >
                      Salário de {formatCurrency(salary)} registrado ✓
                    </motion.div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Porcentagem para guardar (%)"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 20"
                    leftIcon={<Percent size={15} />}
                    error={errors.savingsGoal?.message}
                    autoFocus
                    {...register('savingsGoal')}
                  />
                  {salary > 0 && savingsGoal > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface-200 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Guardar por mês</span>
                        <span className="font-mono font-semibold text-emerald-400">{formatCurrency(savedAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Disponível para gastar</span>
                        <span className="font-mono font-semibold text-brand-400">{formatCurrency(available)}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Input
                    label="Dia do pagamento"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 5"
                    leftIcon={<Calendar size={15} />}
                    error={errors.paymentDay?.message}
                    autoFocus
                    {...register('paymentDay')}
                  />
                  <p className="text-xs text-gray-600">
                    O app vai calcular quanto você pode gastar por dia com base nos dias restantes até esse dia.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Input
                    label="Valor mínimo de segurança (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 500,00"
                    leftIcon={<Shield size={15} />}
                    error={errors.safetyAmount?.message}
                    autoFocus
                    {...register('safetyAmount')}
                  />
                  <p className="text-xs text-gray-600">
                    Quando seu saldo disponível cair abaixo disso, você recebe um alerta. Pode deixar 0 para desativar.
                  </p>

                  {/* Summary */}
                  {salary > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface-200 rounded-xl p-4 space-y-2 mt-2"
                    >
                      <p className="text-xs font-medium text-gray-400 mb-3">Resumo do seu perfil</p>
                      {[
                        { label: 'Salário', value: formatCurrency(salary), color: 'text-gray-200' },
                        { label: `Guardado (${savingsGoal}%)`, value: formatCurrency(savedAmount), color: 'text-emerald-400' },
                        { label: 'Disponível', value: formatCurrency(available), color: 'text-brand-400' },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{r.label}</span>
                          <span className={`font-mono font-semibold ${r.color}`}>{r.value}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              <div className="mt-auto pt-8">
                {!isLast ? (
                  <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                    Continuar <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button type="submit" className="w-full" size="lg" loading={saving}>
                    <Check size={16} /> Concluir configuração
                  </Button>
                )}

                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
                  >
                    Voltar
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
