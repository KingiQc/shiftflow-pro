import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try login with email first, if identifier looks like email
      const isEmail = identifier.includes("@");
      let email = identifier;

      if (!isEmail) {
        // Look up email by username
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", identifier)
          .maybeSingle();

        if (!profile) {
          toast({ title: "User not found", description: "No account with that username.", variant: "destructive" });
          setLoading(false);
          return;
        }

        // We need to get the email from auth - use a workaround: try signing in
        // Since we can't query auth.users, we'll attempt login with username as email fallback
        // The user should use their email or we need an edge function
        // For now, let's try the identifier as-is and show error
        toast({ title: "Please use your email to login", description: "Enter your email address instead of username.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Icon icon="mdi:clock-fast" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-balance font-bold text-foreground glow-text">ShiftTap</h1>
          <p className="text-muted-foreground mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email"
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="text-caption text-muted-foreground mb-1.5 block">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input"
              required
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-caption text-muted-foreground">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-secondary accent-primary"
              />
              See password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-body transition-all duration-300 hover:opacity-90 disabled:opacity-50 glow-accent mt-6"
          >
            {loading ? (
              <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-muted-foreground mt-6 text-caption">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
