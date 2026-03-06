import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ── TERMINAL LOGO ──────────────────────────────────────────
function TerminalLogo() {
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect width="32" height="32" rx="8" fill="#0d1117" />
      <rect width="32" height="32" rx="8" fill="url(#glassGradNav)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <defs>
        <linearGradient id="glassGradNav" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>
        <filter id="blueGlowNav" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="underscoreGlowNav" x="-60%" y="-80%" width="220%" height="360%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        d="M7 12.5L12 16L7 19.5"
        stroke="#3b82f6" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round"
        filter="url(#blueGlowNav)"
      />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#3b82f6" filter="url(#underscoreGlowNav)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#60a5fa" />
    </svg>
  );
}

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <TerminalLogo />
          <span className="font-display text-lg font-bold text-foreground">
            Code<span style={{ color: "#3b82f6" }}>Canvas</span>
          </span>
        </motion.div>

        {/* ── Nav Links ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden md:flex items-center gap-8"
        >
          {["Features", "How It Works"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -1 }}
              className="relative group text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
              }}
            >
              {item}
              {/* ── Animated underline sweep ── */}
              <span
                style={{
                  position: "absolute",
                  bottom: -3,
                  left: 0,
                  height: 1.5,
                  width: "0%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                  transition: "width 0.25s ease",
                }}
                className="group-hover:!w-full"
              />
            </motion.a>
          ))}
        </motion.div>

        {/* ── Right Side ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {/* ── Sign in with underline sweep ── */}
          <Link
            to="/login"
            className="hidden sm:inline-block relative group text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.75)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
            }}
          >
            Sign in
            <span
              style={{
                position: "absolute",
                bottom: -3,
                left: 0,
                height: 1.5,
                width: "0%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                transition: "width 0.25s ease",
              }}
              className="group-hover:!w-full"
            />
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/register">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </motion.nav>
  );
};

export default Navbar;