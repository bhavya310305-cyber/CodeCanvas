import { useState, useRef, useEffect } from "react";
import { Plus, X, Clock, Settings, LogOut, ChevronUp, Sun, Moon, Trash2, History, MoreHorizontal, Pencil, Copy } from "lucide-react";
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
  allTags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string) => void;
  onSelectSnippet: (id: string) => void;
  onCloseSidebar: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onCreateSnippet: (title: string, language: string, code: string) => void;
  onDeleteSnippet: (id: string) => void;
  onViewHistory: (id: string) => void;
  onRenameSnippet: (id: string, newTitle: string) => void;
  onDuplicateSnippet: (id: string) => void;
  triggerNewSnippet?: boolean;
  onTriggerNewSnippetHandled?: () => void;
  T: ThemeTokens;
}

const LANGUAGES = ["javascript", "typescript", "html", "css", "python", "java", "cpp", "json", "markdown"];

export function Sidebar({ snippets, activeId, isDark, user, setUser, allTags, activeTag, onSelectTag, onSelectSnippet, onCloseSidebar, onToggleTheme, onLogout, onCreateSnippet, onDeleteSnippet, onViewHistory, onRenameSnippet, onDuplicateSnippet, triggerNewSnippet, onTriggerNewSnippetHandled, T }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newSnippetOpen, setNewSnippetOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("javascript");
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close snippet context menu on outside click
  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target as Node);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target as Node);
      if (!inMenu && !inDropdown) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenId]);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langDropdownOpen]);

  useEffect(() => {
    if (triggerNewSnippet) {
      setNewSnippetOpen(true);
      onTriggerNewSnippetHandled?.();
    }
  }, [triggerNewSnippet]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  function handleRenameSubmit(id: string) {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== snippets.find(s => s._id === id)?.title) {
      onRenameSnippet(id, trimmed);
    }
    setRenamingId(null);
  }

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
    width: "100%", padding: "10px 12px", borderRadius: 9, fontSize: 13,
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.05)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"}`,
    color: T.text, fontFamily: "'Inter',sans-serif",
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
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
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setNewSnippetOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 460, borderRadius: 16, background: isDark ? "linear-gradient(145deg,#0f172a,#111827)" : "#f8fafc", border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(15,23,42,0.12)"}`, boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(59,130,246,0.05),inset 0 1px 0 rgba(255,255,255,0.05)" : "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${isDark ? "rgba(59,130,246,0.1)" : "rgba(15,23,42,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(37,99,235,0.05)" : "transparent" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Plus style={{ width: 14, height: 14, color: "white" }} />
                </div>
                New Snippet
              </div>
              <button onClick={() => setNewSnippetOpen(false)} style={{ width: 28, height: 28, borderRadius: 7, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.1)"}`, cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✕</button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Title */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Title</label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                  placeholder="e.g. Debounce Function"
                  style={inputStyle}
                />
              </div>

              {/* Language — custom dropdown */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Language</label>
                <div ref={langDropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setLangDropdownOpen(v => !v)}
                    style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" as const }}
                  >
                    <span>{newLanguage}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: langDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {langDropdownOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300, borderRadius: 10, background: isDark ? "#1a2236" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 220, overflowY: "auto", padding: "4px" }}>
                      {LANGUAGES.map(l => (
                        <div
                          key={l}
                          onClick={() => { setNewLanguage(l); setLangDropdownOpen(false); }}
                          style={{ padding: "8px 12px", borderRadius: 7, cursor: "pointer", fontSize: 13, color: l === newLanguage ? "#60a5fa" : T.text, background: l === newLanguage ? (isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)") : "transparent", fontWeight: l === newLanguage ? 600 : 400, fontFamily: "'Inter',sans-serif", transition: "background 0.15s" }}
                          onMouseEnter={e => { if (l !== newLanguage) (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                          onMouseLeave={e => { if (l !== newLanguage) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code (optional) */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
                  Code <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.6 }}>(optional)</span>
                </label>
                <textarea
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" as const, minHeight: 100, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setNewSnippetOpen(false)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"}`, color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  style={{ flex: 2, padding: "11px", borderRadius: 10, background: creating || !newTitle.trim() ? (isDark ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.2)") : "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: creating || !newTitle.trim() ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s", boxShadow: creating || !newTitle.trim() ? "none" : "0 0 20px rgba(37,99,235,0.35)" }}
                >
                  {creating ? "Creating..." : "Create Snippet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteId && (() => {
        const sn = snippets.find(s => s._id === confirmDeleteId);
        return (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 380, borderRadius: 16, background: isDark ? "linear-gradient(145deg,#0f172a,#111827)" : "#f8fafc", border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "rgba(220,38,38,0.15)"}`, boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.7)" : "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden", fontFamily: "'Inter',sans-serif" }}
            >
              {/* Header */}
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${isDark ? "rgba(239,68,68,0.1)" : "rgba(220,38,38,0.08)"}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: isDark ? "rgba(239,68,68,0.12)" : "rgba(220,38,38,0.08)", border: `1px solid ${isDark ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trash2 style={{ width: 14, height: 14, color: isDark ? "#f87171" : "#dc2626" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Delete Snippet</div>
              </div>

              {/* Body */}
              <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
                  Are you sure you want to delete <span style={{ fontWeight: 600, color: T.text }}>"{sn?.title}"</span>? This action cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"}`, color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.25)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"; }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDeleteSnippet(confirmDeleteId); setConfirmDeleteId(null); }}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: isDark ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.08)", border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "rgba(220,38,38,0.2)"}`, color: isDark ? "#f87171" : "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.15)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.08)"; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <aside style={{ width: 260, height: "100vh", display: "flex", flexDirection: "column", background: T.sidebarBg, borderRight: `1px solid ${T.border}` }}>

        {/* Header */}
        <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: `1px solid ${T.border}` }}>
          <CodebaseLogo isDark={isDark} />
          <button
            onClick={onCloseSidebar}
            style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* New Snippet button */}
        <div style={{ padding: "12px 12px 8px" }}>
          <button
            onClick={() => setNewSnippetOpen(true)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", boxShadow: "0 0 16px rgba(37,99,235,0.3)", transition: "box-shadow 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(37,99,235,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(37,99,235,0.3)"; }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Snippet
          </button>
        </div>

        {/* Tags section */}
        {allTags.length > 0 && (
          <div style={{ padding: "4px 18px 8px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {allTags.map(tag => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(tag)}
                    style={{
                      fontSize: 11, padding: "3px 9px", borderRadius: 6, cursor: "pointer",
                      background: isActive ? "rgba(59,130,246,0.15)" : T.inputBg,
                      color: isActive ? "#60a5fa" : T.textMuted,
                      fontFamily: "'Inter',sans-serif", fontWeight: isActive ? 600 : 400,
                      border: `1px solid ${isActive ? "rgba(59,130,246,0.45)" : T.inputBorder}`,
                      boxShadow: isActive ? "0 0 8px rgba(59,130,246,0.2)" : "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = T.text; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                  >
                    # {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: "4px 18px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: T.textMuted }}>
            My Snippets {activeTag && <span style={{ color: "#60a5fa" }}>· #{activeTag}</span>}
          </span>
          {activeTag && (
            <button
              onClick={() => onSelectTag(activeTag)}
              style={{ fontSize: 10, color: T.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 3 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
            >
              <X style={{ width: 10, height: 10 }} /> clear
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px", overflowX: "visible" }}>
          {snippets.length === 0 && (
            <div style={{ padding: "20px 8px", textAlign: "center", color: T.textMuted, fontSize: 12 }}>
              {activeTag ? `No snippets tagged #${activeTag}` : "No snippets yet. Create your first one!"}
            </div>
          )}
          {snippets.map(sn => {
            const isActive = sn._id === activeId;
            const isHovered = hoveredId === sn._id;
            const isMenuOpen = menuOpenId === sn._id;
            const b = getBadge(sn.language, isDark);
            return (
              <div
                key={sn._id}
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredId(sn._id)}
                onMouseLeave={() => { setHoveredId(null); }}
              >
                <button
                  onClick={() => onSelectSnippet(sn._id)}
                  style={{ width: "100%", textAlign: "left", padding: "10px 12px", paddingRight: 40, borderRadius: 10, marginBottom: 2, cursor: "pointer", position: "relative", background: isActive ? T.snippetActive : isHovered ? T.snippetHover : "transparent", border: `1px solid ${isActive ? T.snippetActiveBorder : "transparent"}`, transition: "all 0.15s", fontFamily: "'Inter',sans-serif" }}
                >
                  {isActive && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6", boxShadow: "0 0 8px rgba(59,130,246,0.7)" }} />}
                  {renamingId === sn._id ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); handleRenameSubmit(sn._id); }
                        if (e.key === "Escape") { setRenamingId(null); }
                      }}
                      onBlur={() => handleRenameSubmit(sn._id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: "100%", marginBottom: 6, fontSize: 13, fontWeight: 600, color: T.text, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: `1px solid rgba(59,130,246,0.5)`, borderRadius: 6, padding: "2px 6px", outline: "none", fontFamily: "'Inter',sans-serif", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" }}
                    />
                  ) : (
                    <div style={{ marginBottom: 6, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? (isDark ? "#dbeafe" : "#1d4ed8") : T.text }}>{sn.title}</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{sn.language}</span>
                    <span style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3, color: T.textMuted }}><Clock style={{ width: 10, height: 10 }} />{timeAgo(sn.createdAt)}</span>
                  </div>
                  {sn.tags && sn.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {sn.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: activeTag === tag ? "rgba(59,130,246,0.2)" : T.inputBg, color: activeTag === tag ? "#60a5fa" : T.textMuted, border: `1px solid ${activeTag === tag ? "rgba(59,130,246,0.3)" : T.inputBorder}`, fontWeight: 600 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                {/* ⋯ three-dot menu button — always rendered, visible on hover/open */}
                <div
                  ref={isMenuOpen ? menuRef : null}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", opacity: (isHovered || isMenuOpen) ? 1 : 0, pointerEvents: (isHovered || isMenuOpen) ? "auto" : "none", transition: "opacity 0.15s" }}
                >
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (!isMenuOpen) {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                        setMenuOpenId(sn._id);
                      } else {
                        setMenuOpenId(null);
                      }
                    }}
                    style={{ width: 26, height: 26, borderRadius: 6, background: isMenuOpen ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"), border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                  >
                    <MoreHorizontal style={{ width: 13, height: 13 }} />
                  </button>
                </div>

                {/* Dropdown — rendered in place, positioned via fixed */}
                {isMenuOpen && (
                  <div ref={dropdownRef} style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9999, width: 160, borderRadius: 10, background: isDark ? "#1a2236" : "#ffffff", border: `1px solid ${T.border}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", padding: "4px" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpenId(null); setRenameValue(sn.title); setRenamingId(sn._id); onSelectSnippet(sn._id); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: "transparent", border: "none", color: T.text, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "background 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Pencil style={{ width: 13, height: 13, color: "#a78bfa", flexShrink: 0 }} />
                      Rename
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpenId(null); onDuplicateSnippet(sn._id); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: "transparent", border: "none", color: T.text, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "background 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Copy style={{ width: 13, height: 13, color: "#34d399", flexShrink: 0 }} />
                      Duplicate
                    </button>
                    <div style={{ height: 1, background: T.border, margin: "3px 4px" }} />
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpenId(null); onViewHistory(sn._id); onSelectSnippet(sn._id); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: "transparent", border: "none", color: T.text, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "background 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <History style={{ width: 13, height: 13, color: "#60a5fa", flexShrink: 0 }} />
                      View History
                    </button>
                    <div style={{ height: 1, background: T.border, margin: "3px 4px" }} />
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpenId(null); setConfirmDeleteId(sn._id); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: "transparent", border: "none", color: isDark ? "#f87171" : "#dc2626", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "background 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Trash2 style={{ width: 13, height: 13, flexShrink: 0 }} />
                      Delete
                    </button>
                  </div>
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