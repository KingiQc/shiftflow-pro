import { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import GlassCard from "./GlassCard";

interface ActiveShift {
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  tips: number | null;
  premiums: number | null;
  jobs: { hourly_rate: number; name: string } | null;
}

const LiveShiftTimer = () => {
  const { user } = useAuth();
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    supabase
      .from("shifts")
      .select("start_time, end_time, break_minutes, tips, premiums, jobs(hourly_rate, name)")
      .eq("user_id", user.id)
      .eq("date", today)
      .then(({ data }) => {
        if (!data) return;
        const active = (data as unknown as ActiveShift[]).find((s) => {
          const sp = s.start_time.split(":");
          const ep = s.end_time.split(":");
          const startMin = parseInt(sp[0]) * 60 + parseInt(sp[1]);
          const endMin = parseInt(ep[0]) * 60 + parseInt(ep[1]);
          const adjustedEnd = endMin > startMin ? endMin : endMin + 1440;
          return currentMinutes >= startMin && currentMinutes <= adjustedEnd;
        });
        if (active) setActiveShift(active);
      });
  }, [user]);

  useEffect(() => {
    if (!activeShift) return;
    const sp = activeShift.start_time.split(":");
    const startMin = parseInt(sp[0]) * 60 + parseInt(sp[1]);

    const tick = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const secs = (nowMin - startMin) * 60 + now.getSeconds();
      setElapsed(Math.max(0, secs));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const estimatedEarnings = useMemo(() => {
    if (!activeShift) return 0;
    const hours = elapsed / 3600;
    const breakHrs = (activeShift.break_minutes || 0) / 60;
    const workedHrs = Math.max(0, hours - breakHrs);
    const rate = activeShift.jobs?.hourly_rate || 0;
    return workedHrs * rate + (activeShift.tips || 0) + (activeShift.premiums || 0);
  }, [activeShift, elapsed]);

  const progress = useMemo(() => {
    if (!activeShift) return 0;
    const sp = activeShift.start_time.split(":");
    const ep = activeShift.end_time.split(":");
    const startMin = parseInt(sp[0]) * 60 + parseInt(sp[1]);
    const endMin = parseInt(ep[0]) * 60 + parseInt(ep[1]);
    const totalMin = endMin > startMin ? endMin - startMin : 1440 - startMin + endMin;
    return Math.min(100, (elapsed / 60 / totalMin) * 100);
  }, [activeShift, elapsed]);

  if (!activeShift) return null;

  return (
    <GlassCard className="p-5 animate-fade-in relative overflow-hidden">
      {/* Pulsing glow border */}
      <div className="absolute inset-0 rounded-[var(--radius)] animate-pulse-glow pointer-events-none" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
        <p className="text-body font-semibold text-foreground">Live Shift</p>
        <span className="text-caption text-muted-foreground ml-auto">
          {activeShift.jobs?.name || "Unknown Job"}
        </span>
      </div>

      <div className="text-center mb-4">
        <p className="text-balance font-bold text-foreground tracking-tight font-poppins tabular-nums">
          {formatTime(elapsed)}
        </p>
        <p className="text-card-title font-semibold text-primary mt-1">
          ${estimatedEarnings.toFixed(2)}
        </p>
        <p className="text-caption text-muted-foreground">estimated earnings</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-caption text-muted-foreground">
          {activeShift.start_time.substring(0, 5)}
        </span>
        <span className="text-caption text-muted-foreground">
          {activeShift.end_time.substring(0, 5)}
        </span>
      </div>
    </GlassCard>
  );
};

export default LiveShiftTimer;
