export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  path?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TerminalSession {
  id: string;
  name: string;
  output: string[];
}

export interface CodeProblem {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
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