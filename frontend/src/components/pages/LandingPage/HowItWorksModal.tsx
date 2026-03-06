import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, FileCode, Clock, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function useTypingEffect(text: string, speed = 30, active = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);
  return displayed;
}

const MOCK_CODE = `function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`;

const AI_MESSAGES = [
  "Analyzing your TypeScript snippet...",
  "This function implements the **debounce** pattern — it delays invoking `fn` until `delay` ms have elapsed since the last call.",
  "✅ No bugs detected. Consider adding a `cancel()` method for cleanup in React useEffect hooks.",
];

const SNIPPETS = [
  { title: "Debounce Function", lang: "typescript", time: "45m ago" },
  { title: "Responsive Grid", lang: "html", time: "2h ago" },
  { title: "useLocalStorage", lang: "typescript", time: "1d ago" },
];

const PANEL = {
  bg: "#0a0f1e",
  border: "rgba(255,255,255,0.07)",
  text: "rgba(255,255,255,0.88)",
  muted: "rgba(255,255,255,0.38)",
  blue: "#3b82f6",
  inputBg: "rgba(255,255,255,0.04)",
};

function StepPasteCode({ active }: { active: boolean }) {
  const typed = useTypingEffect(MOCK_CODE, 18, active);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 0 30px -5px rgba(59,130,246,0.15)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${PANEL.border}`, background: "rgba(13,17,23,0.95)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <span style={{ fontSize: 12, color: PANEL.muted, marginLeft: 8, fontFamily: "'Inter',sans-serif" }}>debounce.ts</span>
        </div>
        <div style={{ padding: "16px 20px", minHeight: 200, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12.5, lineHeight: 1.7, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {typed}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ display: "inline-block", width: 2, height: 16, background: PANEL.blue, marginLeft: 1, verticalAlign: "text-bottom" }}
          />
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: PANEL.muted, fontFamily: "'Inter',sans-serif" }}>
        Drop any snippet into your workspace
      </p>
    </motion.div>
  );
}

function StepAIAnalyze({ active }: { active: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) { setVisibleMessages(0); return; }
    setVisibleMessages(0);
    const timers = AI_MESSAGES.map((_, i) =>
      setTimeout(() => setVisibleMessages(i + 1), 800 + i * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  const chips = ["Explain Logic", "Find Bugs", "Optimize"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div style={{ display: "flex", gap: 12, height: 280 }}>
        <div style={{ flex: "0 0 45%", background: PANEL.bg, border: `1px solid ${PANEL.border}`, borderRadius: 12, overflow: "hidden", opacity: 0.6 }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${PANEL.border}`, fontSize: 11, color: PANEL.muted }}>debounce.ts</div>
          <div style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 10.5, lineHeight: 1.6, color: "#94a3b8", whiteSpace: "pre-wrap", overflow: "hidden", maxHeight: 220 }}>
            {MOCK_CODE.slice(0, 200)}...
          </div>
        </div>
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ flex: 1, background: PANEL.bg, border: `1px solid ${PANEL.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${PANEL.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles style={{ width: 14, height: 14, color: PANEL.blue }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: PANEL.text }}>AI Assistant</span>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "10px 14px", flexWrap: "wrap" }}>
            {chips.map((c, i) => (
              <motion.span
                key={c}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                style={{ fontSize: 10.5, padding: "4px 10px", borderRadius: 8, background: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}
              >
                {c}
              </motion.span>
            ))}
          </div>
          <div style={{ flex: 1, padding: "0 14px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {AI_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 11.5, lineHeight: 1.6, color: PANEL.text, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontFamily: "'Inter',sans-serif" }}
              >
                {msg}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>
      </div>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: PANEL.muted, fontFamily: "'Inter',sans-serif" }}>
        Get instant explanations, bug reports & optimizations
      </p>
    </motion.div>
  );
}

function StepSaveAccess({ active }: { active: boolean }) {
  const [visibleSnippets, setVisibleSnippets] = useState(0);

  useEffect(() => {
    if (!active) { setVisibleSnippets(0); return; }
    setVisibleSnippets(0);
    const timers = SNIPPETS.map((_, i) =>
      setTimeout(() => setVisibleSnippets(i + 1), 400 + i * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const langColors: Record<string, { bg: string; color: string; border: string }> = {
    typescript: { bg: "rgba(59,130,246,0.18)", color: "#93c5fd", border: "rgba(59,130,246,0.35)" },
    html: { bg: "rgba(249,115,22,0.18)", color: "#fb923c", border: "rgba(249,115,22,0.35)" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div style={{ background: PANEL.bg, border: `1px solid ${PANEL.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${PANEL.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <FileCode style={{ width: 14, height: 14, color: PANEL.blue }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: PANEL.text, fontFamily: "'Inter',sans-serif" }}>My Snippets</span>
        </div>
        <div style={{ padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: PANEL.blue, color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
            <Plus style={{ width: 14, height: 14 }} /> New Snippet
          </div>
        </div>
        <div style={{ padding: "0 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: PANEL.inputBg, border: `1px solid ${PANEL.border}` }}>
            <Search style={{ width: 13, height: 13, color: PANEL.muted }} />
            <span style={{ fontSize: 12, color: PANEL.muted, fontFamily: "'Inter',sans-serif" }}>Search snippets...</span>
          </div>
        </div>
        <div style={{ padding: "0 8px 12px" }}>
          {SNIPPETS.slice(0, visibleSnippets).map((sn, i) => {
            const lc = langColors[sn.lang] || langColors.typescript;
            const isFirst = i === 0;
            return (
              <motion.div
                key={sn.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: isFirst ? "rgba(96,165,250,0.1)" : "transparent", border: isFirst ? "1px solid rgba(96,165,250,0.3)" : "1px solid transparent", boxShadow: isFirst ? "0 0 12px -3px rgba(59,130,246,0.2)" : "none" }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: PANEL.inputBg, border: `1px solid ${PANEL.border}`, flexShrink: 0 }}>
                  <FileCode style={{ width: 14, height: 14, color: PANEL.muted }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: PANEL.text, fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>{sn.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 5, fontWeight: 600, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>{sn.lang}</span>
                    <span style={{ fontSize: 10, color: PANEL.muted, display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock style={{ width: 9, height: 9 }} /> {sn.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: PANEL.muted, fontFamily: "'Inter',sans-serif" }}>
        Organize, tag, and access your snippets anywhere
      </p>
    </motion.div>
  );
}

const STEPS = [
  { title: "Paste Your Code", subtitle: "Drop any snippet into your workspace" },
  { title: "AI Analyzes It", subtitle: "Get instant insights and improvements" },
  { title: "Save & Access Anywhere", subtitle: "Organize and find snippets in seconds" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => { if (open) setStep(0); }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // ── AUTO-ADVANCE: automatically moves to next step after animations finish ──
  useEffect(() => {
    if (!open) return;

    const stepDurations = [
      MOCK_CODE.length * 18 + 800,  // Step 0: typing completes + 800ms pause
      800 + 2 * 1200 + 1200,        // Step 1: last AI message appears + 1200ms pause
      400 + 2 * 600 + 3000,         // Step 2: last snippet appears + 3000ms pause then close
    ];

    const timer = setTimeout(() => {
      if (step < 2) setStep(s => s + 1);
      else onClose();
    }, stepDurations[step]);

    return () => clearTimeout(timer);
  }, [step, open, onClose]);

  const next = useCallback(() => {
    if (step < 2) setStep(s => s + 1);
    else onClose();
  }, [step, onClose]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.92)", backdropFilter: "blur(16px)", fontFamily: "'Inter',system-ui,sans-serif" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ width: "100%", maxWidth: 720, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "relative" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>

          {/* Step title */}
          <div style={{ textAlign: "center" }}>
            <motion.div
              key={`badge-${step}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", fontSize: 11, fontWeight: 600, color: "#93c5fd", marginBottom: 12 }}
            >
              Step {step + 1} of 3
            </motion.div>
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Space Grotesk','Inter',sans-serif" }}
            >
              {STEPS[step].title}
            </motion.h2>
          </div>

          {/* Step content */}
          <div style={{ width: "100%", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              {step === 0 && <StepPasteCode key="s0" active={step === 0} />}
              {step === 1 && <StepAIAnalyze key="s1" active={step === 1} />}
              {step === 2 && <StepSaveAccess key="s2" active={step === 2} />}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 400 }}>
            {/* Back */}
            <button
              onClick={prev}
              disabled={step === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: step === 0 ? "transparent" : "rgba(255,255,255,0.05)", border: step === 0 ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)", color: step === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", cursor: step === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} /> Back
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ width: i === step ? 24 : 8, background: i === step ? "#3b82f6" : "rgba(255,255,255,0.15)" }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 8, borderRadius: 4, cursor: "pointer" }}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>

            {/* Next / Done */}
            <button
              onClick={next}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 10, background: step === 2 ? "#3b82f6" : "rgba(59,130,246,0.15)", border: `1px solid ${step === 2 ? "#3b82f6" : "rgba(59,130,246,0.3)"}`, color: step === 2 ? "#fff" : "#93c5fd", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s", fontFamily: "'Inter',sans-serif", boxShadow: step === 2 ? "0 0 20px -5px rgba(59,130,246,0.4)" : "none" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {step === 2 ? "Done" : "Next"} <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}