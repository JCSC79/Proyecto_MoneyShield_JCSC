// src/components/BudgetPieChart.jsx

import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4caf50', '#f44336'];
//const COLORS = ['#e53935', '#43a047'];
//const COLORS = ['#1976d2', '#e5e9ef'];

export default function BudgetPieChart({ used, total }) {
  const data = [
    { name: 'Gastado', value: used },
    { name: 'Disponible', value: Math.max(total - used, 0) }
  ];
  const pct = total ? Math.min(used / total * 100, 100) : 0;
  const COLORS = ['#e53935', '#43a047']; // rojo, verde moneyshield

  return (
    <PieChart width={180} height={180}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        dataKey="value"
        isAnimationActive={false}
        startAngle={90}
        endAngle={-270}
        labelLine={false}
        label={false} // quita labels sobre sectores
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      {/* Porcentaje grande en el centro */}
      <text
        x={90} y={95} textAnchor="middle"
        fontSize="32" fontWeight="bold"
        fill={pct > 100 ? "#e53935" : "#1976d2"}
        >{total ? `${pct.toFixed(0)}%` : "–"}</text>
    </PieChart>
  );
}
