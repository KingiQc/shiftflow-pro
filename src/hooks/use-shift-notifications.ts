import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const REMINDER_MINUTES_BEFORE = 15;

const useShiftNotifications = () => {
  const { user } = useAuth();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }, []);

  const scheduleNotifications = useCallback(async () => {
    if (!user) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const today = new Date().toISOString().split("T")[0];
    const { data: shifts } = await supabase
      .from("shifts")
      .select("start_time, jobs(name)")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("is_template", false);

    if (!shifts) return;

    const now = Date.now();

    for (const shift of shifts) {
      const [h, m] = (shift.start_time as string).split(":").map(Number);
      const shiftStart = new Date();
      shiftStart.setHours(h, m, 0, 0);
      const notifyAt = shiftStart.getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000;
      const delay = notifyAt - now;

      if (delay > 0) {
        const jobName = (shift as any).jobs?.name || "Work";
        const timeout = setTimeout(() => {
          new Notification("ShiftTap Reminder", {
            body: `Your shift at ${jobName} starts in ${REMINDER_MINUTES_BEFORE} minutes`,
            icon: "/favicon.ico",
          });
        }, delay);
        timeoutsRef.current.push(timeout);
      }
    }
  }, [user, requestPermission]);

  useEffect(() => {
    scheduleNotifications();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [scheduleNotifications]);

  return { requestPermission };
};

export default useShiftNotifications;
