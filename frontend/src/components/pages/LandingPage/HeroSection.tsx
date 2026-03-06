import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import HowItWorksModal from "./HowItWorksModal";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const HeroSection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-background/30" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center pt-16">

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Your Code. <span className="text-gradient">Sharper.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          className="mt-16 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          An AI-powered workspace to save, organize, and improve your code snippets.
          Built for developers who want to learn faster and build smarter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* ── Primary CTA ── */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button variant="hero" size="lg" onClick={() => navigate(user ? "/dashboard" : "/register")}>
              Start Building
            </Button>
          </motion.div>

          {/* ── Secondary CTA ── */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Inter', system-ui, sans-serif",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(8px)",
                transition: "all 0.25s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid rgba(59,130,246,0.45)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                e.currentTarget.style.boxShadow = "0 0 20px -5px rgba(59,130,246,0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.18)";
                e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              See How It Works
            </button>
          </motion.div>
        </motion.div>
      </div>

      <HowItWorksModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};

export default HeroSection;