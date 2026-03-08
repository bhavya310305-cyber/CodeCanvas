import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Snippet, ThemeTokens } from "../types";
import { langColors, langDotClass } from "../constants";

interface Props {
  active: Snippet | null;
  openTabs: string[];
  activeId: string;
  snippets: Snippet[];
  isDark: boolean;
  onSetActiveId: (id: string) => void;
  onCloseTab: (e: React.MouseEvent, id: string) => void;
  onUpdateCode: (id: string, code: string) => Promise<void>;
  T: ThemeTokens;
}

export function EditorPanel({ active, openTabs, activeId, snippets, isDark, onSetActiveId, onCloseTab, onUpdateCode, T }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canPreview = active?.language === "html";

  useEffect(() => {
    if (!canPreview) setPreviewOpen(false);
  }, [active?._id, canPreview]);

  function handleCodeChange(value: string | undefined) {
    if (!active || value === undefined) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdateCode(active._id, value);
    }, 1000);
  }

  if (!active) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 48, flexShrink: 0, background: T.headerBg, borderBottom: `1px solid ${T.border}` }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 28 }}>{"</>"}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>No snippet open</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Select a snippet from the sidebar to start editing</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "stretch", background: T.headerBg, borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(12px)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflow: "hidden" }}>
          {openTabs.map(tabId => {
            const sn = snippets.find(s => s._id === tabId);
            if (!sn) return null;
            const isActive = tabId === activeId;
            return (
              <div key={tabId} onClick={() => onSetActiveId(tabId)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 14px", cursor: "pointer", flexShrink: 0, borderRight: `1px solid ${T.border}`, borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent", background: isActive ? T.tabActiveBg : "transparent", color: isActive ? T.text : T.textMuted, fontSize: 12, fontWeight: isActive ? 500 : 400, transition: "all 0.15s", maxWidth: 180 }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.snippetHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }} className={langDotClass[sn.language] ?? "bg-gray-400"} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{sn.title}</span>
                <span onClick={e => onCloseTab(e, tabId)}
                  style={{ fontSize: 11, marginLeft: 2, flexShrink: 0, color: T.textMuted, padding: "1px 3px", borderRadius: 3 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                >✕</span>
              </div>
            );
          })}
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", padding: 18, overflow: "hidden" }}>
        {!previewOpen && (
          <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.editorPanelBg, flex: 1, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ height: 44, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace", color: T.textMuted }}>
                <span style={{ opacity: 0.5 }}>{"{ }"}</span>
                <span style={{ opacity: 0.3 }}>/</span>
                <span>{active.title}.{active.language === "typescript" ? "ts" : active.language === "javascript" ? "js" : active.language}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {canPreview && (
                  <button onClick={() => setPreviewOpen(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif", background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none", color: "white", boxShadow: "0 0 16px rgba(37,99,235,0.45)", transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(37,99,235,0.7)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(37,99,235,0.45)"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8C1 8 3.5 3 8 3s7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="2" stroke="white" strokeWidth="1.4"/>
                    </svg>
                    Open Preview
                  </button>
                )}
                <Badge
                  variant="outline"
                  className={cn("text-[10px] py-0 uppercase border-transparent font-mono", langColors[active.language] ?? (isDark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-200 text-gray-700 border-gray-300"))}
                >
                  {active.language}
                </Badge>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Editor
                key={isDark ? "dark" : "light"}
                height="100%"
                theme={isDark ? "vs-dark" : "codecanvas-light"}
                language={active.language}
                value={active.code}
                onChange={handleCodeChange}
                beforeMount={(monaco: Monaco) => {
                monaco.editor.defineTheme("codecanvas-light", {
                  base: "vs",
                  inherit: true,
                  rules: [
                    { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
                    { token: "keyword", foreground: "6366f1" },
                    { token: "string", foreground: "0d9488" },
                    { token: "number", foreground: "d97706" },
                    { token: "type", foreground: "2563eb" },
                  ],
                  colors: {
                    "editor.background": "#eef2f7",
                    "editor.foreground": "#2d3748",
                    "editor.lineHighlightBackground": "#e4e9f2",
                    "editor.lineHighlightBorder": "#00000000",
                    "editorLineNumber.foreground": "#a0aec0",
                    "editorLineNumber.activeForeground": "#4a5568",
                    "editorGutter.background": "#eef2f7",
                    "editor.selectionBackground": "#c7d2fe",
                    "editor.inactiveSelectionBackground": "#dde4f5",
                    "editorIndentGuide.background": "#d8e0ed",
                    "editorIndentGuide.activeBackground": "#b0bcda",
                    "editorCursor.foreground": "#4f46e5",
                    "editorWhitespace.foreground": "#cbd5e1",
                  }
                });
                }}
                options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 20 }, scrollBeyondLastLine: false, fontFamily: "'JetBrains Mono',monospace", lineNumbersMinChars: 3, scrollbar: { vertical: "auto", horizontal: "hidden" } }}
              />
            </div>
          </div>
        )}

        {previewOpen && canPreview && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ height: 44, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace", color: T.textMuted }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
                  <path d="M1 8C1 8 3.5 3 8 3s7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <span>Preview — {active.title}</span>
              </div>
              <button onClick={() => setPreviewOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.text, transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.inputBg; }}
              >
                <ArrowLeft style={{ width: 13, height: 13 }} />
                Back to Editor
              </button>
            </div>
            <iframe srcDoc={active.code} style={{ flex: 1, width: "100%", border: "none", background: "white" }} title="preview" />
          </div>
        )}
      </div>
    </div>
  );
}