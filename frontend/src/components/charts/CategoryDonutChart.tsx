'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

const COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6',
];

const CATEGORY_LABELS: Record<string, string> = {
  alimentação: 'Alimentação',
  transporte: 'Transporte',
  saúde: 'Saúde',
  lazer: 'Lazer',
  moradia: 'Moradia',
  vestuário: 'Vestuário',
  educação: 'Educação',
  tecnologia: 'Tecnologia',
  outros: 'Outros',
};

interface Props {
  spendingByCategory: Record<string, number>;
  totalSpent: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percent: number } }> }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-100 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-gray-200 mb-1">{payload[0].name}</p>
        <p className="text-gray-300 font-mono">{formatCurrency(payload[0].value)}</p>
        <p className="text-gray-500">{(payload[0].payload.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export function CategoryDonutChart({ spendingByCategory, totalSpent }: Props) {
  const data = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key.toLowerCase()] || key,
      value,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Divisão dos gastos (Categoria)</CardTitle></CardHeader>
        <div className="h-44 flex items-center justify-center text-gray-600 text-sm">
          Nenhum gasto registrado
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Divisão dos gastos (Categoria)</CardTitle>
        <span className="text-xs text-gray-500 font-mono">{formatCurrency(totalSpent)}</span>
      </CardHeader>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="38%"
              outerRadius="72%"
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda manual para melhor layout */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {data.map((item, i) => {
          const pct = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
                <span className="text-xs text-gray-400 truncate">{item.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
