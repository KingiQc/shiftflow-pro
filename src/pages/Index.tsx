import { useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import AppLayout from "@/components/AppLayout";
import EarningsSummaryCard from "@/components/EarningsSummaryCard";
import StatMiniCard from "@/components/StatMiniCard";
import UpcomingEventsCard from "@/components/UpcomingEventsCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddShiftDialog from "@/components/AddShiftDialog";
import EarningsChart from "@/components/EarningsChart";
import ExpensePieChart from "@/components/ExpensePieChart";
import ForecastCard from "@/components/ForecastCard";

interface ShiftRow {
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  tips: number | null;
  premiums: number | null;
  jobs: { hourly_rate: number; name: string } | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ username: string; tax_rate: number; insurance_rate: number } | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [rawShifts, setRawShifts] = useState<ShiftRow[]>([]);
  const [expenses, setExpenses] = useState<{ category: string; amount: number }[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    avgHourlyRate: 0,
    tips: 0,
    wage: 0,
    premiums: 0,
    netEstimated: 0,
    netPercentage: 77,
    todayShiftTime: "--:--",
    todayForecast: 0,
  });

  const calcHours = (s: ShiftRow) => {
    const sp = s.start_time.split(":");
    const ep = s.end_time.split(":");
    const startH = parseInt(sp[0]) + parseInt(sp[1]) / 60;
    const endH = parseInt(ep[0]) + parseInt(ep[1]) / 60;
    const hrs = endH > startH ? endH - startH : 24 - startH + endH;
    return hrs - (s.break_minutes || 0) / 60;
  };

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [profileRes, shiftsRes, expensesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("shifts").select("*, jobs(hourly_rate, name)").eq("user_id", user.id),
      supabase.from("expenses").select("category, amount").eq("user_id", user.id),
    ]);

    if (profileRes.data) {
      setProfile({
        username: profileRes.data.username,
        tax_rate: profileRes.data.tax_rate || 0,
        insurance_rate: profileRes.data.insurance_rate || 0,
      });
    }

    if (expensesRes.data) setExpenses(expensesRes.data);

    const shifts = (shiftsRes.data || []) as unknown as ShiftRow[];
    setRawShifts(shifts);

    if (shifts.length > 0) {
      let totalWage = 0, totalTips = 0, totalPremiums = 0, totalHours = 0;
      const today = new Date().toISOString().split("T")[0];
      let todayStart = "";
      let todayEarnings = 0;

      for (const s of shifts) {
        const workHrs = calcHours(s);
        const rate = s.jobs?.hourly_rate || 0;
        const shiftWage = workHrs * rate;
        totalWage += shiftWage;
        totalTips += s.tips || 0;
        totalPremiums += s.premiums || 0;
        totalHours += workHrs;

        if (s.date === today) {
          todayStart = s.start_time.substring(0, 5);
          todayEarnings += shiftWage + (s.tips || 0) + (s.premiums || 0);
        }
      }

      const total = totalWage + totalTips + totalPremiums;
      const taxRate = (profileRes.data?.tax_rate || 0) / 100;
      const insRate = (profileRes.data?.insurance_rate || 0) / 100;
      const net = total * (1 - taxRate - insRate);

      setStats({
        totalEarnings: total,
        avgHourlyRate: totalHours > 0 ? total / totalHours : 0,
        tips: totalTips,
        wage: totalWage,
        premiums: totalPremiums,
        netEstimated: net,
        netPercentage: total > 0 ? Math.round((net / total) * 100) : 0,
        todayShiftTime: todayStart || "--:--",
        todayForecast: todayEarnings,
      });
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Chart data
  const chartShifts = useMemo(() => {
    return rawShifts.map((s) => {
      const workHrs = calcHours(s);
      const rate = s.jobs?.hourly_rate || 0;
      return {
        date: s.date,
        wage: workHrs * rate,
        tips: s.tips || 0,
        premiums: s.premiums || 0,
      };
    });
  }, [rawShifts]);

  // Forecast
  const forecast = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    let weekTotal = 0, monthTotal = 0, weekCount = 0, monthCount = 0;

    for (const s of rawShifts) {
      const d = parseISO(s.date);
      const workHrs = calcHours(s);
      const rate = s.jobs?.hourly_rate || 0;
      const total = workHrs * rate + (s.tips || 0) + (s.premiums || 0);

      if (d >= weekStart && d <= weekEnd) { weekTotal += total; weekCount++; }
      if (d >= monthStart && d <= monthEnd) { monthTotal += total; monthCount++; }
    }

    return { weeklyForecast: weekTotal, monthlyForecast: monthTotal, scheduledShiftsThisWeek: weekCount, scheduledShiftsThisMonth: monthCount };
  }, [rawShifts]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon icon="mdi:account" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-body text-foreground font-medium">
                {greeting()}, {profile?.username || "User"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="glass-card w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform">
              <Icon icon="mdi:gift-outline" className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="glass-card w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform">
              <Icon icon="mdi:binoculars" className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Earnings */}
        <EarningsSummaryCard
          totalEarnings={stats.totalEarnings}
          avgHourlyRate={stats.avgHourlyRate}
          tips={stats.tips}
          wage={stats.wage}
          premiums={stats.premiums}
          netEstimated={stats.netEstimated}
          netPercentage={stats.netPercentage}
        />

        {/* Forecast */}
        <ForecastCard
          weeklyForecast={forecast.weeklyForecast}
          monthlyForecast={forecast.monthlyForecast}
          scheduledShiftsThisWeek={forecast.scheduledShiftsThisWeek}
          scheduledShiftsThisMonth={forecast.scheduledShiftsThisMonth}
        />

        {/* Charts */}
        <EarningsChart shifts={chartShifts} />
        <ExpensePieChart expenses={expenses} />

        {/* Today Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:calendar-today" className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-body font-semibold text-foreground">Today</p>
              <p className="text-caption text-muted-foreground">Quick overview</p>
            </div>
          </div>
          <div className="flex gap-3">
            <StatMiniCard icon="mdi:clock-outline" label="Shift" value={stats.todayShiftTime} iconColor="text-primary" />
            <StatMiniCard icon="mdi:trending-up" label="Forecast" value={`$${stats.todayForecast.toFixed(1)}`} iconColor="text-primary" />
            <StatMiniCard icon="mdi:heart" label="Health" value="Ok" iconColor="text-destructive" />
          </div>
        </div>

        {/* Upcoming Events */}
        <UpcomingEventsCard />

        {/* Floating Buttons */}
        <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-auto lg:left-1/2 lg:translate-x-[200px] flex gap-3 z-40">
          <FloatingActionButton icon="mdi:calendar" onClick={() => {}} />
          <FloatingActionButton icon="mdi:plus" onClick={() => setShowAddShift(true)} />
        </div>
      </div>

      <AddShiftDialog
        open={showAddShift}
        onClose={() => setShowAddShift(false)}
        onAdded={fetchData}
      />
    </AppLayout>
  );
};

export default Dashboard;
