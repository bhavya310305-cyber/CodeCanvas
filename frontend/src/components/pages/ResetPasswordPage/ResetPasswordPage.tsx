import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid = password.length >= 6 && confirmPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (password.length < 6) newErrors.password = "Min 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
      // If token is invalid/expired, show inline error too
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired")) {
        setErrors({ token: msg });
      }
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

          {!success ? (
            <>
              <div className="text-center space-y-1">
                <h1 className="font-display text-2xl font-bold text-foreground">Set new password</h1>
                <p className="text-sm text-muted-foreground">Must be at least 6 characters</p>
              </div>

              {/* Invalid / expired token error */}
              {errors.token && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
                  {errors.token}{" "}
                  <Link to="/forgot-password" className="font-medium underline underline-offset-2">
                    Request a new link
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "", token: "" })); }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })); }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={!isValid || isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            // ── Success state ──
            <div className="text-center space-y-4 py-2">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-foreground">Password reset!</h2>
                <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Back to sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;