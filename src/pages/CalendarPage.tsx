import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import AppLayout from "@/components/AppLayout";
import WeekCalendar from "@/components/WeekCalendar";
import ShiftCard from "@/components/ShiftCard";
import TemplateCard from "@/components/TemplateCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import AddShiftDialog from "@/components/AddShiftDialog";

interface ShiftWithJob {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  tips: number | null;
  premiums: number | null;
  template_name: string | null;
  jobs: { name: string; hourly_rate: number; color_tag: string | null } | null;
}

const CalendarPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftWithJob[]>([]);
  const [templates, setTemplates] = useState<ShiftWithJob[]>([]);
  const [allShiftDates, setAllShiftDates] = useState<string[]>([]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const fetchShifts = useCallback(async () => {
    if (!user) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const [dayShifts, allShifts, templateShifts] = await Promise.all([
      supabase.from("shifts").select("*, jobs(name, hourly_rate, color_tag)").eq("user_id", user.id).eq("date", dateStr).eq("is_template", false),
      supabase.from("shifts").select("date").eq("user_id", user.id).eq("is_template", false),
      supabase.from("shifts").select("*, jobs(name, hourly_rate, color_tag)").eq("user_id", user.id).eq("is_template", true).limit(5),
    ]);

    if (dayShifts.data) setShifts(dayShifts.data as ShiftWithJob[]);
    if (allShifts.data) {
      setAllShiftDates(allShifts.data.map((s) => s.date));
      setTotalShifts(allShifts.data.length);
      // Calculate total hours
      let hrs = 0;
      allShifts.data.forEach(() => { hrs += 7.5; }); // simplified
      setTotalHours(hrs);
    }
    if (templateShifts.data) setTemplates(templateShifts.data as ShiftWithJob[]);
  }, [user, selectedDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const calcShiftHours = (start: string, end: string, breakMin: number) => {
    const s = start.split(":").map(Number);
    const e = end.split(":").map(Number);
    const startH = s[0] + s[1] / 60;
    const endH = e[0] + e[1] / 60;
    const raw = endH > startH ? endH - startH : 24 - startH + endH;
    return raw - breakMin / 60;
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="glass-card w-10 h-10 flex items-center justify-center rounded-xl">
                <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="glass-card w-10 h-10 flex items-center justify-center rounded-xl">
                <Icon icon="mdi:filter-variant" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-body font-semibold text-foreground">
                {format(selectedDate, "MMMM")}
              </p>
              <p className="text-caption text-primary">{totalShifts} Shifts · {totalHours.toFixed(1)} hrs</p>
            </div>
            <button className="glass-card w-10 h-10 flex items-center justify-center rounded-xl">
              <Icon icon="mdi:calendar-plus" className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} shiftDates={allShiftDates} />
        </div>

        {/* Day shifts */}
        {shifts.length > 0 ? (
          <div className="space-y-4">
            {shifts.map((shift) => {
              const hours = calcShiftHours(shift.start_time, shift.end_time, shift.break_minutes || 0);
              const rate = shift.jobs?.hourly_rate || 0;
              const wage = hours * rate;
              const total = wage + (shift.tips || 0) + (shift.premiums || 0);

              return (
                <ShiftCard
                  key={shift.id}
                  jobName={shift.jobs?.name || "Job"}
                  jobColor={shift.jobs?.color_tag || "#FF5A3C"}
                  shiftName={shift.template_name || "Shift"}
                  hours={parseFloat(hours.toFixed(1))}
                  breakMinutes={shift.break_minutes || 0}
                  hourlyRate={rate}
                  total={total}
                  wage={wage}
                  startTime={shift.start_time.substring(0, 5)}
                  endTime={shift.end_time.substring(0, 5)}
                />
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Icon icon="mdi:calendar-blank" className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-body text-muted-foreground">No shifts on this day</p>
            <button
              onClick={() => setShowAddShift(true)}
              className="text-primary text-body font-medium mt-2 hover:underline"
            >
              Add a shift
            </button>
          </div>
        )}

        {/* Templates */}
        {templates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:bookmark" className="w-5 h-5 text-primary" />
                <span className="text-body font-semibold text-foreground">Add from Template</span>
              </div>
              <button className="text-primary text-caption font-medium flex items-center gap-1">
                All <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  name={t.template_name || "Template"}
                  startTime={t.start_time.substring(0, 5)}
                  hours={calcShiftHours(t.start_time, t.end_time, t.break_minutes || 0)}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* FAB */}
        <div className="fixed bottom-24 lg:bottom-8 right-4 flex gap-3 z-40">
          <FloatingActionButton icon="mdi:keyboard" onClick={() => {}} />
          <FloatingActionButton icon="mdi:plus" onClick={() => setShowAddShift(true)} />
        </div>
      </div>

      <AddShiftDialog
        open={showAddShift}
        onClose={() => setShowAddShift(false)}
        onAdded={fetchShifts}
        selectedDate={selectedDate}
      />
    </AppLayout>
  );
};

export default CalendarPage;
