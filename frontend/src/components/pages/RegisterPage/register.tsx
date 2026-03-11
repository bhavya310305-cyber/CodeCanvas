import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

function TerminalLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#0d1117" />
      <rect width="32" height="32" rx="8" fill="url(#glassGradR)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <defs>
        <linearGradient id="glassGradR" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>
        <filter id="blueGlowR" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="underscoreGlowR" x="-60%" y="-80%" width="220%" height="360%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M7 12.5L12 16L7 19.5" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" filter="url(#blueGlowR)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#3b82f6" filter="url(#underscoreGlowR)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#60a5fa" />
    </svg>
  );
}

function CodeCanvasLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <TerminalLogo />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: "0.05em", fontFamily: "'Inter', system-ui, sans-serif", color: "#ffffff" }}>
          Code<span style={{ color: "#3b82f6" }}>Canvas</span>
        </span>
      </div>
    </div>
  );
}

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-muted", "bg-destructive", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  const isValid = form.fullName.trim() && form.email.trim() && form.password.length >= 6 && form.password === form.confirmPassword;

  const update = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  // ── shared Google handler ──────────────────────────────────
  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await api.post("/auth/google", { credential });
      const u = res.data.user;
      setUser({ id: u._id, name: u.fullName, email: u.email });
      toast.success(
        res.data.message === "Account created with Google"
          ? "Welcome to CodeCanvas!"
          : "Welcome back!"
      );
      navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Google sign-in failed");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await handleGoogleSuccess(tokenResponse.access_token);
    },
    onError: () => toast.error("Google sign-in failed"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await api.post("/api/auth/register", { name: form.fullName, email: form.email, password: form.password });
        const loginRes = await api.post("/api/auth/login", { email: form.email, password: form.password });
        const u = loginRes.data.user ?? loginRes.data;
        setUser({ id: u._id, name: u.fullName, email: u.email });
        toast.success("Welcome to CodeCanvas!");
        navigate("/dashboard");
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden"
      onClick={() => navigate("/")}
      style={{ cursor: "pointer" }}
    >
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover object-[center_30%] opacity-40 blur-sm scale-105" />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
        onClick={e => e.stopPropagation()}
        style={{ cursor: "default" }}
      >
        <div className="glass rounded-lg p-8 space-y-6">
          <Link to="/" className="flex items-center gap-2 justify-center">
            <CodeCanvasLogo />
          </Link>

          <div className="text-center space-y-1">
            <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start organizing and improving your code smarter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" error={errors.fullName}>
              <Input placeholder="John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#3C71DD] transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strengthLabel}</p>
                </div>
              )}
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#3C71DD] transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" variant="hero" className="w-full" disabled={!isValid}>
              Create Account
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ── Google Button — active ── */}
          <Button variant="heroOutline" className="w-full" onClick={() => googleLogin()}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.41l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default Register;