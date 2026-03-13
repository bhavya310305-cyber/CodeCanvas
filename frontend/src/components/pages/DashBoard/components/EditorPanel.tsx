import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import { ArrowLeft, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Snippet, ThemeTokens } from "../types";
import { langColors, langDotClass } from "../constants";
import api from "@/lib/axios";

interface SnippetVersion {
  _id: string;
  snippetId: string;
  code: string;
  createdAt: string;
}

interface Props {
  active: Snippet | null;
  openTabs: string[];
  activeId: string;
  snippets: Snippet[];
  isDark: boolean;
  historySnippetId: string | null;
  onSetActiveId: (id: string) => void;
  onCloseTab: (e: React.MouseEvent, id: string) => void;
  onUpdateCode: (id: string, code: string) => Promise<void>;
  onUpdateTags: (id: string, tags: string[]) => Promise<void>;
  onRestoreVersion: (snippetId: string, versionId: string) => Promise<void>;
  onCloseHistory: () => void;
  T: ThemeTokens;
}

const langExtensions: Record<string, string> = {
  javascript: "js", typescript: "ts", html: "html", css: "css",
  python: "py", java: "java", cpp: "cpp", json: "json", markdown: "md",
};

const outputLanguages = ["javascript", "typescript", "json", "markdown", "python", "java", "cpp"];
const unsupportedLanguages = ["python", "java", "cpp"];

interface ConsoleEntry {
  type: "log" | "error" | "warn" | "info";
  args: string[];
}

function getMarkdownHtml(code: string, isDark: boolean): string {
  const html = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  const bg = isDark ? "#0d1117" : "#ffffff";
  const fg = isDark ? "#e5e5e5" : "#1a1a1a";
  const codeBg = isDark ? "#1e1e2e" : "#f3f4f6";
  const h = isDark ? "#ffffff" : "#111827";
  return `<!DOCTYPE html><html><head><style>
    body{margin:0;padding:20px;background:${bg};color:${fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.7}
    h1,h2,h3{color:${h};margin:16px 0 8px}h1{font-size:22px}h2{font-size:18px}h3{font-size:15px}
    code{background:${codeBg};padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:12px}
    ul{padding-left:20px}li{margin:4px 0}a{color:#3b82f6}p{margin:8px 0}
  </style></head><body><p>${html}</p></body></html>`;
}

