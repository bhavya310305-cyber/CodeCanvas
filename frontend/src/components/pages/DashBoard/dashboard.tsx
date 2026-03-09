import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Menu, Search, Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Snippet } from "./types";
import { getThemeTokens } from "./utils";
import { Sidebar } from "./components/Sidebar";
import { SearchModal } from "./components/SearchModal";
import { EditorPanel } from "./components/EditorPanel";
import { AiPanel } from "./components/AiPanel";
import api from "@/lib/axios";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // ── Version history ──
  const [historySnippetId, setHistorySnippetId] = useState<string | null>(null);
  const [triggerNewSnippet, setTriggerNewSnippet] = useState(false);
  // ── Resizable AI panel ──
  const [aiWidth, setAiWidth] = useState(380);
  const AI_MIN = 320;
  const aiDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  function handleAiDragStart(e: React.MouseEvent) {
    e.preventDefault();
    aiDragRef.current = { startX: e.clientX, startWidth: aiWidth };
    const onMove = (ev: MouseEvent) => {
      if (!aiDragRef.current) return;
      const delta = aiDragRef.current.startX - ev.clientX;
      const maxWidth = Math.floor(window.innerWidth * 0.5);
      const newWidth = Math.min(maxWidth, Math.max(AI_MIN, aiDragRef.current.startWidth + delta));
      setAiWidth(newWidth);
    };
    const onUp = () => {
      aiDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const active = useMemo(
    () => snippets.find(s => s._id === activeId) ?? null,
    [snippets, activeId]
  );
  const T = useMemo(() => getThemeTokens(isDark), [isDark]);

  const filteredSnippets = useMemo(() => {
    if (!activeTag) return snippets;
    return snippets.filter(s => s.tags?.includes(activeTag));
  }, [snippets, activeTag]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    snippets.forEach(s => s.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [snippets]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchSnippets = async () => {
      try {
        const res = await api.get("/snippets");
        setSnippets(res.data);
      } catch (err) {
        console.error("Failed to fetch snippets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, [user]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Sidebar: closed for first-time users, open for returning users (per account)
  useEffect(() => {
    if (!user) return;
    const key = `cc_visited_${user.id}`;
    const hasVisited = localStorage.getItem(key);
    if (hasVisited) {
      setSidebarOpen(true);
    } else {
      localStorage.setItem(key, 'true');
      setSidebarOpen(false);
    }
  }, [user?.id]);

  function handleSelectSnippet(id: string) {
    setActiveId(id);
    setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id]);
    setSearchOpen(false);
    setSearch("");
  }

  function handleCloseTab(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== id);
      if (activeId === id) setActiveId(next.length > 0 ? next[next.length - 1] : "");
      return next;
    });
    // Close history if the closed tab was the history snippet
    if (historySnippetId === id) setHistorySnippetId(null);
  }

  const handleCreateSnippet = useCallback(async (title: string, language: string, code: string) => {
    try {
      const res = await api.post("/snippets", { title, language, code, tags: [] });
      const newSnippet = res.data;
      setSnippets(prev => [newSnippet, ...prev]);
      setActiveId(newSnippet._id);
      setOpenTabs(prev => [newSnippet._id, ...prev]);
    } catch (err) {
      console.error("Failed to create snippet:", err);
    }
  }, []);

  const handleRenameSnippet = useCallback(async (id: string, newTitle: string) => {
    try {
      const res = await api.put(`/snippets/${id}`, { title: newTitle });
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, title: res.data.title } : s));
    } catch (err) {
      console.error("Failed to rename snippet:", err);
    }
  }, []);

  const handleDuplicateSnippet = useCallback(async (id: string) => {
    try {
      const original = snippets.find(s => s._id === id);
      if (!original) return;
      const res = await api.post("/snippets", {
        title: `Copy of ${original.title}`,
        language: original.language,
        code: original.code,
        tags: original.tags || [],
      });
      const newSnippet = res.data;
      setSnippets(prev => [newSnippet, ...prev]);
      setActiveId(newSnippet._id);
      setOpenTabs(prev => [newSnippet._id, ...prev]);
    } catch (err) {
      console.error("Failed to duplicate snippet:", err);
    }
  }, [snippets]);

  const handleDeleteSnippet = useCallback(async (id: string) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => {
        const next = prev.filter(s => s._id !== id);
        if (activeId === id) setActiveId(next.length > 0 ? next[0]._id : "");
        return next;
      });
      setOpenTabs(prev => prev.filter(t => t !== id));
      if (historySnippetId === id) setHistorySnippetId(null);
    } catch (err) {
      console.error("Failed to delete snippet:", err);
    }
  }, [activeId, historySnippetId]);

  const handleUpdateCode = useCallback(async (id: string, code: string) => {
    try {
      await api.put(`/snippets/${id}`, { code });
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, code } : s));
    } catch (err) {
      console.error("Failed to update snippet:", err);
    }
  }, []);

  const handleUpdateTags = useCallback(async (id: string, tags: string[]) => {
    try {
      await api.put(`/snippets/${id}`, { tags });
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, tags } : s));
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  }, []);

  // Restore a version — updates the snippet in local state too
  const handleRestoreVersion = useCallback(async (snippetId: string, versionId: string) => {
    try {
      const res = await api.post(`/snippets/${snippetId}/restore/${versionId}`);
      setSnippets(prev => prev.map(s => s._id === snippetId ? { ...s, code: res.data.code } : s));
    } catch (err) {
      console.error("Failed to restore version:", err);
    }
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      navigate("/login");
    }
  }

  // ── Open history: close AI panel, set history snippet ──
  function handleViewHistory(id: string) {
    setAiOpen(false);
    setHistorySnippetId(prev => prev === id ? null : id);
  }

  // ── Open AI: close history panel ──
  function handleToggleAi() {
    setHistorySnippetId(null);
    setAiOpen(v => !v);
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setSearch(""); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const scrollbarCSS = `
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"};border-radius:4px}
    *{scrollbar-width:thin;scrollbar-color:${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"} transparent}
  `;

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117", color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif", fontSize: 14 }}>
        Loading your workspace...
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: T.bg, color: T.text, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{scrollbarCSS}</style>

      <SearchModal
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setSearch(""); }}
        snippets={snippets}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelectSnippet}
        isDark={isDark}
        T={T}
      />

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 260 : 0, minWidth: sidebarOpen ? 260 : 0, overflow: "hidden", transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0 }}>
        <div style={{ width: 260, height: "100vh" }}>
          <Sidebar
            snippets={filteredSnippets}
            activeId={activeId}
            isDark={isDark}
            user={user}
            setUser={setUser}
            allTags={allTags}
            activeTag={activeTag}
            onSelectTag={tag => setActiveTag(prev => prev === tag ? null : tag)}
            onSelectSnippet={handleSelectSnippet}
            onCloseSidebar={() => setSidebarOpen(false)}
            onToggleTheme={() => setIsDark(v => !v)}
            onLogout={handleLogout}
            onCreateSnippet={handleCreateSnippet}
            onDeleteSnippet={handleDeleteSnippet}
            onViewHistory={handleViewHistory}
            onRenameSnippet={handleRenameSnippet}
            onDuplicateSnippet={handleDuplicateSnippet}
            triggerNewSnippet={triggerNewSnippet}
            onTriggerNewSnippetHandled={() => setTriggerNewSnippet(false)}
            T={T}
          />
        </div>
      </div>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: T.bg }}>
        {isDark && <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: "radial-gradient(ellipse,rgba(37,99,235,0.06) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />}

        <header style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.headerBg, borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(12px)", padding: "0 16px", gap: 8, position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}>
                <Menu style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 8, background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.text, cursor: "pointer", fontSize: 13, fontFamily: "'Inter',sans-serif", minWidth: 200, transition: "border-color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.inputBorder; }}
            >
              <Search style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Search...</span>
              <kbd style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", color: T.textMuted, fontFamily: "monospace", border: `1px solid ${T.border}`, flexShrink: 0 }}>
                {/Mac|iPhone|iPod|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: T.inputBg, border: `1px solid ${T.inputBorder}`, cursor: "pointer", color: isDark ? "#fbbf24" : "#6366f1", flexShrink: 0 }}
            >
              {isDark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
            </button>

            <button
              onClick={handleToggleAi}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", background: aiOpen ? "linear-gradient(135deg,#2563eb,#4f46e5)" : isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.1)", border: `1px solid ${aiOpen ? "transparent" : "rgba(59,130,246,0.3)"}`, color: aiOpen ? "white" : "#60a5fa", cursor: "pointer", boxShadow: aiOpen ? "0 0 20px rgba(37,99,235,0.3)" : "none", transition: "all 0.2s", flexShrink: 0 }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />AI Insight
            </button>
          </div>
        </header>

        {snippets.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

            {/* Dot grid */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: isDark ? "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)" : "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: isDark ? "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" : "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 1 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)", border: `1.5px solid ${isDark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 32px rgba(59,130,246,0.12)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#60a5fa" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "'Inter',sans-serif" }}>No snippets yet</div>
                <div style={{ fontSize: 13, color: T.textMuted, fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>Create your first snippet to get started</div>
              </div>
              <button
                onClick={() => { setSidebarOpen(true); setTriggerNewSnippet(true); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#4f46e5)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", boxShadow: "0 0 20px rgba(37,99,235,0.35)", transition: "box-shadow 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(37,99,235,0.55)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(37,99,235,0.35)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Snippet
              </button>
            </div>
          </div>
        ) : (
          <EditorPanel
            active={active}
            openTabs={openTabs}
            activeId={activeId}
            snippets={snippets}
            isDark={isDark}
            historySnippetId={historySnippetId}
            onSetActiveId={setActiveId}
            onCloseTab={handleCloseTab}
            onUpdateCode={handleUpdateCode}
            onUpdateTags={handleUpdateTags}
            onRestoreVersion={handleRestoreVersion}
            onCloseHistory={() => setHistorySnippetId(null)}
            T={T}
          />
        )}
      </main>

      {/* AI Panel — resizable */}
      <div style={{ width: aiOpen ? aiWidth : 0, minWidth: aiOpen ? aiWidth : 0, overflow: "hidden", transition: aiDragRef.current ? "none" : "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0, position: "relative" }}>
        {/* Drag handle */}
        {aiOpen && (
          <div
            onMouseDown={handleAiDragStart}
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", zIndex: 20, background: "transparent", transition: "background 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          />
        )}
        <div style={{ width: "100%", height: "100vh" }}>
          <AiPanel
            active={active}
            isDark={isDark}
            onClose={() => setAiOpen(false)}
            onOpenSidebar={() => setSidebarOpen(true)}
            T={T}
          />
        </div>
      </div>
    </div>
  );
}