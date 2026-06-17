import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#94A3B8'];

export default function SummaryChart({ summary }) {
  const data = [
    { name: 'Full Match',         value: summary.matched },
    { name: 'Mismatch',           value: summary.mismatched },
    { name: 'Missing in Target',  value: summary.missingInTarget },
    { name: 'Missing in Source',  value: summary.missingInSource },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((_entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => val.toLocaleString()} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
