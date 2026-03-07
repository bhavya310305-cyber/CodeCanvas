import { useState, useRef, useEffect } from "react";
import { Plus, X, Clock, Settings, LogOut, ChevronUp, Sun, Moon, Trash2 } from "lucide-react";
import { Snippet, ThemeTokens } from "../types";
import { getBadge, getInitials, timeAgo } from "../utils";
import { CodebaseLogo } from "./CodebaseLogo";
import { SettingsModal } from "./SettingsModal";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Props {
  snippets: Snippet[];
  activeId: string;
  isDark: boolean;
  user: { id: string; name: string; email: string } | null;
  setUser: (u: User | null) => void;
  onSelectSnippet: (id: string) => void;
  onCloseSidebar: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onCreateSnippet: (title: string, language: string, code: string) => void;
  onDeleteSnippet: (id: string) => void;
  T: ThemeTokens;
}

const LANGUAGES = ["javascript", "typescript", "html", "css", "python", "java", "cpp", "json", "markdown"];

export function Sidebar({ snippets, activeId, isDark, user, setUser, onSelectSnippet, onCloseSidebar, onToggleTheme, onLogout, onCreateSnippet, onDeleteSnippet, T }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newSnippetOpen, setNewSnippetOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name ?? "";
  const displayEmail = user?.email ?? "";
  const initials = getInitials(displayName);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    await onCreateSnippet(newTitle.trim(), newLanguage, newCode);
    setNewTitle("");
    setNewLanguage("javascript");
    setNewCode("");
    setNewSnippetOpen(false);
    setCreating(false);
  }

  function menuItem(isRed = false): React.CSSProperties {
    return {
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 8, cursor: "pointer",
      background: "transparent", border: "none",
      color: isRed ? (isDark ? "#f87171" : "#dc2626") : T.text,
      fontSize: 13, fontWeight: 500, fontFamily: "'Inter',sans-serif",
      transition: "background 0.15s", textAlign: "left",
    };
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 12,
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    border: `1px solid ${T.border}`, color: T.text,
    fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
        user={user}
        setUser={setUser}
        onLogout={onLogout}
      />

      {newSnippetOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setNewSnippetOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 460, borderRadius: 16, background: isDark ? "#111827" : "#f1f5f9", border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
           
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>New Snippet</div>
              <button onClick={() => setNewSnippetOpen(false)} style={{ width: 28, height: 28, borderRadius: 7, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", border: `1px solid ${T.border}`, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✕</button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Title</label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                  placeholder="e.g. Debounce Function"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Language</label>
                <select
                  value={newLanguage}
                  onChange={e => setNewLanguage(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
                  Code <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button
                  onClick={() => setNewSnippetOpen(false)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  style={{ flex: 2, padding: "9px 0", borderRadius: 9, background: !newTitle.trim() ? "rgba(37,99,235,0.4)" : "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: !newTitle.trim() ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? "Creating..." : "Create Snippet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", background: T.sidebarBg, borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>


        <div style={{ height: 56, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <CodebaseLogo isDark={isDark} />
          <button onClick={onCloseSidebar} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, padding: 4, borderRadius: 6, display: "flex" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        
        <div style={{ padding: "14px 14px 10px" }}>
          <button
            onClick={() => setNewSnippetOpen(true)}
            style={{ width: "100%", padding: "9px 0", background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", borderRadius: 10, cursor: "pointer", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 0 20px rgba(37,99,235,0.3)", fontFamily: "'Inter',sans-serif" }}>
            <Plus style={{ width: 15, height: 15 }} /> New Snippet
          </button>
        </div>

        
        <div style={{ padding: "4px 18px 8px" }}>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: T.textMuted }}>My Snippets</span>
        </div>

        
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
          {snippets.length === 0 && (
            <div style={{ padding: "20px 8px", textAlign: "center", color: T.textMuted, fontSize: 12 }}>
              No snippets yet. Create your first one!
            </div>
          )}
          {snippets.map(sn => {
            const isActive = sn._id === activeId;
            const isHovered = hoveredId === sn._id;
            const b = getBadge(sn.language, isDark);
            return (
              <div
                key={sn._id}
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredId(sn._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onSelectSnippet(sn._id)}
                  style={{ width: "100%", textAlign: "left", padding: "10px 12px", paddingRight: 36, borderRadius: 10, marginBottom: 2, cursor: "pointer", position: "relative", background: isActive ? T.snippetActive : isHovered ? T.snippetHover : "transparent", border: `1px solid ${isActive ? T.snippetActiveBorder : "transparent"}`, transition: "all 0.15s", fontFamily: "'Inter',sans-serif" }}
                >
                  {isActive && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.7)" }} />}
                  <div style={{ marginBottom: 6, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? (isDark ? "#dbeafe" : "#1d4ed8") : T.text }}>{sn.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{sn.language}</span>
                    <span style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3, color: T.textMuted }}><Clock style={{ width: 10, height: 10 }} />{timeAgo(sn.createdAt)}</span>
                  </div>
                </button>

                
                {isHovered && (
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteSnippet(sn._id); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: 6, background: isDark ? "rgba(239,68,68,0.1)" : "rgba(220,38,38,0.08)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "#f87171" : "#dc2626" }}
                  >
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        
        <div ref={profileRef} style={{ flexShrink: 0, padding: "10px 12px 14px", borderTop: `1px solid ${T.border}`, position: "relative" }}>
          {profileOpen && (
            <div style={{ position: "absolute", bottom: "100%", left: 12, right: 12, marginBottom: 8, borderRadius: 12, background: T.popupBg, border: `1px solid ${T.popupBorder}`, boxShadow: isDark ? "0 -8px 32px rgba(0,0,0,0.5)" : "0 -8px 32px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 50 }}>
              <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${T.popupBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #2563eb, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                    {displayEmail && <div style={{ fontSize: 11, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayEmail}</div>}
                  </div>
                </div>
              </div>
              <div style={{ padding: "6px 6px" }}>
                <button onClick={() => { setProfileOpen(false); setSettingsOpen(true); }} style={menuItem()} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />Settings
                </button>
                <button onClick={() => { onToggleTheme(); setProfileOpen(false); }} style={menuItem()} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {isDark ? <Sun style={{ width: 14, height: 14, flexShrink: 0, color: "#fbbf24" }} /> : <Moon style={{ width: 14, height: 14, flexShrink: 0, color: "#6366f1" }} />}
                  Switch to {isDark ? "Light" : "Dark"} Mode
                </button>
              </div>
              <div style={{ height: 1, background: T.popupBorder, margin: "0 6px" }} />
              <div style={{ padding: "6px 6px" }}>
                <button onClick={onLogout} style={menuItem(true)} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />Log out
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setProfileOpen(v => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: "pointer", background: profileOpen ? T.snippetHover : "transparent", border: `1px solid ${profileOpen ? T.border : "transparent"}`, transition: "all 0.15s", fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = T.snippetHover; }}
            onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #2563eb, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>
              {initials}
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            <ChevronUp style={{ width: 14, height: 14, color: T.textMuted, flexShrink: 0, transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
        </div>
      </aside>
    </>
  );
}