interface BadgeStyle {
  bg: string;
  color: string;
  border: string;
}

type BadgeMap = Record<string, BadgeStyle>;

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function getBadge(lang: string, isDark: boolean) {
  const dark: BadgeMap = {
    typescript: { bg: "rgba(59,130,246,0.18)",  color: "#93c5fd", border: "rgba(59,130,246,0.35)" },
    javascript: { bg: "rgba(234,179,8,0.18)",   color: "#fde047", border: "rgba(234,179,8,0.35)" },
    html:       { bg: "rgba(249,115,22,0.18)",  color: "#fb923c", border: "rgba(249,115,22,0.35)" },
    css:        { bg: "rgba(99,102,241,0.18)",  color: "#a5b4fc", border: "rgba(99,102,241,0.35)" },
    python:     { bg: "rgba(34,197,94,0.18)",   color: "#86efac", border: "rgba(34,197,94,0.35)" },
    java:       { bg: "rgba(239,68,68,0.18)",   color: "#fca5a5", border: "rgba(239,68,68,0.35)" },
    cpp:        { bg: "rgba(168,85,247,0.18)",  color: "#d8b4fe", border: "rgba(168,85,247,0.35)" },
    json:       { bg: "rgba(245,158,11,0.18)",  color: "#fcd34d", border: "rgba(245,158,11,0.35)" },
    markdown:   { bg: "rgba(20,184,166,0.18)",  color: "#5eead4", border: "rgba(20,184,166,0.35)" },
  };
  const light: BadgeMap = {
    typescript: { bg: "rgba(59,130,246,0.12)",  color: "#1d4ed8", border: "rgba(59,130,246,0.3)" },
    javascript: { bg: "rgba(161,98,7,0.12)",    color: "#92400e", border: "rgba(161,98,7,0.3)" },
    html:       { bg: "rgba(194,65,12,0.12)",   color: "#9a3412", border: "rgba(194,65,12,0.3)" },
    css:        { bg: "rgba(67,56,202,0.12)",   color: "#3730a3", border: "rgba(67,56,202,0.3)" },
    python:     { bg: "rgba(21,128,61,0.12)",   color: "#166534", border: "rgba(21,128,61,0.3)" },
    java:       { bg: "rgba(185,28,28,0.12)",   color: "#991b1b", border: "rgba(185,28,28,0.3)" },
    cpp:        { bg: "rgba(126,34,206,0.12)",  color: "#6b21a8", border: "rgba(126,34,206,0.3)" },
    json:       { bg: "rgba(180,83,9,0.12)",    color: "#92400e", border: "rgba(180,83,9,0.3)"  },
    markdown:   { bg: "rgba(15,118,110,0.12)",  color: "#0f766e", border: "rgba(15,118,110,0.3)" },
  };
  return (isDark ? dark : light)[lang] ?? (isDark ? dark.typescript : light.typescript);
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getThemeTokens(isDark: boolean) {
  return {
    bg:                  isDark ? "#0d1117"                    : "#eef1f7",
    sidebarBg:           isDark ? "#0a0f1e"                    : "#e2e8f4",
    headerBg:            isDark ? "rgba(10,15,30,0.97)"        : "rgba(226,232,244,0.97)",
    editorPanelBg:       isDark ? "rgba(13,17,23,0.95)"        : "#dde3ef",
    editorHeaderBg:      isDark ? "#0d1117"                    : "#d4dcea",
    text:                isDark ? "rgba(255,255,255,0.88)"     : "#0f172a",
    textMuted:           isDark ? "rgba(255,255,255,0.38)"     : "#64748b",
    border:              isDark ? "rgba(255,255,255,0.07)"     : "rgba(15,23,42,0.1)",
    snippetHover:        isDark ? "rgba(255,255,255,0.05)"     : "rgba(15,23,42,0.05)",
    snippetActive:       isDark ? "rgba(96,165,250,0.1)"       : "rgba(59,130,246,0.1)",
    snippetActiveBorder: isDark ? "rgba(96,165,250,0.3)"       : "rgba(59,130,246,0.35)",
    inputBg:             isDark ? "rgba(255,255,255,0.04)"     : "rgba(15,23,42,0.06)",
    inputBorder:         isDark ? "rgba(255,255,255,0.09)"     : "rgba(15,23,42,0.12)",
    tabActiveBg:         isDark ? "#0d1117"                    : "#d4dcea",
    aiPanelBg:           isDark ? "#0a0f1e"                    : "#e2e8f4",
    aiMsgBg:             isDark ? "rgba(255,255,255,0.03)"     : "rgba(15,23,42,0.04)",
    popupBg:             isDark ? "#111827"                    : "#f1f5f9",
    popupBorder:         isDark ? "rgba(255,255,255,0.1)"      : "rgba(15,23,42,0.12)",
  };
}