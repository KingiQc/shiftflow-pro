import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface ShiftCardProps {
  jobName: string;
  jobColor: string;
  shiftName: string;
  hours: number;
  breakMinutes: number;
  hourlyRate: number;
  total: number;
  wage: number;
  tips?: number;
  premiums?: number;
  startTime: string;
  endTime: string;
  onClick?: () => void;
}

const ShiftCard = ({
  jobName,
  jobColor,
  shiftName,
  hours,
  breakMinutes,
  hourlyRate,
  total,
  wage,
  startTime,
  endTime,
  onClick,
}: ShiftCardProps) => {
  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <span className="badge-pill bg-primary text-primary-foreground text-caption">{startTime}</span>
        <div className="w-0.5 flex-1 bg-primary/40 my-1" />
        <span className="badge-pill bg-primary text-primary-foreground text-caption">{endTime}</span>
      </div>

      {/* Card */}
      <GlassCard hoverable className="flex-1 p-4" onClick={onClick}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: jobColor }} />
            <span className="text-caption text-primary font-medium">{jobName}</span>
          </div>
          <Icon icon="mdi:chevron-right" className="w-5 h-5 text-muted-foreground" />
        </div>

        <h3 className="text-section-title font-semibold text-foreground mb-3">{shiftName}</h3>

        <div className="flex gap-6 text-caption text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Icon icon="mdi:clock-outline" className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">{hours}</strong> hrs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="mdi:coffee-outline" className="w-4 h-4 text-warning" />
            <span><strong className="text-foreground">{breakMinutes}</strong> min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="mdi:trending-up" className="w-4 h-4 text-primary" />
            <span><strong className="text-foreground">${hourlyRate.toFixed(2)}</strong> /h</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-muted-foreground">TOTAL</p>
            <p className="text-section-title font-bold text-foreground">${total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="badge-pill bg-info/20 text-info text-caption">WAGE</span>
            <p className="text-body font-semibold text-primary mt-1">${wage.toFixed(2)}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ShiftCard;
