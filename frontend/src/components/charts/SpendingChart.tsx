'use client';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, CATEGORY_ICONS } from '@/lib/utils';
import { FinancialSummary } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

interface SpendingChartProps {
  summary: FinancialSummary;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-100 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-gray-300 font-medium">{payload[0].name}</p>
        <p className="text-brand-400 font-mono">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function SpendingPieChart({ summary }: SpendingChartProps) {
  const data = Object.entries(summary.spendingByCategory).map(([name, value]) => ({
    name: `${CATEGORY_ICONS[name.toLowerCase()] || '📦'} ${name}`,
    value,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
        <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
          Nenhum gasto registrado
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {data.slice(0, 4).map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-gray-400 truncate max-w-[120px]">{item.name}</span>
            </div>
            <span className="text-gray-300 font-mono">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SpendingTypeChart({ summary }: SpendingChartProps) {
  const data = Object.entries(summary.spendingByType).map(([type, value]) => ({
    type: type === 'DEBIT' ? 'Débito' : type === 'PIX' ? 'Pix' : type === 'CREDIT' ? 'Crédito' : 'Parcelado',
    value,
  }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Por Tipo</CardTitle></CardHeader>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="type" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
