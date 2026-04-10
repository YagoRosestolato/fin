'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Navbar } from '@/components/layout/Navbar';
import { TransactionModal } from '@/components/transactions/TransactionModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchProfile, user } = useAuthStore();
  const router = useRouter();
  const profileFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!profileFetched.current) {
      profileFetched.current = true;
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile, router]);

  useEffect(() => {
    if (user && user.salary === 0 && profileFetched.current) {
      router.replace('/onboarding');
    }
  }, [user, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh bg-surface-DEFAULT">
      <Navbar />
      {/* desktop: margem esquerda da sidebar | mobile: sem margem */}
      <main className="lg:ml-60">
        {children}
      </main>
      <TransactionModal />
    </div>
  );
}