function getPrettyJson(code: string, isDark: boolean): string {
  let pretty = "";
  let parseError = "";
  try { pretty = JSON.stringify(JSON.parse(code), null, 2); }
  catch (e: unknown) { parseError = e instanceof Error ? e.message : "Invalid JSON"; }
  const bg = isDark ? "#0d1117" : "#ffffff";
  const fg = isDark ? "#e5e5e5" : "#1a1a1a";
  const errColor = "#ef4444";
  const keyColor = isDark ? "#7dd3fc" : "#2563eb";
  const strColor = isDark ? "#86efac" : "#16a34a";
  const numColor = isDark ? "#fbbf24" : "#d97706";
  if (parseError) {
    return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:${bg};font-family:'JetBrains Mono',monospace;font-size:12px;">
      <div style="color:${errColor};font-weight:600">⚠ JSON Parse Error</div>
      <div style="color:${errColor};margin-top:8px;opacity:0.8;font-size:11px">${parseError}</div>
    </body></html>`;
  }
  const highlighted = pretty
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span style="color:${keyColor}">${match}</span>`;
        return `<span style="color:${strColor}">${match}</span>`;
      }
      return `<span style="color:${numColor}">${match}</span>`;
    });
  return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:${bg};font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.6;color:${fg};">
    <pre style="margin:0;white-space:pre-wrap;word-break:break-all">${highlighted}</pre>
  </body></html>`;
}

function getJsRunnerHtml(code: string, isTs: boolean): string {
  const escapedCode = code.replace(/`/g, "\\`").replace(/\$/g, "\\$");
  if (isTs) {
    return `<!DOCTYPE html><html><body style="margin:0;">
      <script src="https://cdn.jsdelivr.net/npm/typescript@5.3.3/lib/typescript.js"></script>
      <script>
        const __logs=[];
        const __push=(type,args)=>{__logs.push({type,args:args.map(a=>{try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch{return String(a)}})})};
        const console={log:(...a)=>__push('log',a),error:(...a)=>__push('error',a),warn:(...a)=>__push('warn',a),info:(...a)=>__push('info',a)};
        window.alert=(msg)=>__push('log',['🔔 alert: '+String(msg)]);
        window.confirm=(msg)=>{__push('log',['❓ confirm: '+String(msg)]);return true;};
        window.prompt=(msg,def)=>{__push('log',['✏️ prompt: '+String(msg)]);return def??'';};
        let __sent=false;
        window.onerror=(msg)=>{__push('error',[msg]);window.parent.postMessage({type:'console',logs:__logs},'*');__sent=true;return true;};
        try{
          const jsCode=ts.transpileModule(\`${escapedCode}\`,{compilerOptions:{target:ts.ScriptTarget.ES2017,module:ts.ModuleKind.None,strict:false}}).outputText;
          eval(jsCode);
        }catch(e){__push('error',[e.message]);}
        if(!__sent)window.parent.postMessage({type:'console',logs:__logs},'*');
      </script>
    </body></html>`;
  }
  return `<!DOCTYPE html><html><body style="margin:0;">
    <script>
      const __logs=[];
      const __push=(type,args)=>{__logs.push({type,args:args.map(a=>{try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch{return String(a)}})})};
      const console={log:(...a)=>__push('log',a),error:(...a)=>__push('error',a),warn:(...a)=>__push('warn',a),info:(...a)=>__push('info',a)};
      window.alert=(msg)=>__push('log',['🔔 alert: '+String(msg)]);
      window.confirm=(msg)=>{__push('log',['❓ confirm: '+String(msg)]);return true;};
      window.prompt=(msg,def)=>{__push('log',['✏️ prompt: '+String(msg)]);return def??'';};
      let __sent=false;
      window.onerror=(msg)=>{__push('error',[msg]);window.parent.postMessage({type:'console',logs:__logs},'*');__sent=true;return true;};
      try{eval(${JSON.stringify(code)});}catch(e){__push('error',[e.message]);}
      if(!__sent)window.parent.postMessage({type:'console',logs:__logs},'*');
    </script>
  </body></html>`;
}

