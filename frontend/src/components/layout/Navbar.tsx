'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Gastos' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Economia' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Alertas' },
  { href: '/dashboard/settings', icon: Settings, label: 'Perfil' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data } = useNotifications();
  const unread = data?.notifications?.filter((n: { read: boolean }) => !n.read).length || 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-100/95 backdrop-blur-md border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isNotif = href.includes('notifications');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-brand-400'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isNotif && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-brand-400' : '')}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-brand-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
