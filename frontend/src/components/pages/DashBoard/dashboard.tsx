import { useState, useMemo, useEffect } from "react";
import { Menu, Search, Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Snippet } from "./types";
import { sampleSnippets } from "./constants";
import { getThemeTokens } from "./utils";
import { Sidebar } from "./components/Sidebar";
import { SearchModal } from "./components/SearchModal";
import { EditorPanel } from "./components/EditorPanel";
import { AiPanel } from "./components/AiPanel";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [snippets] = useState<Snippet[]>(sampleSnippets);
  const [activeId, setActiveId] = useState(sampleSnippets[0].id);
  const [openTabs, setOpenTabs] = useState<string[]>([sampleSnippets[0].id]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const active = useMemo(() => snippets.find(s => s.id === activeId) ?? snippets[0], [snippets, activeId]);
  const T = useMemo(() => getThemeTokens(isDark), [isDark]);

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
      if (activeId === id && next.length > 0) setActiveId(next[next.length - 1]);
      return next;
    });
  }

  function handleLogout() {
    setUser(null);
    navigate("/login");
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

      {sidebarOpen && (
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
          T={T}
        />
      )}

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: T.bg }}>
        {isDark && <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: "radial-gradient(ellipse,rgba(37,99,235,0.06) 0%,transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />}

        {/* Navbar */}
        <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.headerBg, borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(12px)", padding: "0 14px", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, borderRadius: 8 }}
                onMouseEnter={e => { e.currentTarget.style.color = T.text; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}>
                <Menu style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSearchOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 8, background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.textMuted, cursor: "pointer", fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
              <Search style={{ width: 13, height: 13 }} /><span>Search...</span>
              <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, marginLeft: 2, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", color: T.textMuted, fontFamily: "monospace", border: `1px solid ${T.border}` }}>⌘K</kbd>
            </button>
            <button onClick={() => setIsDark(!isDark)} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: T.inputBg, border: `1px solid ${T.inputBorder}`, cursor: "pointer", color: isDark ? "#fbbf24" : "#6366f1" }}>
              {isDark ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
            </button>
            <button onClick={() => setAiOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: aiOpen ? "linear-gradient(135deg,#2563eb,#4f46e5)" : isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.1)", border: `1px solid ${aiOpen ? "transparent" : "rgba(59,130,246,0.3)"}`, color: aiOpen ? "white" : "#60a5fa", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", boxShadow: aiOpen ? "0 0 20px rgba(37,99,235,0.3)" : "none" }}>
              <Sparkles style={{ width: 13, height: 13 }} />AI Insight
            </button>
          </div>
        </header>

        <EditorPanel
          active={active}
          openTabs={openTabs}
          activeId={activeId}
          snippets={snippets}
          isDark={isDark}
          onSetActiveId={setActiveId}
          onCloseTab={handleCloseTab}
          T={T}
        />
      </main>

      {aiOpen && (
        <AiPanel
          active={active}
          isDark={isDark}
          onClose={() => setAiOpen(false)}
          T={T}
        />
      )}
    </div>
  );
}
