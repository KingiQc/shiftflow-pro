import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";

interface Job {
  id: string;
  name: string;
  hourly_rate: number;
  color_tag: string | null;
}

const COLORS = ["#FF5A3C", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const JobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("15");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase.from("jobs").select("*").eq("user_id", user.id);
    if (data) setJobs(data);
  };

  useEffect(() => { fetchJobs(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      name: name.trim(),
      hourly_rate: parseFloat(rate),
      color_tag: color,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job added!" });
      setName("");
      setRate("15");
      setShowForm(false);
      fetchJobs();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchJobs();
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-section-title font-bold text-foreground">Jobs</h1>
            <p className="text-caption text-muted-foreground">Manage your employers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="glass-card w-10 h-10 flex items-center justify-center rounded-xl"
          >
            <Icon icon={showForm ? "mdi:close" : "mdi:plus"} className="w-5 h-5 text-primary" />
          </button>
        </div>

        {showForm && (
          <GlassCard className="p-5 animate-scale-in">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Job Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="auth-input" placeholder="e.g. Restaurant" required />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Hourly Rate ($)</label>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="auth-input" min="0" step="0.5" required />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: color === c ? "scale(1.2)" : "scale(1)",
                        boxShadow: color === c ? `0 0 12px ${c}80` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto" /> : "Add Job"}
              </button>
            </form>
          </GlassCard>
        )}

        {jobs.length === 0 && !showForm ? (
          <GlassCard className="p-8 text-center">
            <Icon icon="mdi:briefcase-plus" className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-body text-muted-foreground">No jobs yet. Add your first job to start tracking shifts.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <GlassCard key={job.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: job.color_tag || "#FF5A3C" }} />
                  <div>
                    <p className="text-body font-semibold text-foreground">{job.name}</p>
                    <p className="text-caption text-muted-foreground">${job.hourly_rate}/h</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(job.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobsPage;
