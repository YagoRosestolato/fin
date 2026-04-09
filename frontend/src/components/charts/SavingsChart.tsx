'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';
import { MonthlySaving } from '@/types';

interface SavingsChartProps {
  history: MonthlySaving[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-100 border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-gray-400 mb-2">{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span className="text-gray-400">{p.dataKey === 'savedAmount' ? 'Guardado' : 'Gasto'}</span>
            <span className="text-gray-200 font-mono">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SavingsChart({ history }: SavingsChartProps) {
  const data = history.map(h => ({
    name: `${MONTH_NAMES[h.month - 1].slice(0, 3)}/${h.year.toString().slice(2)}`,
    savedAmount: h.savedAmount,
    totalSpent: h.totalSpent,
    balance: h.balance,
  }));

  const totalSaved = history.reduce((sum, h) => sum + h.savedAmount, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Histórico de Economia</CardTitle></CardHeader>
        <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
          Nenhum histórico ainda
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Economia</CardTitle>
        <span className="text-xs text-emerald-400 font-mono">+{formatCurrency(totalSaved)}</span>
      </CardHeader>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="savedAmount" stroke="#6366f1" fill="url(#savedGradient)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="totalSpent" stroke="#ef4444" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
