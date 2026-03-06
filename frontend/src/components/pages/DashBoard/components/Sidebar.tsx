import { useState, useRef, useEffect } from "react";
import { Plus, X, Clock, Settings, LogOut, ChevronUp, Sun, Moon } from "lucide-react";
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
  T: ThemeTokens;
}

export function Sidebar({ snippets, activeId, isDark, user, setUser, onSelectSnippet, onCloseSidebar, onToggleTheme, onLogout, T }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

      <aside style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", background: T.sidebarBg, borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>

        {/* Logo row */}
        <div style={{ height: 56, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <CodebaseLogo isDark={isDark} />
          <button onClick={onCloseSidebar} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, padding: 4, borderRadius: 6, display: "flex" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* New Snippet */}
        <div style={{ padding: "14px 14px 10px" }}>
          <button style={{ width: "100%", padding: "9px 0", background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", borderRadius: 10, cursor: "pointer", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 0 20px rgba(37,99,235,0.3)", fontFamily: "'Inter',sans-serif" }}>
            <Plus style={{ width: 15, height: 15 }} /> New Snippet
          </button>
        </div>

        {/* Section label */}
        <div style={{ padding: "4px 18px 8px" }}>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: T.textMuted }}>My Snippets</span>
        </div>

        {/* Snippet list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
          {snippets.map(sn => {
            const isActive = sn.id === activeId;
            const b = getBadge(sn.language, isDark);
            return (
              <button key={sn.id} onClick={() => onSelectSnippet(sn.id)}
                style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, marginBottom: 2, cursor: "pointer", position: "relative", background: isActive ? T.snippetActive : "transparent", border: `1px solid ${isActive ? T.snippetActiveBorder : "transparent"}`, transition: "all 0.15s", fontFamily: "'Inter',sans-serif" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.snippetHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {isActive && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.7)" }} />}
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? (isDark ? "#dbeafe" : "#1d4ed8") : T.text }}>{sn.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{sn.language}</span>
                  <span style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3, color: T.textMuted }}><Clock style={{ width: 10, height: 10 }} />{timeAgo(sn.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile section */}
        <div ref={profileRef} style={{ flexShrink: 0, padding: "10px 12px 14px", borderTop: `1px solid ${T.border}`, position: "relative" }}>

          {/* Popup */}
          {profileOpen && (
            <div style={{ position: "absolute", bottom: "100%", left: 12, right: 12, marginBottom: 8, borderRadius: 12, background: T.popupBg, border: `1px solid ${T.popupBorder}`, boxShadow: isDark ? "0 -8px 32px rgba(0,0,0,0.5)" : "0 -8px 32px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 50 }}>

              {/* User info */}
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

              {/* Menu items */}
              <div style={{ padding: "6px 6px" }}>
                <button
                  onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
                  style={menuItem()}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Settings
                </button>
                <button
                  onClick={() => { onToggleTheme(); setProfileOpen(false); }}
                  style={menuItem()}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {isDark
                    ? <Sun style={{ width: 14, height: 14, flexShrink: 0, color: "#fbbf24" }} />
                    : <Moon style={{ width: 14, height: 14, flexShrink: 0, color: "#6366f1" }} />
                  }
                  Switch to {isDark ? "Light" : "Dark"} Mode
                </button>
              </div>

              <div style={{ height: 1, background: T.popupBorder, margin: "0 6px" }} />

              <div style={{ padding: "6px 6px" }}>
                <button
                  onClick={onLogout}
                  style={menuItem(true)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* Trigger button */}
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