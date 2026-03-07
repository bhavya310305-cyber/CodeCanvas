export interface Snippet {
  _id: string;       
  title: string;
  language: string;
  code: string;
  createdAt: string;  
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface ThemeTokens {
  bg: string;
  sidebarBg: string;
  headerBg: string;
  editorPanelBg: string;
  editorHeaderBg: string;
  text: string;
  textMuted: string;
  border: string;
  snippetHover: string;
  snippetActive: string;
  snippetActiveBorder: string;
  inputBg: string;
  inputBorder: string;
  tabActiveBg: string;
  aiPanelBg: string;
  aiMsgBg: string;
  popupBg: string;
  popupBorder: string;
}