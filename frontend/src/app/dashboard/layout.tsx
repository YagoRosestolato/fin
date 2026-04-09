'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Navbar } from '@/components/layout/Navbar';
import { TransactionModal } from '@/components/transactions/TransactionModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchProfile, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, fetchProfile, router]);

  // Se perfil carregado e salário = 0 (nunca configurado), manda para onboarding
  useEffect(() => {
    if (user && user.salary === 0) {
      router.replace('/onboarding');
    }
  }, [user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh bg-surface-DEFAULT">
      {children}
      <Navbar />
      <TransactionModal />
    </div>
  );
}
