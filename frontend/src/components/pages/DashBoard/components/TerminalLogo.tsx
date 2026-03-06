export function TerminalLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="#0d1117" />
      <rect width="32" height="32" rx="8" fill="url(#glassGrad)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5"
        stroke="rgba(59,130,246,0.35)" strokeWidth="1" />
      <defs>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="32" y2="32"
          gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>
        <filter id="blueGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="underscoreGlow" x="-60%" y="-80%" width="220%" height="360%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M7 12.5L12 16L7 19.5" stroke="#3b82f6" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#blueGlow)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875"
        fill="#3b82f6" filter="url(#underscoreGlow)" />
      <rect x="15" y="19" width="10" height="1.75" rx="0.875" fill="#60a5fa" />
    </svg>
  );
}