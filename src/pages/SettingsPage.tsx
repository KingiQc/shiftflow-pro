import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";
import { Switch } from "@/components/ui/switch";

const ACCENT_OPTIONS = [
  { key: "orange" as const, label: "Orange", hsl: "10 100% 62%" },
  { key: "blue" as const, label: "Blue", hsl: "210 100% 56%" },
  { key: "green" as const, label: "Green", hsl: "142 70% 45%" },
  { key: "purple" as const, label: "Purple", hsl: "270 70% 60%" },
  { key: "pink" as const, label: "Pink", hsl: "330 80% 60%" },
];

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();
  const { toast } = useToast();
  const [taxRate, setTaxRate] = useState("0");
  const [insuranceRate, setInsuranceRate] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setTaxRate(String(data.tax_rate || 0));
        setInsuranceRate(String(data.insurance_rate || 0));
        setOtherDeductions(String(data.other_deductions || 0));
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      tax_rate: parseFloat(taxRate),
      insurance_rate: parseFloat(insuranceRate),
      other_deductions: parseFloat(otherDeductions),
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved!" });
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-section-title font-bold text-foreground">Settings</h1>
          <p className="text-caption text-muted-foreground">Configure your preferences</p>
        </div>

        {/* Theme */}
        <GlassCard className="p-5 space-y-5">
          <p className="text-card-title font-semibold text-foreground">Appearance</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon={theme === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"} className="w-5 h-5 text-primary" />
              <span className="text-body text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-3">Accent Color</p>
            <div className="flex gap-3">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAccentColor(opt.key)}
                  className={`w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
                    accentColor === opt.key ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: `hsl(${opt.hsl})` }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Deductions */}
        <GlassCard className="p-5 space-y-4">
          <p className="text-card-title font-semibold text-foreground">Deductions</p>
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="auth-input" min="0" max="100" step="0.1" />
          </div>
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">Insurance Rate (%)</label>
            <input type="number" value={insuranceRate} onChange={(e) => setInsuranceRate(e.target.value)} className="auth-input" min="0" max="100" step="0.1" />
          </div>
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">Other Deductions (%)</label>
            <input type="number" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} className="auth-input" min="0" max="100" step="0.1" />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto" /> : "Save Settings"}
          </button>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-caption text-muted-foreground mb-2">Account</p>
          <p className="text-body text-foreground mb-4">{user?.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-destructive text-body font-medium hover:opacity-80 transition-opacity"
          >
            <Icon icon="mdi:logout" className="w-5 h-5" />
            Sign Out
          </button>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
