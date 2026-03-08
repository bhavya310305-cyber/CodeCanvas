import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Code2 } from "lucide-react";
import { Snippet, ChatMessage, ThemeTokens } from "../types";
import api from "@/lib/axios";
import ReactMarkdown from 'react-markdown';

interface Props {
  active: Snippet | null;
  isDark: boolean;
  onClose: () => void;
  onOpenSidebar: () => void;
  T: ThemeTokens;
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

    // Add a loading message
    setChatMessages(prev => [...prev, { role: "ai", content: "..." }]);

    try {
      const res = await api.post("/ai/ask", {
        message: msg,
        code: active?.code ?? null,
        language: active?.language ?? null,
        title: active?.title ?? null,
      });

      // Replace loading message with real response
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", content: res.data.reply }
      ]);
    } catch (err) {
      // Replace loading message with error
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
    <div style={{ width: 380, height: "100vh", flexShrink: 0, display: "flex", flexDirection: "column", background: T.aiPanelBg, borderLeft: `1px solid ${T.border}`, overflow: "hidden", fontFamily: "'Inter',sans-serif" }}>

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

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {chatMessages.map((msg, i) => (
          <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: msg.role === "ai" ? T.aiMsgBg : "transparent", border: msg.role === "user" ? `1px solid ${T.border}` : "1px solid transparent", marginLeft: msg.role === "user" ? 16 : 0, fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
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
            {msg.content === "..." && isLoading
            ? <span style={{ opacity: 0.5 }}>AI is thinking...</span>
            : <ReactMarkdown
                components={{
                  code({ children, className }) {
                    const isBlock = className?.includes('language-');
                    return isBlock ? (
                      <pre style={{
                        background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.06)",
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "12px 14px",
                        overflowX: "auto",
                        fontSize: 12,
                        lineHeight: 1.6,
                        margin: "8px 0",
                        fontFamily: "monospace"
                      }}>
                        <code style={{ color: isDark ? "#e2e8f0" : "#1e293b", fontFamily: "monospace" }}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code style={{
                        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: isDark ? "#93c5fd" : "#2563eb"
                      }}>
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <p style={{ margin: "6px 0", lineHeight: 1.7 }}>{children}</p>;
                  },
                  ul({ children }) {
                    return <ul style={{ paddingLeft: 20, margin: "6px 0", lineHeight: 1.7 }}>{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol style={{ paddingLeft: 20, margin: "6px 0", lineHeight: 1.7 }}>{children}</ol>;
                  },
                  li({ children }) {
                    return <li style={{ marginBottom: 4 }}>{children}</li>;
                  },
                  strong({ children }) {
                    return <strong style={{ color: T.text, fontWeight: 700 }}>{children}</strong>;
                  },
                  h1({ children }) {
                    return <h1 style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 6px", color: T.text }}>{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 style={{ fontSize: 14, fontWeight: 700, margin: "10px 0 6px", color: T.text }}>{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 style={{ fontSize: 13, fontWeight: 700, margin: "8px 0 4px", color: T.text }}>{children}</h3>;
                  },
                  table({ children }) {
                    return (
                      <div style={{ overflowX: "auto", margin: "8px 0" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, textAlign: "left", fontWeight: 600, color: T.text }}>{children}</th>;
                  },
                  td({ children }) {
                    return <td style={{ padding: "6px 10px", borderBottom: `1px solid ${T.border}`, color: T.textMuted }}>{children}</td>;
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
          }
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: "10px 14px 8px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
        {active
          ? ["Explain Logic", "Find Bugs", "Optimize"].map(a => (
              <button key={a} onClick={() => sendMessage(a)} disabled={isLoading}
                style={{ fontSize: 10, padding: "5px 12px", borderRadius: 8, fontWeight: 600, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", color: "#60a5fa", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: isLoading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"; }}
              >{a}</button>
            ))
          : ["JS Tips", "React Hooks", "TypeScript"].map(a => (
              <button key={a} onClick={() => sendMessage(`Tell me about ${a}`)} disabled={isLoading}
                style={{ fontSize: 10, padding: "5px 12px", borderRadius: 8, fontWeight: 600, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#a5b4fc", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: isLoading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"; }}
              >{a}</button>
            ))
        }
      </div>

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
