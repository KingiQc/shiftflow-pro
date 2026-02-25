import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface StatMiniCardProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

const StatMiniCard = ({ icon, label, value, iconColor = "text-primary" }: StatMiniCardProps) => {
  return (
    <GlassCard hoverable className="p-4 flex flex-col items-center gap-2 min-w-[100px] flex-1">
      <Icon icon={icon} className={`w-6 h-6 ${iconColor}`} />
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-card-title font-semibold text-foreground">{value}</span>
    </GlassCard>
  );
};

export default StatMiniCard;
