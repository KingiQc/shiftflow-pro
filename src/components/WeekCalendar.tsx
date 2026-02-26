import { useMemo, useRef, useState } from "react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  shiftDates?: string[];
}

const WeekCalendar = ({ selectedDate, onSelectDate, shiftDates = [] }: WeekCalendarProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeTranslate, setSwipeTranslate] = useState(0);
  const [animating, setAnimating] = useState(false);

  const baseDate = useMemo(() => {
    let d = selectedDate;
    if (weekOffset > 0) d = addWeeks(selectedDate, weekOffset);
    if (weekOffset < 0) d = subWeeks(selectedDate, Math.abs(weekOffset));
    return d;
  }, [selectedDate, weekOffset]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(baseDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [baseDate]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    setSwipeTranslate(touchDeltaX.current * 0.3);
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    const threshold = 50;
    if (touchDeltaX.current > threshold) {
      setAnimating(true);
      setWeekOffset((p) => p - 1);
    } else if (touchDeltaX.current < -threshold) {
      setAnimating(true);
      setWeekOffset((p) => p + 1);
    }
    setSwipeTranslate(0);
    touchDeltaX.current = 0;
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div
      className="glass-card p-4 overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="grid grid-cols-7 gap-2"
        style={{
          transform: `translateX(${swipeTranslate}px)`,
          transition: swiping ? "none" : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          opacity: animating ? 0.7 : 1,
        }}
      >
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasShift = shiftDates.some((d) => isSameDay(new Date(d), day));

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isToday && !isSelected ? "ring-1 ring-primary/30" : ""
              }`}
              style={isSelected ? { background: "hsl(var(--primary))" } : {}}
            >
              <span className={`text-caption font-medium ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {dayLabels[i]}
              </span>
              <span className={`text-card-title font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                {format(day, "d")}
              </span>
              {hasShift && (
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
