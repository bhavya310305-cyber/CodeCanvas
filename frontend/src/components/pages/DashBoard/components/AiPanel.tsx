import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Code2, Copy, Check } from "lucide-react";
import { Snippet, ChatMessage, ThemeTokens } from "../types";
import api from "@/lib/axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  active: Snippet | null;
  isDark: boolean;
  onClose: () => void;
  onOpenSidebar: () => void;
  T: ThemeTokens;
}

function CopyableCodeBlock({ code, isDark, T }: { code: string; isDark: boolean; T: ThemeTokens }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", margin: "10px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}` }}>
      {/* Code block header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.7 }} />
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, cursor: "pointer", color: copied ? "#22c55e" : T.textMuted, fontSize: 10, fontWeight: 500, fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"; }}
        >
          {copied ? <Check style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{ background: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.03)", padding: "14px 16px", overflowX: "auto", fontSize: 12.5, lineHeight: 1.7, margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
        <code style={{ color: isDark ? "#e2e8f0" : "#1e293b", fontFamily: "inherit" }}>{code}</code>
      </pre>
    </div>
  );
}

export function AiPanel({ active, isDark, onClose, onOpenSidebar, T }: Props) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: active
        ? `Hello! I'm your AI Code Assistant. I can see you're working on **${active.title}**. Ask me anything — I can explain logic, find bugs, or suggest optimizations.`
        : "Hello! I'm your AI Code Assistant. Open a snippet to analyze your code, or ask me anything about coding!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [chatInput]);

  useEffect(() => {
    setChatMessages([{
      role: "ai",
      content: active
        ? `Switched to **${active.title}** (${active.language}). Ask me anything about this snippet!`
        : "No snippet open. Open a snippet to analyze your code, or ask me a general coding question!"
    }]);
  }, [active?._id]);

  async function sendMessage(text?: string) {
    const msg = (text ?? chatInput).trim();
    if (!msg || isLoading) return;

    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    setIsLoading(true);
    setChatMessages(prev => [...prev, { role: "ai", content: "..." }]);

    try {
      const res = await api.post("/ai/ask", {
        message: msg,
        code: active?.code ?? null,
        language: active?.language ?? null,
        title: active?.title ?? null,
      });
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", content: res.data.reply }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", content: "Sorry, something went wrong. Please try again." }
      ]);
      console.error("AI request failed:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: T.aiPanelBg, borderLeft: `1px solid ${T.border}`, overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 14, height: 14, color: "#60a5fa" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>AI Code Assistant</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
              {active
                ? <><span style={{ color: "#60a5fa", fontWeight: 500 }}>{active.title}</span> · {active.language}</>
                : <span style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>No snippet selected</span>
              }
            </div>
          </div>
        </div>
        <button onClick={onClose}
          style={{ width: 28, height: 28, borderRadius: 7, background: T.inputBg, border: `1px solid ${T.border}`, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
        >✕</button>
      </div>

      {/* No snippet banner */}
      {!active && (
        <button
          onClick={onOpenSidebar}
          style={{ margin: "12px 14px 0", padding: "12px 14px", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", width: "calc(100% - 28px)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.2)"; }}
        >
          <Code2 style={{ width: 16, height: 16, color: "#60a5fa", flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, margin: 0 }}>
            Open a snippet from the sidebar to unlock code analysis, bug detection, and more.
            <span style={{ color: "#60a5fa", fontWeight: 600, marginLeft: 4 }}>Open sidebar →</span>
          </p>
        </button>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: msg.role === "ai" ? T.aiMsgBg : "transparent",
            border: msg.role === "user" ? `1px solid ${T.border}` : "1px solid transparent",
            marginLeft: msg.role === "user" ? 12 : 0,
          }}>
            {/* Role label */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              {msg.role === "ai"
                ? <>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Sparkles style={{ width: 10, height: 10, color: "#60a5fa" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI</span>
                  </>
                : <>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#a5b4fc" }}>U</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>You</span>
                  </>
              }
            </div>

            {/* Content */}
            {msg.content === "..." && isLoading
              ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.textMuted, fontSize: 13 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", opacity: 0.7, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
                  <span style={{ fontSize: 12 }}>AI is thinking...</span>
                </div>
              )
              : (
                <div style={{ fontSize: 13, lineHeight: 1.75, color: T.text }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ children, className }) {
                        const isBlock = className?.includes('language-');
                        const codeStr = String(children).replace(/\n$/, '');
                        return isBlock ? (
                          <CopyableCodeBlock code={codeStr} isDark={isDark} T={T} />
                        ) : (
                          <code style={{ background: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", color: isDark ? "#a5b4fc" : "#4f46e5", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}` }}>
                            {children}
                          </code>
                        );
                      },
                      p({ children }) {
                        return <p style={{ margin: "0 0 10px", lineHeight: 1.75, color: T.text }}>{children}</p>;
                      },
                      ul({ children }) {
                        return <ul style={{ paddingLeft: 18, margin: "6px 0 10px", lineHeight: 1.75, color: T.text }}>{children}</ul>;
                      },
                      ol({ children }) {
                        return <ol style={{ paddingLeft: 18, margin: "6px 0 10px", lineHeight: 1.75, color: T.text }}>{children}</ol>;
                      },
                      li({ children }) {
                        return <li style={{ marginBottom: 6, color: T.text }}>{children}</li>;
                      },
                      strong({ children }) {
                        return <strong style={{ color: T.text, fontWeight: 700 }}>{children}</strong>;
                      },
                      em({ children }) {
                        return <em style={{ color: T.textMuted, fontStyle: "italic" }}>{children}</em>;
                      },
                      h1({ children }) {
                        return <h1 style={{ fontSize: 16, fontWeight: 700, margin: "16px 0 8px", color: T.text, borderBottom: `1px solid ${T.border}`, paddingBottom: 6 }}>{children}</h1>;
                      },
                      h2({ children }) {
                        return <h2 style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: T.text }}>{children}</h2>;
                      },
                      h3({ children }) {
                        return <h3 style={{ fontSize: 13, fontWeight: 700, margin: "12px 0 5px", color: T.text }}>{children}</h3>;
                      },
                      hr() {
                        return <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "12px 0" }} />;
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote style={{ borderLeft: "3px solid #3b82f6", paddingLeft: 12, margin: "8px 0", color: T.textMuted, fontStyle: "italic" }}>
                            {children}
                          </blockquote>
                        );
                      },
                      table({ children }) {
                        return (
                          <div style={{ overflowX: "auto", margin: "10px 0", borderRadius: 8, border: `1px solid ${T.border}` }}>
                            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>{children}</table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return <th style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, textAlign: "left", fontWeight: 600, color: T.text, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>{children}</th>;
                      },
                      td({ children }) {
                        return <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.border}`, color: T.textMuted }}>{children}</td>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )
            }
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick action buttons */}
      <div style={{ padding: "10px 14px 8px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
        {active
          ? ["Explain Logic", "Find Bugs", "Optimize"].map(a => (
              <button key={a} onClick={() => sendMessage(a)} disabled={isLoading}
                style={{ fontSize: 10, padding: "5px 12px", borderRadius: 8, fontWeight: 600, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", color: "#60a5fa", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: isLoading ? 0.5 : 1, transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"; }}
              >{a}</button>
            ))
          : ["JS Tips", "React Hooks", "TypeScript"].map(a => (
              <button key={a} onClick={() => sendMessage(`Tell me about ${a}`)} disabled={isLoading}
                style={{ fontSize: 10, padding: "5px 12px", borderRadius: 8, fontWeight: 600, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: isLoading ? 0.5 : 1, transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"; }}
              >{a}</button>
            ))
        }
      </div>

      {/* Input */}
      <div style={{ padding: "8px 14px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 12, background: T.aiMsgBg, border: `1px solid ${T.border}` }}>
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={active ? "Ask anything about this code..." : "Ask me any coding question..."}
            rows={1}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 13, color: T.text, lineHeight: 1.6, fontFamily: "'Inter',sans-serif", maxHeight: 100, minHeight: 22 }}
          />
          <button onClick={() => sendMessage()} disabled={!chatInput.trim() || isLoading}
            style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: chatInput.trim() && !isLoading ? "linear-gradient(135deg,#2563eb,#4f46e5)" : T.inputBg, border: "none", cursor: chatInput.trim() && !isLoading ? "pointer" : "not-allowed", color: chatInput.trim() && !isLoading ? "white" : T.textMuted, transition: "all 0.15s" }}>
            <Send style={{ width: 13, height: 13 }} />
          </button>
        </div>
        <p style={{ fontSize: 10, textAlign: "center", marginTop: 6, color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)", fontFamily: "'Inter',sans-serif" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}