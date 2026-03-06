import { Snippet } from "./types";

export const sampleSnippets: Snippet[] = [
  {
    id: "1", title: "Debounce Function", language: "typescript",
    code: `function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "2", title: "Responsive Grid Layout", language: "html",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
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
    id: "3", title: "useLocalStorage Hook", language: "typescript",
    code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  return [storedValue, setStoredValue] as const;
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4", title: "Fetch Wrapper", language: "javascript",
    code: `const api_example = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "5", title: "CSS Animation Keyframes", language: "css",
    code: `@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

export const langColors: Record<string, string> = {
  typescript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  javascript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  html:       "bg-orange-500/20 text-orange-400 border-orange-500/30",
  css:        "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  python:     "bg-green-500/20 text-green-400 border-green-500/30",
};

export const langDotClass: Record<string, string> = {
  typescript: "bg-blue-400",
  javascript: "bg-yellow-400",
  html:       "bg-orange-400",
  css:        "bg-indigo-400",
  python:     "bg-green-400",
};