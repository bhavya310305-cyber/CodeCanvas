import { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { Snippet, ChatMessage, ThemeTokens } from "../types";

interface Props {
  active: Snippet;
  isDark: boolean;
  onClose: () => void;
  T: ThemeTokens;
}

export function AiPanel({ active, isDark, onClose, T }: Props) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Hello! I'm your AI Code Assistant. Select a snippet and ask me anything — I can explain logic, find bugs, or suggest optimizations." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [chatInput]);

  function sendMessage(text?: string) {
    const msg = (text ?? chatInput).trim();
    if (!msg) return;
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: "ai",
        content: `Analyzing **${active.title}** (${active.language}). ${
          msg.toLowerCase().includes("bug") ? "No critical bugs found. Consider adding input validation and error boundaries for robustness." :
          msg.toLowerCase().includes("explain") ? "This code uses closure to maintain state across calls — a classic functional programming pattern." :
          msg.toLowerCase().includes("optim") ? "Consider memoizing expensive operations and using early returns to reduce nesting." :
          "I've reviewed your snippet. Feel free to ask about specific aspects like performance or readability."
        }`
      }]);
    }, 700);
  }

  return (
    <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", background: T.aiPanelBg, borderLeft: `1px solid ${T.border}`, height: "100vh", overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 14, height: 14, color: "#60a5fa" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>AI Code Assistant</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
              Analyzing <span style={{ color: "#60a5fa", fontWeight: 500 }}>{active.title}</span> · {active.language}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: T.inputBg, border: `1px solid ${T.border}`, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: msg.role === "ai" ? T.aiMsgBg : "transparent", border: msg.role === "user" ? `1px solid ${T.border}` : "1px solid transparent", marginLeft: msg.role === "user" ? 16 : 0, fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              {msg.role === "ai"
                ? <><div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles style={{ width: 10, height: 10, color: "#60a5fa" }} /></div><span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI</span></>
                : <><div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#a5b4fc" }}>U</div><span style={{ fontSize: 10, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>You</span></>
              }
            </div>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick actions */}
      <div style={{ padding: "10px 14px 8px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
        {["Explain Logic", "Find Bugs", "Optimize"].map(a => (
          <button key={a} onClick={() => sendMessage(a)}
            style={{ fontSize: 10, padding: "5px 12px", borderRadius: 8, fontWeight: 600, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", color: "#60a5fa", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"; }}>
            {a}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 14px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 12, background: T.aiMsgBg, border: `1px solid ${T.border}` }}>
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about this code..." rows={1}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 13, color: T.text, lineHeight: 1.6, fontFamily: "'Inter',sans-serif", maxHeight: 100, minHeight: 22 }}
          />
          <button onClick={() => sendMessage()} disabled={!chatInput.trim()}
            style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: chatInput.trim() ? "linear-gradient(135deg,#2563eb,#4f46e5)" : T.inputBg, border: "none", cursor: chatInput.trim() ? "pointer" : "not-allowed", color: chatInput.trim() ? "white" : T.textMuted, transition: "all 0.15s" }}>
            <Send style={{ width: 13, height: 13 }} />
          </button>
        </div>
        <p style={{ fontSize: 10, textAlign: "center", marginTop: 6, color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)", fontFamily: "'Inter',sans-serif" }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}