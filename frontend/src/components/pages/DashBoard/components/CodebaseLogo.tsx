import { TerminalLogo } from "./TerminalLogo";

interface Props {
  isDark: boolean;
}

export function CodebaseLogo({ isDark }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <TerminalLogo />
      <span style={{
        fontWeight: 800, fontSize: 16.5,
        letterSpacing: "0.05em",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: isDark ? "#ffffff" : "#0f172a",
      }}>
        Code<span style={{ color: "#3b82f6" }}>Canvas</span>
      </span>
    </div>
  );
}