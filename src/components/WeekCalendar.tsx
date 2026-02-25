import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  shiftDates?: string[];
}

const WeekCalendar = ({ selectedDate, onSelectDate, shiftDates = [] }: WeekCalendarProps) => {
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasShift = shiftDates.some((d) => isSameDay(new Date(d), day));

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200"
              style={isSelected ? { background: "hsl(var(--primary))" } : {}}
            >
              <span className={`text-caption font-medium ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {dayLabels[i]}
              </span>
              <span className={`text-card-title font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                {format(day, "d")}
              </span>
              {hasShift && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
