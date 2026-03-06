import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Sparkles, Plus, Search, Clock, Braces, FileCode, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: Date;
}

const sampleSnippets: Snippet[] = [
  {
    id: "1",
    title: "Debounce Function",
    language: "typescript",
    code: `function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    title: "Responsive Grid Layout",
    language: "html",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Grid Layout</title>
  <style>
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid #2a2a4a;
      border-radius: 12px;
      padding: 1.5rem;
      color: #e0e0e0;
    }
  </style>
</head>
<body style="background:#0f0f1a; margin:0;">
  <div class="grid">
    <div class="card"><h3>Card 1</h3><p>Content here</p></div>
    <div class="card"><h3>Card 2</h3><p>Content here</p></div>
    <div class="card"><h3>Card 3</h3><p>Content here</p></div>
  </div>
</body>
</html>`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    title: "useLocalStorage Hook",
    language: "typescript",
    code: `import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4",
    title: "Fetch Wrapper",
    language: "javascript",
    code: `async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }

  return response.json();
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "5",
    title: "CSS Animation Keyframes",
    language: "css",
    code: `@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const langColors: Record<string, string> = {
  typescript: "bg-primary/20 text-primary",
  javascript: "bg-yellow-500/20 text-yellow-400",
  html: "bg-orange-500/20 text-orange-400",
  css: "bg-blue-400/20 text-blue-400",
  python: "bg-green-500/20 text-green-400",
};

const Dashboard = () => {
  const [snippets] = useState<Snippet[]>(sampleSnippets);
  const [activeId, setActiveId] = useState(sampleSnippets[0].id);
  const [search, setSearch] = useState("");
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const filtered = useMemo(
    () =>
      snippets.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.language.toLowerCase().includes(search.toLowerCase())
      ),
    [snippets, search]
  );

  const active = snippets.find((s) => s.id === activeId) ?? snippets[0];
  const showPreview = active.language === "html";

  const monacoLang =
    active.language === "typescript"
      ? "typescript"
      : active.language === "javascript"
      ? "javascript"
      : active.language === "html"
      ? "html"
      : active.language === "css"
      ? "css"
      : "plaintext";

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 glass border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-4 h-14 flex items-center gap-2 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-glow" />
            <span className="font-display text-sm font-bold text-foreground">CODEBASE</span>
          </Link>
        </div>

        {/* New Snippet Button */}
        <div className="px-3 pt-3">
          <Button variant="hero" className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" />
            New Snippet
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary/50 border-border"
            />
          </div>
        </div>

        {/* Snippet List */}
        <ScrollArea className="flex-1 mt-3">
          <div className="px-2 pb-3 space-y-0.5">
            {filtered.map((snippet) => (
              <button
                key={snippet.id}
                onClick={() => setActiveId(snippet.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 group ${
                  snippet.id === activeId
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/60 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {snippet.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                      langColors[snippet.language] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {snippet.language}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(snippet.createdAt)}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No snippets found</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-3">
            <Tabs value={activeId} onValueChange={setActiveId}>
              <TabsList className="h-8 bg-secondary/50">
                {snippets.slice(0, 3).map((s) => (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className="text-xs h-6 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                  >
                    <FileCode className="h-3 w-3 mr-1.5" />
                    {s.title.length > 15 ? s.title.slice(0, 15) + "…" : s.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCmdOpen(!cmdOpen)}
              className="flex items-center gap-2 h-8 px-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors duration-200"
            >
              <Command className="h-3 w-3" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* AI Explain */}
            <Button
              variant="heroOutline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setAiSheetOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5 text-glow" />
              AI Explain
            </Button>
          </div>
        </header>

        {/* Editor + Preview */}
        <div className="flex-1 flex min-h-0">
          {/* Editor */}
          <div className={`flex-1 min-w-0 ${showPreview ? "border-r border-border" : ""}`}>
            <div className="h-8 bg-secondary/30 border-b border-border flex items-center px-4 gap-2">
              <Braces className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-mono">
                {active.title}.{active.language === "typescript" ? "ts" : active.language === "javascript" ? "js" : active.language}
              </span>
              <Badge
                variant="secondary"
                className={`ml-auto text-[10px] px-1.5 py-0 h-4 font-normal ${
                  langColors[active.language] || "bg-muted text-muted-foreground"
                }`}
              >
                {active.language}
              </Badge>
            </div>
            <Editor
              height="calc(100% - 32px)"
              language={monacoLang}
              value={active.code}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 20,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                renderLineHighlight: "gutter",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
              }}
            />
          </div>

          {/* Live Preview - only for HTML */}
          {showPreview && (
            <div className="w-[35%] flex flex-col min-w-0">
              <div className="h-8 bg-secondary/30 border-b border-border flex items-center px-4">
                <span className="text-[11px] text-muted-foreground font-mono">Preview</span>
              </div>
              <div className="flex-1 bg-card">
                <iframe
                  title="Live Preview"
                  srcDoc={active.code}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Sheet */}
      <Sheet open={aiSheetOpen} onOpenChange={setAiSheetOpen}>
        <SheetContent className="bg-background border-border w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-4 w-4 text-glow" />
              AI Code Explanation
            </SheetTitle>
            <SheetDescription>
              AI-powered analysis of your current snippet
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-card border border-border p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Analyzing: {active.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This feature will use AI to explain your code line by line,
                identify patterns, suggest improvements, and help you understand
                complex logic. Connect to an AI provider to enable this feature.
              </p>
            </div>
            <div className="rounded-lg bg-surface/40 border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Ready for AI integration</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 rounded w-full" />
                <div className="h-3 bg-muted/50 rounded w-4/5" />
                <div className="h-3 bg-muted/50 rounded w-3/5" />
                <div className="h-3 bg-muted/50 rounded w-4/5" />
                <div className="h-3 bg-muted/50 rounded w-2/5" />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Command Palette Overlay */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => setCmdOpen(false)}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search snippets, commands..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                ESC
              </kbd>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {snippets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveId(s.id);
                    setCmdOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-secondary/60 transition-colors duration-200"
                >
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{s.language}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
