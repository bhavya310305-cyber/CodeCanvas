import { useState, useMemo, useEffect, useCallback } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);

  const active = useMemo(
    () => snippets.find(s => s._id === activeId) ?? null,
    [snippets, activeId]
  );
  const T = useMemo(() => getThemeTokens(isDark), [isDark]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
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
      if (activeId === id) {
        setActiveId(next.length > 0 ? next[next.length - 1] : "");
      }
      return next;
    });
  }

  const handleCreateSnippet = useCallback(async (title: string, language: string, code: string) => {
    try {
      const res = await api.post("/snippets", { title, language, code });
      const newSnippet = res.data;
      setSnippets(prev => [newSnippet, ...prev]);
      setActiveId(newSnippet._id);
      setOpenTabs(prev => [newSnippet._id, ...prev]);
    } catch (err) {
      console.error("Failed to create snippet:", err);
    }
  }, []);

  const handleDeleteSnippet = useCallback(async (id: string) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => {
        const next = prev.filter(s => s._id !== id);
        if (activeId === id) setActiveId(next.length > 0 ? next[0]._id : "");
        return next;
      });
      setOpenTabs(prev => prev.filter(t => t !== id));
    } catch (err) {
      console.error("Failed to delete snippet:", err);
    }
  }, [activeId]);

  const handleUpdateCode = useCallback(async (id: string, code: string) => {
    try {
      await api.put(`/snippets/${id}`, { code });
      setSnippets(prev => prev.map(s => s._id === id ? { ...s, code } : s));
    } catch (err) {
      console.error("Failed to update snippet:", err);
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

      {/* Sidebar — push animation using width transition */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
      }}>
        <div style={{ width: 260, height: "100vh" }}>
          <Sidebar
            snippets={snippets}
            activeId={activeId}
            isDark={isDark}
            user={user}
            setUser={setUser}
            onSelectSnippet={handleSelectSnippet}
            onCloseSidebar={() => setSidebarOpen(false)}
            onToggleTheme={() => setIsDark(v => !v)}
            onLogout={handleLogout}
            onCreateSnippet={handleCreateSnippet}
            onDeleteSnippet={handleDeleteSnippet}
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
              onClick={() => setAiOpen(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", background: aiOpen ? "linear-gradient(135deg,#2563eb,#4f46e5)" : isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.1)", border: `1px solid ${aiOpen ? "transparent" : "rgba(59,130,246,0.3)"}`, color: aiOpen ? "white" : "#60a5fa", cursor: "pointer", boxShadow: aiOpen ? "0 0 20px rgba(37,99,235,0.3)" : "none", transition: "all 0.2s", flexShrink: 0 }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />AI Insight
            </button>
          </div>
        </header>

        {snippets.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: T.textMuted, fontFamily: "'Inter',sans-serif" }}>
            <div style={{ fontSize: 32 }}>📝</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>No snippets yet</div>
            <div style={{ fontSize: 12 }}>Click "New Snippet" to create your first one</div>
          </div>
        ) : (
          <EditorPanel
            active={active}
            openTabs={openTabs}
            activeId={activeId}
            snippets={snippets}
            isDark={isDark}
            onSetActiveId={setActiveId}
            onCloseTab={handleCloseTab}
            onUpdateCode={handleUpdateCode}
            T={T}
          />
        )}
      </main>

      {/* AI Panel — push animation using width transition */}
      <div style={{
        width: aiOpen ? 380 : 0,
        minWidth: aiOpen ? 380 : 0,
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
      }}>
        <div style={{ width: 380, height: "100vh" }}>
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