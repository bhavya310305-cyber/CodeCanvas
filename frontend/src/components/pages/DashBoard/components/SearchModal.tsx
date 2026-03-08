import { useRef, useEffect, useState } from "react";
import { Search, FileCode } from "lucide-react";
import { Snippet, ThemeTokens } from "../types";
import { getBadge } from "../utils";

interface Props {
  open: boolean;
  onClose: () => void;
  snippets: Snippet[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  isDark: boolean;
  T: ThemeTokens;
}

function getCodeMatchLine(code: string, query: string): string | null {
  if (!query.trim()) return null;
  const lines = code.split("\n");
  const match = lines.find(l => l.toLowerCase().includes(query.toLowerCase()));
  if (!match) return null;
  return match.trim().slice(0, 72) + (match.trim().length > 72 ? "…" : "");
}

function highlightMatch(text: string, query: string, T: ThemeTokens): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: "rgba(59,130,246,0.25)", color: "#60a5fa", borderRadius: 3, padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchModal({ open, onClose, snippets, search, onSearchChange, onSelect, isDark, T }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [activeLang, setActiveLang] = useState<string | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    if (!open) { setActiveLang(null); }
  }, [open]);

  if (!open) return null;

  // Build unique language list from snippets
  const availableLangs = Array.from(new Set(snippets.map(s => s.language))).sort();

  const filtered = snippets.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      s.title.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q);
    const matchesLang = !activeLang || s.language === activeLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "13vh", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 580, margin: "0 16px", borderRadius: 16, overflow: "hidden", background: T.sidebarBg, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Search Input ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <Search style={{ width: 16, height: 16, color: T.textMuted, flexShrink: 0 }} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by title, language, or code content..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: T.text, fontFamily: "'Inter',sans-serif" }}
          />
          <kbd style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: T.inputBg, color: T.textMuted, border: `1px solid ${T.border}`, fontFamily: "monospace" }}>ESC</kbd>
        </div>

        {/* ── Language Filter Bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 2, flexShrink: 0 }}>Filter</span>
          {availableLangs.map(lang => {
            const b = getBadge(lang, isDark);
            const isActive = activeLang === lang;
            return (
              <button
                key={lang}
                onClick={() => setActiveLang(isActive ? null : lang)}
                style={{
                  fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  background: isActive ? "rgba(59,130,246,0.2)" : b.bg,
                  color: isActive ? "#60a5fa" : b.color,
                  border: `1px solid ${isActive ? "rgba(59,130,246,0.5)" : b.border}`,
                  boxShadow: isActive ? "0 0 10px rgba(59,130,246,0.2)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* ── Results ── */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: T.textMuted }}>
              No snippets found
            </div>
          ) : (
            filtered.map(sn => {
              const b = getBadge(sn.language, isDark);
              const codeMatch = search.trim() &&
                !sn.title.toLowerCase().includes(search.toLowerCase()) &&
                !sn.language.toLowerCase().includes(search.toLowerCase())
                ? getCodeMatchLine(sn.code, search)
                : null;

              return (
                <div
                  key={sn._id}
                  onClick={() => { onSelect(sn._id); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", cursor: "pointer", transition: "background 0.15s", borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.snippetHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.inputBg, border: `1px solid ${T.border}` }}>
                    <FileCode style={{ width: 16, height: 16, color: T.textMuted }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 4 }}>
                      {highlightMatch(sn.title, search, T)}
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                      {sn.language}
                    </span>
                    {/* Code match preview — only shows when match is inside code */}
                    {codeMatch && (
                      <div style={{ marginTop: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMuted, background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {highlightMatch(codeMatch, search, T)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "8px 18px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {filtered.length} {filtered.length === 1 ? "snippet" : "snippets"} found
          </span>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {activeLang && (
              <button onClick={() => setActiveLang(null)} style={{ fontSize: 11, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                ✕ Clear filter
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}