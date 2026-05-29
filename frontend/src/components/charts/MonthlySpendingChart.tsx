'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, MONTH_NAMES } from '@/lib/utils';

interface MonthlySpendingEntry {
  month: number;
  year: number;
  totalSpent: number;
  transactionCount: number;
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: MonthlySpendingEntry }>;
  label?: string;
}) => {
  if (active && payload?.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-surface-100 border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-gray-300 font-medium mb-1">{label}</p>
        <p className="text-red-400 font-mono font-semibold">{formatCurrency(entry.totalSpent)}</p>
        <p className="text-gray-500 mt-0.5">{entry.transactionCount} lançamento{entry.transactionCount !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export function MonthlySpendingChart({ data }: { data: MonthlySpendingEntry[] }) {
  const maxSpent = Math.max(...data.map(d => d.totalSpent), 1);

  const chartData = data.map(d => ({
    ...d,
    name: `${MONTH_NAMES[d.month - 1].slice(0, 3)}/${d.year.toString().slice(2)}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto por Mês</CardTitle>
        <span className="text-xs text-gray-500">{data.length} meses</span>
      </CardHeader>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="totalSpent" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={`${entry.year}-${entry.month}`}
                  fill={entry.totalSpent === maxSpent ? '#ef4444' : '#ef444466'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
