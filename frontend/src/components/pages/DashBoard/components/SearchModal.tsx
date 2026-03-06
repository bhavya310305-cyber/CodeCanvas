import { useRef, useEffect } from "react";
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

export function SearchModal({ open, onClose, snippets, search, onSearchChange, onSelect, isDark, T }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const filtered = snippets.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "13vh", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 580, margin: "0 16px", borderRadius: 16, overflow: "hidden", background: T.sidebarBg, border: `1px solid ${T.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <Search style={{ width: 16, height: 16, color: T.textMuted, flexShrink: 0 }} />
          <input
            ref={searchRef}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search snippets..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: T.text, fontFamily: "'Inter',sans-serif" }}
          />
          <kbd style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: T.inputBg, color: T.textMuted, border: `1px solid ${T.border}`, fontFamily: "monospace" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered.length === 0
            ? <div style={{ padding: 32, textAlign: "center", fontSize: 13, color: T.textMuted }}>No snippets found</div>
            : filtered.map(sn => {
                const b = getBadge(sn.language, isDark);
                return (
                  <div key={sn.id} onClick={() => onSelect(sn.id)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.snippetHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: T.inputBg, border: `1px solid ${T.border}` }}>
                      <FileCode style={{ width: 16, height: 16, color: T.textMuted }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 4 }}>{sn.title}</div>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 600, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{sn.language}</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}