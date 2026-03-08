import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { toast } from "sonner";

function TerminalLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#0d1117" />
      <rect width="32" height="32" rx="8" fill="url(#glassGradL)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <defs>
        <linearGradient id="glassGradL" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>
        <filter id="blueGlowL" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="underscoreGlowL" x="-60%" y="-80%" width="220%" height="360%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M7 12.5L12 16L7 19.5" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" filter="url(#blueGlowL)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#3b82f6" filter="url(#underscoreGlowL)" />
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = /\S+@\S+\.\S+/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!isValid) { setError("Invalid email"); return; }
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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

          {!submitted ? (
            <>
              <div className="text-center space-y-1">
                <h1 className="font-display text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={!isValid || isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            // ── Success state ──
            <div className="text-center space-y-4 py-2">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-foreground">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  If <span className="text-foreground font-medium">{email}</span> is linked to an account, you'll receive a reset link shortly.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Didn't get it? Check your spam folder.</p>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;