import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";
type AccentColor = "orange" | "blue" | "green" | "purple" | "pink";

const ACCENT_MAP: Record<AccentColor, { primary: string; accent: string; glow: string; glowSec: string }> = {
  orange: { primary: "10 100% 62%", accent: "10 80% 50%", glow: "10 100% 62%", glowSec: "15 90% 68%" },
  blue: { primary: "210 100% 56%", accent: "210 80% 50%", glow: "210 100% 56%", glowSec: "215 90% 68%" },
  green: { primary: "142 70% 45%", accent: "142 60% 40%", glow: "142 70% 45%", glowSec: "148 65% 55%" },
  purple: { primary: "270 70% 60%", accent: "270 60% 50%", glow: "270 70% 60%", glowSec: "275 65% 68%" },
  pink: { primary: "330 80% 60%", accent: "330 70% 50%", glow: "330 80% 60%", glowSec: "335 75% 68%" },
};

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (t: Theme) => void;
  setAccentColor: (c: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark", accentColor: "orange", setTheme: () => {}, setAccentColor: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem("shifttap-theme") as Theme) || "dark"
  );
  const [accentColor, setAccentState] = useState<AccentColor>(() =>
    (localStorage.getItem("shifttap-accent") as AccentColor) || "orange"
  );

  const applyTheme = (t: Theme, a: AccentColor) => {
    const root = document.documentElement;
    const accent = ACCENT_MAP[a];

    if (t === "light") {
      root.style.setProperty("--background", "0 0% 97%");
      root.style.setProperty("--foreground", "0 0% 10%");
      root.style.setProperty("--card", "0 0% 100%");
      root.style.setProperty("--card-foreground", "0 0% 10%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "0 0% 10%");
      root.style.setProperty("--secondary", "0 0% 92%");
      root.style.setProperty("--secondary-foreground", "0 0% 30%");
      root.style.setProperty("--muted", "0 0% 90%");
      root.style.setProperty("--muted-foreground", "0 0% 45%");
      root.style.setProperty("--border", "0 0% 88%");
      root.style.setProperty("--input", "0 0% 88%");
      root.style.setProperty("--glass-bg", "0 0% 100% / 0.6");
      root.style.setProperty("--glass-border", "0 0% 0% / 0.08");
      root.style.setProperty("--sidebar-background", "0 0% 96%");
      root.style.setProperty("--sidebar-foreground", "0 0% 30%");
      root.style.setProperty("--sidebar-accent", "0 0% 92%");
      root.style.setProperty("--sidebar-accent-foreground", "0 0% 10%");
      root.style.setProperty("--sidebar-border", "0 0% 88%");
    } else {
      root.style.setProperty("--background", "0 0% 0%");
      root.style.setProperty("--foreground", "0 0% 95%");
      root.style.setProperty("--card", "0 0% 6%");
      root.style.setProperty("--card-foreground", "0 0% 95%");
      root.style.setProperty("--popover", "0 0% 8%");
      root.style.setProperty("--popover-foreground", "0 0% 95%");
      root.style.setProperty("--secondary", "0 0% 12%");
      root.style.setProperty("--secondary-foreground", "0 0% 80%");
      root.style.setProperty("--muted", "0 0% 14%");
      root.style.setProperty("--muted-foreground", "0 0% 55%");
      root.style.setProperty("--border", "0 0% 14%");
      root.style.setProperty("--input", "0 0% 14%");
      root.style.setProperty("--glass-bg", "0 0% 100% / 0.04");
      root.style.setProperty("--glass-border", "0 0% 100% / 0.08");
      root.style.setProperty("--sidebar-background", "0 0% 5%");
      root.style.setProperty("--sidebar-foreground", "0 0% 80%");
      root.style.setProperty("--sidebar-accent", "0 0% 10%");
      root.style.setProperty("--sidebar-accent-foreground", "0 0% 95%");
      root.style.setProperty("--sidebar-border", "0 0% 12%");
    }

    root.style.setProperty("--primary", accent.primary);
    root.style.setProperty("--accent", accent.accent);
    root.style.setProperty("--ring", accent.primary);
    root.style.setProperty("--glow-primary", accent.glow);
    root.style.setProperty("--glow-secondary", accent.glowSec);
    root.style.setProperty("--sidebar-primary", accent.primary);
    root.style.setProperty("--sidebar-ring", accent.primary);
  };

  useEffect(() => {
    applyTheme(theme, accentColor);
  }, [theme, accentColor]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("shifttap-theme", t);
  };

  const setAccentColor = (c: AccentColor) => {
    setAccentState(c);
    localStorage.setItem("shifttap-accent", c);
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
