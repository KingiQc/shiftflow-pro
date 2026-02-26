import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface BalanceTrendChartProps {
  earnings: { date: string; amount: number }[];
  expenses: { date: string; amount: number }[];
}

const BalanceTrendChart = ({ earnings, expenses }: BalanceTrendChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, { earnings: number; expenses: number }>();

    earnings.forEach((e) => {
      const key = e.date.substring(0, 7);
      const cur = map.get(key) || { earnings: 0, expenses: 0 };
      cur.earnings += e.amount;
      map.set(key, cur);
    });

    expenses.forEach((e) => {
      const key = e.date.substring(0, 7);
      const cur = map.get(key) || { earnings: 0, expenses: 0 };
      cur.expenses += e.amount;
      map.set(key, cur);
    });

    return Array.from(map, ([month, v]) => ({
      month: month.substring(5),
      balance: Math.round(v.earnings - v.expenses),
      earnings: Math.round(v.earnings),
      expenses: Math.round(v.expenses),
    }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [earnings, expenses]);

  const totalBalance = data.reduce((s, d) => s + d.balance, 0);

  if (data.length === 0) return null;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:chart-line" className="w-5 h-5 text-primary" />
          <p className="text-body font-semibold text-foreground">Monthly Balance</p>
        </div>
        <span className={`text-card-title font-bold ${totalBalance >= 0 ? "text-success" : "text-destructive"}`}>
          {totalBalance >= 0 ? "+" : ""}${totalBalance}
        </span>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }}
            />
            <YAxis hide />
            <ReferenceLine y={0} stroke="hsl(0 0% 20%)" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 8%)",
                border: "1px solid hsl(0 0% 14%)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "hsl(0 0% 95%)",
              }}
              formatter={(value: number, name: string) => [
                `$${value}`,
                name === "balance" ? "Balance" : name === "earnings" ? "Earnings" : "Expenses",
              ]}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(10, 100%, 62%)"
              strokeWidth={2.5}
              dot={{ fill: "hsl(10, 100%, 62%)", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default BalanceTrendChart;