// ── Builds combined HTML with injected CSS + JS from linked snippets ──
function buildCombinedPreview(html: string, linked: Snippet[]): string {
  const cssSnippets = linked.filter(s => s.language === "css");
  const jsSnippets = linked.filter(s => s.language === "javascript" || s.language === "typescript");

  const styleBlock = cssSnippets.length > 0
    ? `<style>\n${cssSnippets.map(s => `/* ${s.title} */\n${s.code}`).join("\n\n")}\n</style>`
    : "";

  const scriptBlock = jsSnippets.length > 0
    ? `<script>\n${jsSnippets.map(s => `// ${s.title}\n${s.code}`).join("\n\n")}\n</script>`
    : "";

  // Inject before </head> if exists, otherwise prepend
  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleBlock}\n</head>`).replace("</body>", `${scriptBlock}\n</body>`);
  }
  return `${styleBlock}\n${html}\n${scriptBlock}`;
}

export function EditorPanel({ active, openTabs, activeId, snippets, isDark, historySnippetId, onSetActiveId, onCloseTab, onUpdateCode, onUpdateTags, onRestoreVersion, onCloseHistory, T }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [outputDoc, setOutputDoc] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ── Multi-file preview ──
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [addFileOpen, setAddFileOpen] = useState(false);
  const addFileRef = useRef<HTMLDivElement>(null);
  // ── Version history ──
  const [versions, setVersions] = useState<SnippetVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<SnippetVersion | null>(null);
  const [restoring, setRestoring] = useState(false);

  const historyOpen = historySnippetId === active?._id;
  const [historyWidth, setHistoryWidth] = useState(300);
  const HISTORY_MIN = 260;
  const historyDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  // ── Footer stats ──
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  function handleHistoryDragStart(e: React.MouseEvent) {
    e.preventDefault();
    historyDragRef.current = { startX: e.clientX, startWidth: historyWidth };
    const onMove = (ev: MouseEvent) => {
      if (!historyDragRef.current) return;
      const delta = historyDragRef.current.startX - ev.clientX;
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      const newWidth = Math.min(maxWidth, Math.max(HISTORY_MIN, historyDragRef.current.startWidth + delta));
      setHistoryWidth(newWidth);
    };
    const onUp = () => {
      historyDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const canPreview = active?.language === "html";
  const canOutput = active ? outputLanguages.includes(active.language) : false;
  const isUnsupported = active ? unsupportedLanguages.includes(active.language) : false;

  // Snippets available to link — CSS and JS only, not the current one
  const linkableSnippets = snippets.filter(s =>
    s._id !== active?._id &&
    (s.language === "css" || s.language === "javascript")
  );
  const linkedSnippets = linkedIds.map(id => snippets.find(s => s._id === id)).filter(Boolean) as Snippet[];

  useEffect(() => {
    if (!canPreview) { setPreviewOpen(false); setLinkedIds([]); setAddFileOpen(false); }
    if (!canOutput) setOutputOpen(false);
  }, [active?._id, canPreview, canOutput]);

  // Reset linked files when switching to a different snippet
  useEffect(() => {
    setLinkedIds([]);
    setAddFileOpen(false);
  }, [active?._id]);

  useEffect(() => {
    setTagInput("");
    setTagInputVisible(false);
  }, [active?._id]);

  useEffect(() => {
    if (tagInputVisible) setTimeout(() => tagInputRef.current?.focus(), 50);
  }, [tagInputVisible]);

  // Fetch versions when history panel opens
  useEffect(() => {
    if (!historyOpen || !active) { setVersions([]); setSelectedVersion(null); return; }
    setVersionsLoading(true);
    api.get(`/snippets/${active._id}/versions`)
      .then(res => { setVersions(res.data); setSelectedVersion(null); })
      .catch(() => setVersions([]))
      .finally(() => setVersionsLoading(false));
  }, [historyOpen, active?._id]);

  // Close add file dropdown on outside click
  useEffect(() => {
    if (!addFileOpen) return;
    const handler = (e: MouseEvent) => {
      if (addFileRef.current && !addFileRef.current.contains(e.target as Node)) {
        setAddFileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addFileOpen]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "console") setConsoleLogs(e.data.logs);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  function runOutput() {
    if (!active) return;
    if (active.language === "markdown") {
      setOutputDoc(getMarkdownHtml(active.code, isDark));
      setIframeKey(k => k + 1);
    } else if (active.language === "json") {
      setOutputDoc(getPrettyJson(active.code, isDark));
      setIframeKey(k => k + 1);
    } else if (active.language === "javascript" || active.language === "typescript") {
      setConsoleLogs([]);
      setOutputDoc(getJsRunnerHtml(active.code, active.language === "typescript"));
      setIframeKey(k => k + 1);
    }
  }

  function handleOpenOutput() {
    setOutputOpen(true);
    setTimeout(() => runOutput(), 50);
  }

  function handleCodeChange(value: string | undefined) {
    if (!active || value === undefined) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { onUpdateCode(active._id, value); }, 1000);
  }

  function handleCopy() {
    if (!active?.code) return;
    navigator.clipboard.writeText(active.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExport() {
    if (!active?.code) return;
    const ext = langExtensions[active.language] ?? "txt";
    const filename = `${active.title.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
    const blob = new Blob([active.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddTag() {
    if (!active || !tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    const current = active.tags ?? [];
    if (current.includes(newTag)) { setTagInput(""); return; }
    onUpdateTags(active._id, [...current, newTag]);
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    if (!active) return;
    onUpdateTags(active._id, (active.tags ?? []).filter(t => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); handleAddTag(); }
    if (e.key === "Escape") { setTagInput(""); setTagInputVisible(false); }
    if (e.key === "Backspace" && tagInput === "" && active?.tags?.length) {
      handleRemoveTag(active.tags[active.tags.length - 1]);
    }
  }

  // ── Combined preview doc: HTML + linked CSS + JS ──
  const previewDoc = active
    ? buildCombinedPreview(active.code, linkedSnippets)
    : "";

  const consoleColors: Record<string, string> = {
    log: isDark ? "#e5e5e5" : "#1a1a1a",
    error: "#ef4444", warn: "#f59e0b", info: "#3b82f6",
  };

  if (!active) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 48, flexShrink: 0, background: T.headerBg, borderBottom: `1px solid ${T.border}` }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

          {/* Dot grid background */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: isDark ? "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)" : "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

          {/* Glow blob */}
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: isDark ? "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 1 }}>

            {/* Icon */}
            <div style={{ width: 72, height: 72, borderRadius: 20, background: isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)", border: `1.5px solid ${isDark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px rgba(59,130,246,0.12)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#60a5fa" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>

            {/* Text */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Inter',sans-serif" }}>No snippet open</div>
              <div style={{ fontSize: 13, color: T.textMuted, fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>Select a snippet from the sidebar<br/>or create a new one to start editing</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Tabs ── */}
      <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "stretch", background: T.headerBg, borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(12px)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflowX: "auto", overflowY: "hidden" }}>
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

      <div style={{ flex: 1, display: "flex", padding: 18, gap: 14, overflow: "hidden" }}>

        {/* ── Editor ── */}
        {!previewOpen && (
          <div style={{ display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.editorPanelBg, flex: 1, minWidth: 0, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>

            {/* ── Editor Header ── */}
            <div style={{ padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0, minHeight: 44, gap: 12, flexWrap: "wrap" }}>

              {/* Left: filename */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace", color: T.textMuted, flexShrink: 0 }}>
                <span style={{ opacity: 0.5 }}>{"{ }"}</span>
                <span style={{ opacity: 0.3 }}>/</span>
                <span>{active.title}.{langExtensions[active.language] ?? active.language}</span>
              </div>

              {/* Center: tags */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", flex: 1, padding: "6px 0" }}>
                {(active.tags ?? []).map(tag => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#60a5fa", padding: 0, display: "flex", alignItems: "center", opacity: 0.7 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                    ><X style={{ width: 9, height: 9 }} /></button>
                  </span>
                ))}
                {tagInputVisible ? (
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { handleAddTag(); setTagInputVisible(false); }}
                    placeholder="add tag..."
                    style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: T.inputBg, border: "1px solid rgba(59,130,246,0.4)", color: T.text, outline: "none", fontFamily: "'Inter',sans-serif", width: 85 }}
                  />
                ) : (
                  <button onClick={() => setTagInputVisible(true)}
                    style={{ fontSize: 10, padding: "3px 9px", borderRadius: 5, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.35)", color: "#60a5fa", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3, transition: "all 0.15s", boxShadow: "0 0 8px rgba(59,130,246,0.15)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.2)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px rgba(59,130,246,0.3)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px rgba(59,130,246,0.15)"; }}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    tag
                  </button>
                )}
              </div>

              {/* Right: action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

                {/* ── + Add File button (HTML only) ── */}
                {canPreview && (
                  <div ref={addFileRef} style={{ position: "relative" }}>
                    {/* Linked file chips */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {linkedSnippets.map(sn => (
                        <span key={sn._id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px", borderRadius: 7, background: sn.language === "css" ? (isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.12)") : (isDark ? "rgba(234,179,8,0.15)" : "rgba(161,98,7,0.12)"), color: sn.language === "css" ? (isDark ? "#a5b4fc" : "#3730a3") : (isDark ? "#fde047" : "#92400e"), border: `1px solid ${sn.language === "css" ? (isDark ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.4)") : (isDark ? "rgba(234,179,8,0.35)" : "rgba(161,98,7,0.4)")}`, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                          {sn.language === "css" ? "CSS" : "JS"} · {sn.title}
                          <button
                            onClick={() => setLinkedIds(prev => prev.filter(id => id !== sn._id))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, opacity: 0.7, transition: "opacity 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                          ><X style={{ width: 12, height: 12 }} /></button>
                        </span>
                      ))}
                      <button onClick={() => setAddFileOpen(v => !v)}
                        style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, background: addFileOpen ? "rgba(99,102,241,0.2)" : (isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.1)"), border: `1px solid ${addFileOpen ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.35)"}`, color: isDark ? "#a5b4fc" : "#3730a3", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)"; }}
                        onMouseLeave={e => { if (!addFileOpen) (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.1)"; }}
                      >
                        <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke={isDark ? "#a5b4fc" : "#3730a3"} strokeWidth="1.8" strokeLinecap="round"/></svg>
                        Add File
                      </button>
                    </div>

                    {/* Dropdown */}
                    {addFileOpen && (
                      <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50, width: 240, borderRadius: 10, background: isDark ? "#111827" : "#f8fafc", border: `1px solid ${T.border}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                        {linkableSnippets.length === 0 ? (
                          <div style={{ padding: "16px", fontSize: 12, color: T.textMuted, textAlign: "center" }}>
                            No CSS or JS snippets found
                          </div>
                        ) : (
                          <>
                            {/* CSS section */}
                            {linkableSnippets.filter(s => s.language === "css").length > 0 && (
                              <>
                                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>CSS</div>
                                {linkableSnippets.filter(s => s.language === "css").map(sn => {
                                  const isLinked = linkedIds.includes(sn._id);
                                  return (
                                    <div key={sn._id}
                                      onClick={() => { setLinkedIds(prev => isLinked ? prev.filter(id => id !== sn._id) : [...prev, sn._id]); }}
                                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", cursor: "pointer", fontSize: 12, color: isLinked ? "#a5b4fc" : T.text, background: isLinked ? "rgba(99,102,241,0.08)" : "transparent", transition: "background 0.15s" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLinked ? "rgba(99,102,241,0.12)" : T.snippetHover; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isLinked ? "rgba(99,102,241,0.08)" : "transparent"; }}
                                    >
                                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sn.title}</span>
                                      {isLinked && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#a5b4fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                  );
                                })}
                              </>
                            )}
                            {/* JS section */}
                            {linkableSnippets.filter(s => s.language === "javascript").length > 0 && (
                              <>
                                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", borderTop: linkableSnippets.filter(s => s.language === "css").length > 0 ? `1px solid ${T.border}` : "none" }}>JavaScript</div>
                                {linkableSnippets.filter(s => s.language === "javascript").map(sn => {
                                  const isLinked = linkedIds.includes(sn._id);
                                  return (
                                    <div key={sn._id}
                                      onClick={() => { setLinkedIds(prev => isLinked ? prev.filter(id => id !== sn._id) : [...prev, sn._id]); }}
                                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", cursor: "pointer", fontSize: 12, color: isLinked ? "#fde047" : T.text, background: isLinked ? "rgba(234,179,8,0.08)" : "transparent", transition: "background 0.15s" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLinked ? "rgba(234,179,8,0.12)" : T.snippetHover; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isLinked ? "rgba(234,179,8,0.08)" : "transparent"; }}
                                    >
                                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sn.title}</span>
                                      {isLinked && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#fde047" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

                {canOutput && (
                  <button onClick={outputOpen ? () => setOutputOpen(false) : handleOpenOutput}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif", background: outputOpen ? (isDark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)") : "linear-gradient(135deg, #2563eb, #4f46e5)", border: outputOpen ? "1px solid rgba(37,99,235,0.4)" : "none", color: outputOpen ? "#3b82f6" : "white", boxShadow: outputOpen ? "none" : "0 0 16px rgba(37,99,235,0.45)", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!outputOpen) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(37,99,235,0.7)"; }}
                    onMouseLeave={e => { if (!outputOpen) (e.currentTarget as HTMLElement).style.boxShadow = outputOpen ? "none" : "0 0 16px rgba(37,99,235,0.45)"; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 6l2.5 2.5L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 11H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {outputOpen ? "Hide Output" : "Run / View"}
                  </button>
                )}

                <button onClick={handleCopy}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", background: copied ? (isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)") : T.inputBg, border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : T.inputBorder}`, color: copied ? "#22c55e" : T.textMuted, transition: "all 0.2s" }}
                  onMouseEnter={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = T.text; }}
                  onMouseLeave={e => { if (!copied) (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                >
                  {copied ? (
                    <><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
                  ) : (
                    <><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 5V4a1 1 0 00-1-1H4a1.5 1.5 0 00-1.5 1.5v7A1 1 0 003.5 12H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>Copy</>
                  )}
                </button>

                <button onClick={handleExport}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.textMuted, transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8m0 0L5.5 7.5M8 10l2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Export
                </button>

                <Badge variant="outline" className={cn("text-[10px] py-0 uppercase border-transparent font-mono", langColors[active.language] ?? (isDark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-200 text-gray-700 border-gray-300"))}>
                  {active.language}
                </Badge>
              </div>
            </div>

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
              <Editor
                key={`${active._id}-${isDark ? "dark" : "light"}`}
                height="100%"
                theme={isDark ? "vs-dark" : "codecanvas-light"}
                language={active.language}
                defaultValue={active.code}
                onChange={handleCodeChange}
                beforeMount={(monaco: Monaco) => {
                  monaco.editor.defineTheme("codecanvas-light", {
                    base: "vs", inherit: true,
                    rules: [
                      { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
                      { token: "keyword", foreground: "6366f1" },
                      { token: "string", foreground: "0d9488" },
                      { token: "number", foreground: "d97706" },
                      { token: "type", foreground: "2563eb" },
                    ],
                    colors: {
                      "editor.background": "#eef2f7", "editor.foreground": "#2d3748",
                      "editor.lineHighlightBackground": "#e4e9f2", "editor.lineHighlightBorder": "#00000000",
                      "editorLineNumber.foreground": "#a0aec0", "editorLineNumber.activeForeground": "#4a5568",
                      "editorGutter.background": "#eef2f7", "editor.selectionBackground": "#c7d2fe",
                      "editor.inactiveSelectionBackground": "#dde4f5", "editorIndentGuide.background": "#d8e0ed",
                      "editorIndentGuide.activeBackground": "#b0bcda", "editorCursor.foreground": "#4f46e5",
                      "editorWhitespace.foreground": "#cbd5e1",
                    }
                  });
                }}
                onMount={(editor) => {
                  editor.onDidChangeCursorPosition(e => {
                    setCursorLine(e.position.lineNumber);
                    setCursorCol(e.position.column);
                  });
                }}
                options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 20 }, scrollBeyondLastLine: false, fontFamily: "'JetBrains Mono',monospace", lineNumbersMinChars: 3, scrollbar: { vertical: "auto", horizontal: "hidden" } }}
              />
              </div>
              {/* ── Footer ── */}
              <div style={{ height: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", background: T.editorHeaderBg, borderTop: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: T.textMuted, userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span>Ln {cursorLine}, Col {cursorCol}</span>
                  <span>{active.code.length} chars</span>
                  <span>{active.code.split("\n").length} lines</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Edited {(() => { const d = new Date(active.updatedAt ?? active.createdAt); const diff = Date.now() - d.getTime(); if (diff < 60000) return "just now"; if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`; return d.toLocaleDateString([], { month: "short", day: "numeric" }); })()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HTML Full Preview (now uses combined doc) ── */}
        {previewOpen && canPreview && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ height: 44, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace", color: T.textMuted }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
                  <path d="M1 8C1 8 3.5 3 8 3s7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <span>Preview — {active.title}</span>
                {linkedSnippets.length > 0 && (
                  <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                    +
                    {linkedSnippets.map(s => (
                      <span key={s._id} style={{ padding: "1px 6px", borderRadius: 4, background: s.language === "css" ? "rgba(99,102,241,0.15)" : "rgba(234,179,8,0.15)", color: s.language === "css" ? "#a5b4fc" : "#fde047", border: `1px solid ${s.language === "css" ? "rgba(99,102,241,0.3)" : "rgba(234,179,8,0.3)"}`, fontWeight: 600 }}>
                        {s.title}
                      </span>
                    ))}
                  </span>
                )}
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
            <iframe srcDoc={previewDoc} style={{ flex: 1, width: "100%", border: "none", background: "white" }} title="preview" sandbox="allow-scripts" />
          </div>
        )}

        {/* ── Split Output Panel ── */}
        {outputOpen && canOutput && !previewOpen && (
          <div style={{ display: "flex", flexDirection: "column", width: "40%", minWidth: 260, maxWidth: 480, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.editorPanelBg, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)", flexShrink: 0 }}>
            <div style={{ height: 44, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "monospace", color: T.textMuted }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5 6l2.5 2.5L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 11H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span>Output — {active.title}</span>
              </div>
              {(active.language === "javascript" || active.language === "typescript") && (
                <button onClick={runOutput}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 600, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", color: "#3b82f6", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.1)"; }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 5-10 5V3z" fill="#3b82f6"/></svg>
                  Re-run
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflow: "auto" }}>
              {isUnsupported && (() => {
                const urls: Record<string, string> = {
                  python: "https://onecompiler.com/python",
                  java: "https://onecompiler.com/java",
                  cpp: "https://onecompiler.com/cpp",
                };
                const names: Record<string, string> = { python: "Python", java: "Java", cpp: "C++" };
                const url = urls[active.language];
                const langName = names[active.language] ?? active.language;
                const [extCopied, setExtCopied] = [false, (_: boolean) => {}];
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center", padding: 28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: isDark ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.08)", border: "1.5px solid rgba(251,191,36,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                      {active.language === "python" ? "🐍" : active.language === "java" ? "☕" : "⚙️"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{langName} can't run in the browser</div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.7, maxWidth: 220 }}>
                        Copy your code and test it on an online compiler — it opens in a new tab so you don't lose your place.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(active.code).then(() => {
                          window.open(url, "onecompiler");
                        });
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif", background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", color: "white", boxShadow: "0 0 20px rgba(245,158,11,0.35)", transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(245,158,11,0.55)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(245,158,11,0.35)"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="9" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M10 5V4a1 1 0 00-1-1H4a1.5 1.5 0 00-1.5 1.5v7A1 1 0 003.5 12H5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      Copy & Open OneCompiler
                    </button>
                    <div style={{ fontSize: 11, color: T.textMuted, opacity: 0.6 }}>Copies your code · Opens OneCompiler · Just paste & run</div>
                  </div>
                );
              })()}

              {(active.language === "javascript" || active.language === "typescript") && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7, padding: "12px 16px" }}>
                  {consoleLogs.length === 0 ? (
                    <div style={{ color: T.textMuted, fontStyle: "italic", fontSize: 12 }}>
                      {active.language === "typescript" ? "Compiling & running..." : "Running..."}
                    </div>
                  ) : (
                    consoleLogs.map((entry, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: `1px solid ${T.border}`, alignItems: "flex-start" }}>
                        <span style={{ color: consoleColors[entry.type], opacity: 0.5, fontSize: 10, paddingTop: 3, flexShrink: 0 }}>
                          {entry.type === "error" ? "✕" : entry.type === "warn" ? "⚠" : entry.type === "info" ? "ℹ" : "›"}
                        </span>
                        <span style={{ color: consoleColors[entry.type], whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                          {entry.args.join(" ")}
                        </span>
                      </div>
                    ))
                  )}
                  <iframe key={iframeKey} srcDoc={outputDoc} style={{ display: "none" }} title="js-runner" sandbox="allow-scripts allow-same-origin" />
                </div>
              )}

              {(active.language === "json" || active.language === "markdown") && (
                <iframe key={iframeKey} srcDoc={outputDoc} style={{ width: "100%", height: "100%", border: "none" }} title="output" sandbox="allow-scripts" />
              )}
            </div>
          </div>
        )}

        {/* ── Version History Panel ── */}
        {historyOpen && active && (
          <div style={{ display: "flex", flexDirection: "column", width: historyWidth, minWidth: historyWidth, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.border}`, background: T.editorPanelBg, boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)", flexShrink: 0, position: "relative" }}>
            {/* Drag handle */}
            <div
              onMouseDown={handleHistoryDragStart}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", zIndex: 20, background: "transparent", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            />

            {/* Header */}
            <div style={{ height: 44, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.editorHeaderBg, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: T.text }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Version History
              </div>
              <button
                onClick={onCloseHistory}
                style={{ width: 24, height: 24, borderRadius: 5, background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
              ><X style={{ width: 12, height: 12 }} /></button>
            </div>

            {/* Version list */}
            <div style={{ flex: versionsLoading || versions.length === 0 ? 1 : "none", maxHeight: versionsLoading || versions.length === 0 ? undefined : 220, overflowY: "auto" }}>
              {versionsLoading && (
                <div style={{ padding: 24, textAlign: "center", color: T.textMuted, fontSize: 12 }}>Loading versions...</div>
              )}
              {!versionsLoading && versions.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", fontSize: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🕐</div>
                  <div style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>No versions yet</div>
                  <div style={{ color: T.textMuted, lineHeight: 1.5 }}>Versions are saved automatically each time you edit this snippet.</div>
                </div>
              )}
              {!versionsLoading && versions.map((v, i) => {
                const isSelected = selectedVersion?._id === v._id;
                const date = new Date(v.createdAt);
                const label = i === 0 ? "Latest save" : `Version ${versions.length - i}`;
                const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
                return (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVersion(isSelected ? null : v)}
                    style={{ padding: "10px 14px", cursor: "pointer", background: isSelected ? (isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.06)") : "transparent", borderBottom: `1px solid ${T.border}`, borderLeft: `3px solid ${isSelected ? "#3b82f6" : "transparent"}`, transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = T.snippetHover; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#60a5fa" : T.text }}>{label}</span>
                      {i === 0 && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)", fontWeight: 600 }}>LATEST</span>}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{dateStr} at {timeStr}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected version preview */}
            {selectedVersion && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", borderTop: `1px solid ${T.border}`, minHeight: 0 }}>
                <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>Preview</span>
                  <button
                    disabled={restoring}
                    onClick={async () => {
                      setRestoring(true);
                      await onRestoreVersion(active._id, selectedVersion._id);
                      setRestoring(false);
                      setSelectedVersion(null);
                      onCloseHistory();
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: restoring ? "rgba(37,99,235,0.1)" : "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 11, fontWeight: 600, cursor: restoring ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: restoring ? 0.6 : 1, transition: "all 0.15s" }}
                  >
                    <RotateCcw style={{ width: 10, height: 10 }} />
                    {restoring ? "Restoring..." : "Restore"}
                  </button>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <Editor
                    height="100%"
                    theme={isDark ? "vs-dark" : "codecanvas-light"}
                    language={active.language}
                    value={selectedVersion.code}
                    options={{ readOnly: true, fontSize: 11, minimap: { enabled: false }, padding: { top: 12 }, scrollBeyondLastLine: false, fontFamily: "'JetBrains Mono',monospace", lineNumbersMinChars: 2, scrollbar: { vertical: "auto", horizontal: "hidden" } }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}