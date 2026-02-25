import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import GlassCard from "@/components/GlassCard";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
}

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Other"];

const ExpensesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const fetchExpenses = async () => {
    if (!user) return;
    const { data } = await supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false });
    if (data) {
      setExpenses(data);
      setTotalExpenses(data.reduce((acc, e) => acc + e.amount, 0));
    }
  };

  useEffect(() => { fetchExpenses(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      category,
      amount: parseFloat(amount),
      description: description.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Expense added!" });
      setAmount("");
      setDescription("");
      setShowForm(false);
      fetchExpenses();
    }
    setLoading(false);
  };

  const categoryIcons: Record<string, string> = {
    Food: "mdi:food",
    Transport: "mdi:car",
    Bills: "mdi:file-document-outline",
    Shopping: "mdi:shopping",
    Health: "mdi:medical-bag",
    Other: "mdi:dots-horizontal",
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-section-title font-bold text-foreground">Expenses</h1>
            <p className="text-caption text-muted-foreground">Track your spending</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="glass-card w-10 h-10 flex items-center justify-center rounded-xl"
          >
            <Icon icon={showForm ? "mdi:close" : "mdi:plus"} className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Total */}
        <GlassCard className="p-5 text-center">
          <p className="text-caption text-muted-foreground">Total Expenses</p>
          <p className="text-balance font-bold text-destructive">${totalExpenses.toFixed(2)}</p>
        </GlassCard>

        {showForm && (
          <GlassCard className="p-5 animate-scale-in">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="auth-input">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Amount ($)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="auth-input" min="0.01" step="0.01" required />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1.5 block">Description (optional)</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="auth-input" placeholder="What was this for?" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto" /> : "Add Expense"}
              </button>
            </form>
          </GlassCard>
        )}

        <div className="space-y-3">
          {expenses.map((exp) => (
            <GlassCard key={exp.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon icon={categoryIcons[exp.category] || "mdi:currency-usd"} className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground">{exp.category}</p>
                  <p className="text-caption text-muted-foreground">{exp.description || exp.date}</p>
                </div>
              </div>
              <span className="text-body font-semibold text-destructive">-${exp.amount.toFixed(2)}</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExpensesPage;
