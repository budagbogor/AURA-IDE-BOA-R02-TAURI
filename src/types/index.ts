export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  path?: string;
  lastModified?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  output: string[];
  isRunning?: boolean;
  currentCommand?: string;
  cwd?: string;
  commandHistory?: string[];
  historyIndex?: number;
  processStatus?: 'idle' | 'running' | 'success' | 'failed';
  lastExitCode?: number | null;
}

export interface CodeProblem {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  path?: string;
}

export interface StagingFile {
  path: string;
  originalContent: string;
  newContent: string;
  existedBefore?: boolean;
  action: 'create_or_modify' | 'delete';
  status: 'pending' | 'accepted' | 'rejected';
}

export interface AttachedFile {
  name: string;
  type: string;
  data: string;
  content?: string;
}

export interface McpServer {
  name: string;
  url: string;
  type: 'sse' | 'stdio';
  connected: boolean;
  tools: any[];
  env?: Record<string, string>;
}

export interface McpTemplateArg {
  key: string;
  label: string;
  placeholder: string;
  type: 'env' | 'arg';
}

export interface McpTemplate {
  name: string;
  label: string;
  type: 'sse' | 'stdio';
  commandTemplate: string;
  requirements: McpTemplateArg[];
}

export type SidebarTab = 'files' | 'search' | 'git' | 'ai' | 'github' | 'settings' | 'database' | 'auditor';
export type BottomTab = 'terminal' | 'problems' | 'output' | 'debug';
export type LayoutMode = 'classic' | 'modern';
export type AiProvider = 'gemini' | 'openrouter' | 'bytez' | 'sumopod' | 'puter' | 'ollama';
export type VisualReviewProvider = 'same' | AiProvider;
