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
    <>
      {/* Mobile: bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-100/95 backdrop-blur-md border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            const isNotif = href.includes('notifications');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                  isActive ? 'text-brand-400' : 'text-gray-600 hover:text-gray-400'
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
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-surface-100 border-r border-white/5 z-40 px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-lg font-bold text-white">Fin</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            const isNotif = href.includes('notifications');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                )}
              >
                <div className="relative">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {isNotif && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 text-xs text-gray-700">Fin v1.0</div>
      </aside>
    </>
  );
}
