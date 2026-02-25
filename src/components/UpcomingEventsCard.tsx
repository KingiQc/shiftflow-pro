import { useState } from "react";
import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

const UpcomingEventsCard = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <GlassCard
        hoverable
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-body font-semibold text-foreground">Upcoming Events</p>
            <p className="text-caption text-muted-foreground">Your calendar for today</p>
          </div>
        </div>
        <Icon
          icon="mdi:chevron-up"
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
        />
      </GlassCard>

      {expanded && (
        <GlassCard className="p-4 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-body font-semibold text-foreground">No events today</p>
            <p className="text-caption text-muted-foreground">Your calendar for today</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default UpcomingEventsCard;
