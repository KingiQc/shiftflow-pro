import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import GlassCard from "./GlassCard";

interface Shift {
  date: string;
  wage: number;
  tips: number;
  premiums: number;
}

interface EarningsChartProps {
  shifts: Shift[];
}

const EarningsChart = ({ shifts }: EarningsChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, { wage: number; tips: number; premiums: number }>();
    shifts.forEach((s) => {
      const key = s.date.substring(0, 7); // YYYY-MM
      const cur = map.get(key) || { wage: 0, tips: 0, premiums: 0 };
      cur.wage += s.wage;
      cur.tips += s.tips;
      cur.premiums += s.premiums;
      map.set(key, cur);
    });
    return Array.from(map, ([month, v]) => ({
      month: month.substring(5),
      wage: Math.round(v.wage),
      tips: Math.round(v.tips),
      premiums: Math.round(v.premiums),
    })).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [shifts]);

  if (data.length === 0) return null;

  return (
    <GlassCard className="p-5">
      <p className="text-body font-semibold text-foreground mb-3">Earnings Overview</p>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0 0% 55%)", fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 8%)",
                border: "1px solid hsl(0 0% 14%)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "hsl(0 0% 95%)",
              }}
              formatter={(value: number) => [`$${value}`, ""]}
            />
            <Bar dataKey="wage" stackId="a" fill="hsl(10, 100%, 62%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="tips" stackId="a" fill="hsl(38, 92%, 50%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="premiums" stackId="a" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default EarningsChart;
