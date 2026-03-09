import { TerminalLogo } from "./TerminalLogo";

interface Props {
  isDark: boolean;
}

export function CodebaseLogo({ isDark }: Props) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <TerminalLogo />
        <span style={{
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: "-0.01em",
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
          color: isDark ? "#ffffff" : "#0f172a",
        }}>
          Code<span style={{ color: "#3b82f6", fontWeight: 700 }}>Canvas</span>
        </span>
      </div>
    </>
  );
}