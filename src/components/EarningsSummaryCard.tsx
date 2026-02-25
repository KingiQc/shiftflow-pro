import { useState } from "react";
import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";

interface EarningsSummaryProps {
  totalEarnings: number;
  avgHourlyRate: number;
  tips: number;
  wage: number;
  premiums: number;
  netEstimated: number;
  netPercentage: number;
}

const EarningsSummaryCard = ({
  totalEarnings,
  avgHourlyRate,
  tips,
  wage,
  premiums,
  netEstimated,
  netPercentage,
}: EarningsSummaryProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k$`;
    return `${val.toFixed(2)}$`;
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-balance font-bold text-foreground glow-text">
        ${totalEarnings.toFixed(2)}
      </h2>
      <p className="text-muted-foreground text-body mt-1">
        Ø {avgHourlyRate.toFixed(1)}$/h
      </p>

      <div className="glass-card mt-5 p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <Icon icon="mdi:receipt-text-outline" className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-card-title font-semibold text-foreground">{formatCurrency(tips)}</p>
          <p className="text-caption text-muted-foreground">Tips</p>
        </div>
        <div>
          <Icon icon="mdi:briefcase-outline" className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-card-title font-semibold text-foreground">{formatCurrency(wage)}</p>
          <p className="text-caption text-muted-foreground">Wage</p>
        </div>
        <div>
          <Icon icon="mdi:trophy-outline" className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-card-title font-semibold text-foreground">{formatCurrency(premiums)}</p>
          <p className="text-caption text-muted-foreground">Premiums</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
          <span className="text-muted-foreground">Net (estimated)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-card-title font-semibold text-foreground">{formatCurrency(netEstimated)}</span>
          <span className="progress-pill">{netPercentage}%</span>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 mx-auto mt-3 text-primary text-caption font-medium hover:opacity-80 transition-opacity"
      >
        Show details
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
        />
      </button>

      {showDetails && (
        <div className="mt-4 space-y-2 animate-fade-in text-caption text-muted-foreground">
          <div className="flex justify-between">
            <span>Gross earnings</span>
            <span className="text-foreground">${totalEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated taxes</span>
            <span className="text-foreground">-${(totalEarnings - netEstimated).toFixed(2)}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default EarningsSummaryCard;
