import { Icon } from "@iconify/react";

interface FABProps {
  icon: string;
  onClick: () => void;
  className?: string;
}

const FloatingActionButton = ({ icon, onClick, className = "" }: FABProps) => {
  return (
    <button onClick={onClick} className={`floating-btn ${className}`}>
      <Icon icon={icon} className="w-6 h-6 text-foreground" />
    </button>
  );
};

export default FloatingActionButton;
