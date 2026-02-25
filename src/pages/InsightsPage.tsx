import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";

interface Insight {
  icon: string;
  title: string;
  value: string;
  description: string;
  color: string;
}

const InsightsPage = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchInsights = async () => {
      const { data: shifts } = await supabase
        .from("shifts")
        .select("*, jobs(name, hourly_rate)")
        .eq("user_id", user.id)
        .eq("is_template", false);

      if (!shifts || shifts.length === 0) {
        setInsights([{
          icon: "mdi:information-outline",
          title: "No data yet",
          value: "Add shifts to see insights",
          description: "Start tracking your shifts to unlock smart insights.",
          color: "text-muted-foreground",
        }]);
        return;
      }

      // Calculate insights
      const earningsByDay: Record<string, number> = {};
      const earningsByJob: Record<string, number> = {};
      let totalHours = 0;
      let totalShifts = shifts.length;

      for (const s of shifts) {
        const sp = s.start_time.split(":").map(Number);
        const ep = s.end_time.split(":").map(Number);
        const sh = sp[0] + sp[1] / 60;
        const eh = ep[0] + ep[1] / 60;
        const hrs = (eh > sh ? eh - sh : 24 - sh + eh) - (s.break_minutes || 0) / 60;
        const rate = (s as any).jobs?.hourly_rate || 0;
        const earned = hrs * rate + (s.tips || 0) + (s.premiums || 0);
        totalHours += hrs;

        const dayName = new Date(s.date).toLocaleDateString("en", { weekday: "long" });
        earningsByDay[dayName] = (earningsByDay[dayName] || 0) + earned;

        const jobName = (s as any).jobs?.name || "Unknown";
        earningsByJob[jobName] = (earningsByJob[jobName] || 0) + earned;
      }

      const bestDay = Object.entries(earningsByDay).sort((a, b) => b[1] - a[1])[0];
      const bestJob = Object.entries(earningsByJob).sort((a, b) => b[1] - a[1])[0];
      const avgShiftLength = totalHours / totalShifts;
      const weeklyHours = totalHours / Math.max(1, Math.ceil(totalShifts / 5));

      const list: Insight[] = [
        {
          icon: "mdi:trophy",
          title: "Best Earning Day",
          value: bestDay ? bestDay[0] : "N/A",
          description: bestDay ? `$${bestDay[1].toFixed(0)} earned on ${bestDay[0]}s` : "",
          color: "text-warning",
        },
        {
          icon: "mdi:briefcase-check",
          title: "Highest Paying Job",
          value: bestJob ? bestJob[0] : "N/A",
          description: bestJob ? `$${bestJob[1].toFixed(0)} total earnings` : "",
          color: "text-primary",
        },
        {
          icon: "mdi:timer-outline",
          title: "Average Shift Length",
          value: `${avgShiftLength.toFixed(1)}h`,
          description: `Across ${totalShifts} shifts`,
          color: "text-info",
        },
      ];

      if (weeklyHours > 45) {
        list.push({
          icon: "mdi:alert-circle",
          title: "Burnout Warning",
          value: `${weeklyHours.toFixed(0)}h/week`,
          description: "You're working more than 45 hours per week. Consider taking breaks.",
          color: "text-destructive",
        });
      }

      setInsights(list);
    };

    fetchInsights();
  }, [user]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-section-title font-bold text-foreground">Smart Insights</h1>
          <p className="text-caption text-muted-foreground">AI-powered analysis of your work patterns</p>
        </div>

        <div className="space-y-3">
          {insights.map((insight, i) => (
            <GlassCard key={i} className="p-5 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon icon={insight.icon} className={`w-6 h-6 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-caption text-muted-foreground">{insight.title}</p>
                  <p className="text-card-title font-bold text-foreground">{insight.value}</p>
                  <p className="text-caption text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default InsightsPage;
