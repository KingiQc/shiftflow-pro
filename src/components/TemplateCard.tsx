import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface TemplateCardProps {
  name: string;
  startTime: string;
  hours: number;
  onClick: () => void;
}

const TemplateCard = ({ name, startTime, hours, onClick }: TemplateCardProps) => {
  return (
    <GlassCard hoverable className="p-4 min-w-[160px]" onClick={onClick}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon icon="mdi:clock-outline" className="w-4 h-4 text-primary" />
        <span className="text-body font-medium text-foreground">{startTime}</span>
      </div>
      <p className="text-card-title font-semibold text-foreground">{name}</p>
      <div className="flex items-center gap-1 mt-1 text-caption text-muted-foreground">
        <Icon icon="mdi:timer-sand" className="w-3.5 h-3.5" />
        <span>{hours} h</span>
      </div>
    </GlassCard>
  );
};

export default TemplateCard;
