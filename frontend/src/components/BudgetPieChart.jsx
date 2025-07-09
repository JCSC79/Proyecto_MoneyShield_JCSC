// src/components/BudgetPieChart.jsx

import { PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4caf50', '#f44336'];

export default function BudgetPieChart({ used, total }) {
  const data = [
    { name: 'Gastado', value: used },
    { name: 'Disponible', value: Math.max(total - used, 0) }
  ];
  return (
    <PieChart width={220} height={220}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={2}
        dataKey="value"
        label={({ name, percent }) =>
          `${name}: ${(percent * 100).toFixed(0)}%`
        }
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Legend />
    </PieChart>
  );
}
