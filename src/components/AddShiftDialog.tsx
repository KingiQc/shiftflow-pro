import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "./GlassCard";

interface AddShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  selectedDate?: Date;
}

interface Job {
  id: string;
  name: string;
  hourly_rate: number;
  color_tag: string | null;
}

const AddShiftDialog = ({ open, onClose, onAdded, selectedDate }: AddShiftDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [breakMins, setBreakMins] = useState("30");
  const [tips, setTips] = useState("0");
  const [premiums, setPremiums] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0]);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      supabase.from("jobs").select("*").eq("user_id", user.id).then(({ data }) => {
        if (data) {
          setJobs(data);
          if (data.length > 0 && !jobId) setJobId(data[0].id);
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jobId) return;
    setLoading(true);

    const { error } = await supabase.from("shifts").insert({
      user_id: user.id,
      job_id: jobId,
      date,
      start_time: startTime,
      end_time: endTime,
      break_minutes: parseInt(breakMins),
      tips: parseFloat(tips),
      premiums: parseFloat(premiums),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Shift added!" });
      onAdded();
      onClose();
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-section-title font-bold text-foreground">Add Shift</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-body">You need to add a job first. Go to Jobs page.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">Job</label>
              <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="auth-input">
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.name} - ${j.hourly_rate}/h</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="auth-input" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Start</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="auth-input" required />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">End</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="auth-input" required />
              </div>
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">Break (min)</label>
              <input type="number" value={breakMins} onChange={(e) => setBreakMins(e.target.value)} className="auth-input" min="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Tips ($)</label>
                <input type="number" value={tips} onChange={(e) => setTips(e.target.value)} className="auth-input" min="0" step="0.01" />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Premiums ($)</label>
                <input type="number" value={premiums} onChange={(e) => setPremiums(e.target.value)} className="auth-input" min="0" step="0.01" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto" /> : "Add Shift"}
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
};

export default AddShiftDialog;
