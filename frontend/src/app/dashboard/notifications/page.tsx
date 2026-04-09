'use client';
import { motion } from 'framer-motion';
import { Bell, BellOff, CheckCheck, Shield, Zap, AlertTriangle, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { Notification } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NOTIF_ICONS: Record<string, React.ElementType> = {
  LOW_BALANCE: AlertTriangle,
  DAILY_LIMIT: Zap,
  BILL_REMINDER: Bell,
  SAVING_GOAL: Shield,
  SYSTEM: Info,
};

const NOTIF_COLORS: Record<string, string> = {
  LOW_BALANCE: 'text-red-400 bg-red-500/10',
  DAILY_LIMIT: 'text-amber-400 bg-amber-500/10',
  BILL_REMINDER: 'text-blue-400 bg-blue-500/10',
  SAVING_GOAL: 'text-emerald-400 bg-emerald-500/10',
  SYSTEM: 'text-gray-400 bg-white/5',
};

function NotificationItem({ notification: n }: { notification: Notification }) {
  const markRead = useMarkNotificationRead();
  const Icon = NOTIF_ICONS[n.type] || Info;
  const colorClass = NOTIF_COLORS[n.type] || NOTIF_COLORS.SYSTEM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 p-4 rounded-xl border transition-all',
        n.read
          ? 'bg-surface-200 border-white/5 opacity-60'
          : 'bg-surface-200 border-brand-500/20 shadow-sm shadow-brand-500/5'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', n.read ? 'text-gray-400' : 'text-gray-100')}>
            {n.title}
          </p>
          {!n.read && (
            <button
              onClick={() => markRead.mutate(n.id)}
              className="flex-shrink-0 text-xs text-brand-400 hover:text-brand-300"
            >
              Lido
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
        <p className="text-xs text-gray-600 mt-1">{formatDate(n.createdAt)}</p>
      </div>
      {!n.read && (
        <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const notifications: Notification[] = data?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="pb-24">
      <Header title="Alertas" />

      <div className="page-container space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              {unread > 0 ? `${unread} não lida${unread > 1 ? 's' : ''}` : 'Tudo em dia'}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
            >
              <CheckCheck size={14} /> Marcar todas como lidas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex w-16 h-16 items-center justify-center bg-surface-200 rounded-2xl mb-4">
              <BellOff size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Nenhuma notificação</p>
            <p className="text-gray-600 text-sm mt-1">Você será alertado quando houver novidades</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
