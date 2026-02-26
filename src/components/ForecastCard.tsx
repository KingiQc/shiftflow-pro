import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface ForecastCardProps {
  weeklyForecast: number;
  monthlyForecast: number;
  scheduledShiftsThisWeek: number;
  scheduledShiftsThisMonth: number;
}

const ForecastCard = ({
  weeklyForecast,
  monthlyForecast,
  scheduledShiftsThisWeek,
  scheduledShiftsThisMonth,
}: ForecastCardProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon icon="mdi:chart-timeline-variant" className="w-5 h-5 text-muted-foreground" />
        <p className="text-body font-semibold text-foreground">Forecast</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Icon icon="mdi:calendar-week" className="w-4 h-4 text-primary" />
            </div>
            <span className="text-caption text-muted-foreground">This Week</span>
          </div>
          <p className="text-section-title font-bold text-foreground glow-text">
            ${weeklyForecast.toFixed(0)}
          </p>
          <p className="text-caption text-muted-foreground">
            {scheduledShiftsThisWeek} shift{scheduledShiftsThisWeek !== 1 ? "s" : ""}
          </p>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
              <Icon icon="mdi:calendar-month" className="w-4 h-4 text-warning" />
            </div>
            <span className="text-caption text-muted-foreground">This Month</span>
          </div>
          <p className="text-section-title font-bold text-foreground glow-text">
            ${monthlyForecast.toFixed(0)}
          </p>
          <p className="text-caption text-muted-foreground">
            {scheduledShiftsThisMonth} shift{scheduledShiftsThisMonth !== 1 ? "s" : ""}
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default ForecastCard;
