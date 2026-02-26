import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import GlassCard from "./GlassCard";

interface ExpensePieChartProps {
  expenses: { category: string; amount: number }[];
}

const COLORS = [
  "hsl(10, 100%, 62%)",   // primary
  "hsl(38, 92%, 50%)",    // warning
  "hsl(142, 70%, 45%)",   // success
  "hsl(210, 100%, 56%)",  // info
  "hsl(280, 70%, 55%)",   // purple
  "hsl(0, 84%, 60%)",     // destructive
];

const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) return null;

  return (
    <GlassCard className="p-5">
      <p className="text-body font-semibold text-foreground mb-3">Spending by Category</p>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 8%)",
                border: "1px solid hsl(0 0% 14%)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "hsl(0 0% 95%)",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-caption text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ExpensePieChart;
