import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassCard = ({ children, className, hoverable = false, onClick, style }: GlassCardProps) => {
  return (
    <div
      className={cn(
        hoverable ? "glass-card-hover cursor-pointer" : "glass-card",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;
