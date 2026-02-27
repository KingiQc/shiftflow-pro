import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { label: "Dashboard", icon: "mdi:view-dashboard", path: "/" },
  { label: "Calendar", icon: "mdi:calendar-month", path: "/calendar" },
  { label: "Insights", icon: "mdi:lightbulb-outline", path: "/insights" },
  { label: "Jobs", icon: "mdi:briefcase-outline", path: "/jobs" },
  { label: "Expenses", icon: "mdi:wallet-outline", path: "/expenses" },
  { label: "Settings", icon: "mdi:cog-outline", path: "/settings" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex max-w-5xl mx-auto min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 py-8 pr-4 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10 px-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon icon="mdi:clock-fast" className="w-6 h-6 text-primary" />
            </div>
            <span className="text-section-title font-bold text-foreground">ShiftTap</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-body font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon icon={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-destructive transition-colors text-body"
          >
            <Icon icon="mdi:logout" className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 pb-24 lg:pb-8 lg:pl-4 lg:border-l lg:border-border/30">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/30 px-2 py-2 z-50">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                <Icon icon={item.icon} className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
