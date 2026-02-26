import { useMemo } from "react";
import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface ShiftData {
  date: string;
  hours: number;
  earnings: number;
  jobName: string;
}

interface SmartInsightsCardsProps {
  shifts: ShiftData[];
}

const SmartInsightsCards = ({ shifts }: SmartInsightsCardsProps) => {
  const insights = useMemo(() => {
    if (shifts.length === 0) return [];

    const earningsByDay: Record<string, number> = {};
    const earningsByJob: Record<string, number> = {};
    let totalHours = 0;

    for (const s of shifts) {
      const dayName = new Date(s.date).toLocaleDateString("en", { weekday: "long" });
      earningsByDay[dayName] = (earningsByDay[dayName] || 0) + s.earnings;
      earningsByJob[s.jobName] = (earningsByJob[s.jobName] || 0) + s.earnings;
      totalHours += s.hours;
    }

    const bestDay = Object.entries(earningsByDay).sort((a, b) => b[1] - a[1])[0];
    const bestJob = Object.entries(earningsByJob).sort((a, b) => b[1] - a[1])[0];
    const avgShift = totalHours / shifts.length;
    const weeklyHours = totalHours / Math.max(1, Math.ceil(shifts.length / 5));

    const list = [
      {
        icon: "mdi:trophy",
        title: "Best Earning Day",
        value: bestDay[0],
        sub: `$${bestDay[1].toFixed(0)} total`,
        color: "text-warning",
        bg: "bg-warning/10",
      },
      {
        icon: "mdi:briefcase-check",
        title: "Top Job",
        value: bestJob[0],
        sub: `$${bestJob[1].toFixed(0)} earned`,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        icon: "mdi:timer-outline",
        title: "Avg Shift",
        value: `${avgShift.toFixed(1)}h`,
        sub: `${shifts.length} shifts`,
        color: "text-info",
        bg: "bg-info/10",
      },
    ];

    if (weeklyHours > 45) {
      list.push({
        icon: "mdi:alert-circle",
        title: "Burnout Risk",
        value: `${weeklyHours.toFixed(0)}h/wk`,
        sub: "Consider resting",
        color: "text-destructive",
        bg: "bg-destructive/10",
      });
    }

    return list;
  }, [shifts]);

  if (insights.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="mdi:lightbulb-on-outline" className="w-5 h-5 text-warning" />
        <p className="text-body font-semibold text-foreground">Smart Insights</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <GlassCard key={i} className="p-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-9 h-9 rounded-xl ${ins.bg} flex items-center justify-center mb-2`}>
              <Icon icon={ins.icon} className={`w-5 h-5 ${ins.color}`} />
            </div>
            <p className="text-caption text-muted-foreground">{ins.title}</p>
            <p className="text-card-title font-bold text-foreground truncate">{ins.value}</p>
            <p className="text-caption text-muted-foreground">{ins.sub}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default SmartInsightsCards;
