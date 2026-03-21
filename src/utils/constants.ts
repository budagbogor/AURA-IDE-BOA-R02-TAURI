export const FREE_MODELS = [
  { id: 'auto-free', name: 'Smart Auto-Select (Free)' },
  { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (Free)' },
  { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (Free)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B (Free)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  { id: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 Llama 70B (Free)' },
];

export const BYTEZ_MODELS = [
  { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder 32B' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B' },
];

export const SUMOPOD_MODELS = [
  { id: 'Llama-3-8B-Instruct', name: 'Llama 3 8B Instruct' },
  { id: 'Mistral-7B-Instruct-v0.2', name: 'Mistral 7B Instruct' }
];

export const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'bytez', name: 'Bytez' },
  { id: 'sumopod', name: 'SumoPod' }
];

export const GEMINI_MODELS = [
  { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro' },
  { id: 'gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Flash Thinking' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
];

export const SUPER_CLAUDE_SKILLS = [
  {
    name: "Architect",
    description: "Focuses on high-level system design, patterns, and scalability.",
    instruction: "You are an expert Software Architect. Your goal is to design robust, scalable, and maintainable systems. Focus on design patterns, architectural principles (SOLID, DRY, KISS), and long-term technical debt reduction."
  },
  {
    name: "Security Auditor",
    description: "Specializes in finding vulnerabilities and ensuring best security practices.",
    instruction: "You are a Senior Security Engineer. Analyze the code for security vulnerabilities (OWASP Top 10), insecure data handling, and potential exploits. Suggest hardening measures and secure coding practices."
  },
  {
    name: "Clean Coder",
    description: "Focuses on readability, naming, and simplicity.",
    instruction: "You are a Clean Code advocate. Focus on readability, naming conventions, and simplicity. Ensure the code follows best practices for the specific language and framework used."
  },
  {
    name: "Bug Hunter",
    description: "Expert at finding edge cases and logical errors.",
    instruction: "You are a master Bug Hunter. Your task is to find logical errors, edge cases, and potential runtime crashes. Think like a tester and try to break the code."
  }
];

export const SUPER_CLAUDE_COMMANDS = [
  {
    command: "/plan",
    description: "Create a detailed implementation plan before writing code.",
    instruction: "Before writing any code, create a step-by-step implementation plan. Break down the task into small, manageable units."
  },
  {
    command: "/review",
    description: "Perform a deep code review of the current file.",
    instruction: "Perform a comprehensive code review. Look for bugs, style issues, and potential improvements. Provide constructive feedback."
  },
  {
    command: "/test",
    description: "Generate unit tests for the current code.",
    instruction: "Generate comprehensive unit tests for the provided code. Cover edge cases and ensure high test coverage."
  },
  {
    command: "/refactor",
    description: "Suggest refactoring for better structure and readability.",
    instruction: "Suggest ways to refactor the code for better structure, readability, and maintainability without changing its behavior."
  }
];

export const MCP_TEMPLATES = [
  {
    name: "github",
    label: "GitHub Access (Official)",
    type: "stdio",
    commandTemplate: "npx -y @modelcontextprotocol/server-github",
    requirements: [
      { key: "GITHUB_PERSONAL_ACCESS_TOKEN", label: "GitHub PAT", placeholder: "ghp_xxxxxxxxxxxx", type: "env" }
    ]
  },
  {
    name: "sqlite",
    label: "SQLite Explorer (Official)",
    type: "stdio",
    commandTemplate: "npx -y @modelcontextprotocol/server-sqlite {{DB_PATH}}",
    requirements: [
      { key: "DB_PATH", label: "Database Path", placeholder: "/path/to/database.db", type: "arg" }
    ]
  },
  {
    name: "postgres",
    label: "PostgreSQL Explorer (Official)",
    type: "stdio",
    commandTemplate: "npx -y @modelcontextprotocol/server-postgres {{DB_URL}}",
    requirements: [
      { key: "DB_URL", label: "Connection URL", placeholder: "postgresql://user:pass@localhost/db", type: "arg" }
    ]
  },
  {
    name: "filesystem",
    label: "File System (Official)",
    type: "stdio",
    commandTemplate: "npx -y @modelcontextprotocol/server-filesystem {{ALLOWED_DIR}}",
    requirements: [
      { key: "ALLOWED_DIR", label: "Allowed Directory", placeholder: "C:/path/or/workspace", type: "arg" }
    ]
  }
];

