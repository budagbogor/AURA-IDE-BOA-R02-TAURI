import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import type { FileItem } from '@/types';
import { AURA_COLLECTIVE, DEVELOPER_TASK_PRESETS } from '@/utils/constants';

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  'target'
]);

const TEXT_FILE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'jsonc', 'css', 'scss', 'sass', 'less',
  'html', 'htm', 'md', 'mdx', 'txt', 'yml', 'yaml', 'toml', 'env', 'gitignore', 'npmrc',
  'sh', 'ps1', 'bat', 'cmd', 'rs', 'py', 'java', 'kt', 'go', 'c', 'cpp', 'h', 'hpp', 'cs',
  'php', 'rb', 'swift', 'sql', 'prisma', 'xml', 'svg', 'lock'
]);

const TEXT_ATTACHMENT_EXTENSIONS = new Set([
  'txt', 'md', 'mdx', 'json', 'jsonc', 'ts', 'tsx', 'js', 'jsx', 'css', 'scss', 'sass', 'less',
  'html', 'htm', 'yml', 'yaml', 'toml', 'env', 'gitignore', 'npmrc', 'sh', 'ps1', 'bat', 'cmd',
  'rs', 'py', 'java', 'kt', 'go', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'swift', 'sql',
  'prisma', 'xml', 'svg'
]);

export type ExplorerNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  fileId?: string;
  children?: ExplorerNode[];
};

export type WorkspaceHealthIssue = {
  severity: 'warning' | 'error';
  title: string;
  detail: string;
};

export type AiActivityEntry = {
  id: string;
  title: string;
  summary: string;
  files: string[];
  domains?: string[];
  suggestedCommands?: Array<{
    label: string;
    command: string;
    reason: string;
  }>;
  createdAt: number;
  status?: 'planning' | 'working' | 'done' | 'error';
  steps?: Array<{
    label: string;
    detail: string;
    status: 'planning' | 'working' | 'done' | 'error';
  }>;
};

export type AiGeneratedFile = {
  absolutePath: string;
  relativePath: string;
  name: string;
  content: string;
  language: string;
};

export type HeaderMenuKey = 'file' | 'edit' | 'view' | 'terminal' | 'git' | 'ai' | 'help';

export const AI_ACTIVITY_TAB_ID = '__aura_ai_activity__';
export const PREVIEW_TAB_ID = '__aura_preview__';

export const CODING_MODEL_PRIORITIES: Record<string, string[]> = {
  sumopod: ['glm-5-code', 'gpt-5-mini', 'gpt-5.1-codex'],
  openrouter: ['qwen/qwen3-coder:free', 'mistralai/devstral-small-2505:free', 'x-ai/grok-code-fast-1'],
  bytez: ['Qwen/Qwen2.5-Coder-32B-Instruct', 'deepseek-ai/DeepSeek-R1', 'google/gemini-2.5-pro'],
  puter: ['openrouter:qwen/qwen3-coder:free', 'openrouter:mistralai/devstral-small-2505:free', 'openrouter:anthropic/claude-sonnet-4.5'],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-thinking-exp', 'gemini-2.0-pro-exp-02-05'],
  ollama: ['qwen2.5-coder', 'deepseek-coder', 'codellama']
};

export const CODING_MODEL_LABELS: Record<string, string> = {
  'glm-5-code': 'Cheapest Coding',
  'gpt-5-mini': 'Balanced Dev',
  'gpt-5.1-codex': 'Best Coding',
  'qwen/qwen3-coder:free': 'Cheapest Coding',
  'mistralai/devstral-small-2505:free': 'Balanced Dev',
  'x-ai/grok-code-fast-1': 'Best Coding',
  'Qwen/Qwen2.5-Coder-32B-Instruct': 'Cheapest Coding',
  'deepseek-ai/DeepSeek-R1': 'Balanced Dev',
  'google/gemini-2.5-pro': 'Best Coding',
  'openrouter:qwen/qwen3-coder:free': 'Cheapest Coding',
  'openrouter:mistralai/devstral-small-2505:free': 'Balanced Dev',
  'openrouter:anthropic/claude-sonnet-4.5': 'Best Coding',
  'gemini-2.0-flash': 'Cheapest Coding',
  'gemini-2.0-flash-thinking-exp': 'Balanced Dev',
  'gemini-2.0-pro-exp-02-05': 'Best Coding',
  'qwen2.5-coder': 'Cheapest Coding',
  'deepseek-coder': 'Balanced Dev',
  'codellama': 'Best Coding'
};

export const PUTER_MODEL_FALLBACKS = [
  { id: 'openrouter:qwen/qwen3-coder:free', name: 'OpenRouter | Qwen 3 Coder (Free) via Puter.js' },
  { id: 'openrouter:mistralai/devstral-small-2505:free', name: 'OpenRouter | Devstral Small (Free) via Puter.js' },
  { id: 'openrouter:x-ai/grok-code-fast-1', name: 'OpenRouter | Grok Code Fast 1 via Puter.js' },
  { id: 'openrouter:anthropic/claude-sonnet-4.5', name: 'OpenRouter | Claude Sonnet 4.5 via Puter.js' },
  { id: 'openrouter:openai/gpt-4o-mini', name: 'OpenRouter | GPT-4o Mini via Puter.js' },
  { id: 'openrouter:meta-llama/llama-3.1-8b-instruct', name: 'OpenRouter | Llama 3.1 8B via Puter.js' }
];

export const SUMOPOD_MODEL_FALLBACKS = [
  { id: 'seed-2-0-lite-free', name: 'Seed 2.0 Lite Free', provider: 'byteplus', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'seed-2-0-mini', name: 'Seed 2.0 Mini', provider: 'byteplus', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'seed-2-0-mini-free', name: 'Seed 2.0 Mini Free', provider: 'byteplus', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'seed-2-0-pro', name: 'Seed 2.0 Pro', provider: 'byteplus', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'seed-2-0-pro-free', name: 'Seed 2.0 Pro Free', provider: 'byteplus', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'seed-2-0-lite', name: 'Seed 2.0 Lite', provider: 'openai', inputPrice: 0, outputPrice: 0, context: 256000 },
  { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', provider: 'openai', inputPrice: 0.02, outputPrice: 0, context: 8191 },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', inputPrice: 0.05, outputPrice: 0.4, context: 272000 },
  { id: 'gemini/gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'google', inputPrice: 0.07, outputPrice: 0.3, context: 1048576 },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai', inputPrice: 0.1, outputPrice: 0.4, context: 1047576 },
  { id: 'gemini/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', inputPrice: 0.1, outputPrice: 0.4, context: 1048576 },
  { id: 'gemini/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google', inputPrice: 0.1, outputPrice: 0.4, context: 1048576 },
  { id: 'glm-5', name: 'GLM 5', provider: 'z.ai', inputPrice: 0.1, outputPrice: 0.32, context: 200000 },
  { id: 'glm-5.1', name: 'GLM 5.1', provider: 'z.ai', inputPrice: 0.1, outputPrice: 0.32, context: 200000 },
  { id: 'glm-5-code', name: 'GLM 5 Code', provider: 'z.ai', inputPrice: 0.12, outputPrice: 0.5, context: 200000 },
  { id: 'glm-5-turbo', name: 'GLM 5 Turbo', provider: 'z.ai', inputPrice: 0.12, outputPrice: 0.4, context: 200000 },
  { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', provider: 'openai', inputPrice: 0.13, outputPrice: 0, context: 8191 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', inputPrice: 0.15, outputPrice: 0.6, context: 128000 },
  { id: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'openai', inputPrice: 0.25, outputPrice: 2, context: 272000 },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai', inputPrice: 0.25, outputPrice: 2, context: 272000 },
  { id: 'seed-1-8', name: 'Seed 1.8', provider: 'byteplus', inputPrice: 0.25, outputPrice: 2, context: 224000 },
  { id: 'deepseek-v3-2', name: 'DeepSeek V3.2', provider: 'byteplus', inputPrice: 0.28, outputPrice: 0.42, context: 96000 },
  { id: 'gemini/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', inputPrice: 0.3, outputPrice: 2.5, context: 1048576 },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', inputPrice: 0.4, outputPrice: 1.6, context: 1047576 },
  { id: 'gemini/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'google', inputPrice: 0.5, outputPrice: 3, context: 1048576 },
  { id: 'glm-4-7', name: 'GLM 4.7', provider: 'byteplus', inputPrice: 0.6, outputPrice: 2.2, context: 200000 },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'byteplus', inputPrice: 0.6, outputPrice: 2.5, context: 224000 },
  { id: 'kimi-k2-5-260127', name: 'Kimi K2.5 260127', provider: 'byteplus', inputPrice: 0.6, outputPrice: 3, context: 224000 },
  { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'byteplus', inputPrice: 0.6, outputPrice: 2.5, context: 224000 },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'anthropic', inputPrice: 1, outputPrice: 5, context: 200000 },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', inputPrice: 1.25, outputPrice: 10, context: 272000 },
  { id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai', inputPrice: 1.25, outputPrice: 10, context: 272000 },
  { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'openai', inputPrice: 1.25, outputPrice: 10, context: 272000 },
  { id: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', inputPrice: 1.25, outputPrice: 10, context: 1048576 },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'byteplus', inputPrice: 1.35, outputPrice: 5.4, context: 96000 },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai', inputPrice: 1.75, outputPrice: 14, context: 272000 },
  { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'openai', inputPrice: 1.75, outputPrice: 14, context: 272000 },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', inputPrice: 2, outputPrice: 8, context: 1047576 },
  { id: 'gemini/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'google', inputPrice: 2, outputPrice: 12, context: 1048576 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', inputPrice: 2.5, outputPrice: 10, context: 128000 },
  { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'openai', inputPrice: 10, outputPrice: 40, context: 0 }
];

export const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/\/+/g, '/');

export const getLanguageByExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'rs':
      return 'rust';
    case 'py':
      return 'python';
    default:
      return 'text';
  }
};

const shouldLoadFile = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower === '.env' || lower === '.gitignore') return true;
  const ext = lower.includes('.') ? lower.split('.').pop() || '' : '';
  return TEXT_FILE_EXTENSIONS.has(ext);
};

export const isTextAttachmentName = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower === '.env' || lower === '.gitignore') return true;
  const ext = lower.includes('.') ? lower.split('.').pop() || '' : '';
  return TEXT_ATTACHMENT_EXTENSIONS.has(ext);
};

export const shouldIgnorePath = (path: string) => {
  const normalized = normalizePath(path);
  return (
    normalized.includes('/src-tauri/target') ||
    Array.from(IGNORED_DIRECTORIES).some((dir) => normalized.includes(`/${dir}/`) || normalized.endsWith(`/${dir}`))
  );
};

export async function readWorkspaceFiles(rootPath: string) {
  const walk = async (dir: string): Promise<FileItem[]> => {
    const entries = await readDir(dir);
    const loaded: FileItem[] = [];

    for (const entry of entries) {
      if (!entry.name) continue;
      const entryPath = normalizePath(`${dir}/${entry.name}`);

      if (entry.isDirectory) {
        if (IGNORED_DIRECTORIES.has(entry.name) || shouldIgnorePath(entryPath)) {
          continue;
        }
        loaded.push(...await walk(entryPath));
        continue;
      }

      if (!entry.isFile || !shouldLoadFile(entry.name)) continue;

      try {
        const content = await readTextFile(entryPath);
        loaded.push({
          id: entryPath,
          path: entryPath,
          name: entry.name,
          content,
          language: getLanguageByExtension(entry.name),
          lastModified: Date.now()
        });
      } catch (error) {
        console.warn('[AURA] Skipping unreadable file:', entryPath, error);
      }
    }

    return loaded;
  };

  return walk(rootPath);
}

export async function readWorkspaceFolders(rootPath: string) {
  const folders = new Set<string>();

  const walk = async (dir: string): Promise<void> => {
    const entries = await readDir(dir);

    for (const entry of entries) {
      if (!entry.name || !entry.isDirectory) continue;
      const entryPath = normalizePath(`${dir}/${entry.name}`);
      folders.add(entryPath);

      if (entry.name === '.git' || entry.name === 'target' || entry.name === 'node_modules') {
        continue;
      }

      await walk(entryPath);
    }
  };

  await walk(rootPath);
  return Array.from(folders);
}

export const detectWorkspacePackageManager = (files: FileItem[]) => {
  const fileNames = files.map((file) => file.name.toLowerCase());

  if (fileNames.includes('pnpm-lock.yaml')) {
    return { label: 'pnpm', installCommand: 'pnpm install', devCommand: 'pnpm dev', buildCommand: 'pnpm build' };
  }
  if (fileNames.includes('yarn.lock')) {
    return { label: 'yarn', installCommand: 'yarn install', devCommand: 'yarn dev', buildCommand: 'yarn build' };
  }
  if (fileNames.includes('bun.lock') || fileNames.includes('bun.lockb')) {
    return { label: 'bun', installCommand: 'bun install', devCommand: 'bun run dev', buildCommand: 'bun run build' };
  }

  return { label: 'npm', installCommand: 'npm install', devCommand: 'npm run dev', buildCommand: 'npm run build' };
};

export const detectWorkspacePackageManagerAt = (
  files: FileItem[],
  rootPath?: string | null,
  packageRelativeRoot = ''
) => {
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const normalizedPackageRoot = normalizePath(packageRelativeRoot).replace(/^\/+|\/+$/g, '');
  const scopedFileNames = files
    .map((file) => getRelativeFilePath(file.path || file.id, normalizedRoot))
    .filter((relativePath) => {
      if (!normalizedPackageRoot) return !relativePath.includes('/');
      return relativePath.startsWith(`${normalizedPackageRoot}/`);
    })
    .map((relativePath) => relativePath.split('/').pop()?.toLowerCase() || '');

  if (scopedFileNames.includes('pnpm-lock.yaml')) {
    return {
      label: 'pnpm',
      installCommand: normalizedPackageRoot ? `pnpm --dir ${normalizedPackageRoot} install` : 'pnpm install',
      devCommand: normalizedPackageRoot ? `pnpm --dir ${normalizedPackageRoot} dev` : 'pnpm dev',
      buildCommand: normalizedPackageRoot ? `pnpm --dir ${normalizedPackageRoot} build` : 'pnpm build'
    };
  }
  if (scopedFileNames.includes('yarn.lock')) {
    return {
      label: 'yarn',
      installCommand: normalizedPackageRoot ? `yarn --cwd ${normalizedPackageRoot} install` : 'yarn install',
      devCommand: normalizedPackageRoot ? `yarn --cwd ${normalizedPackageRoot} dev` : 'yarn dev',
      buildCommand: normalizedPackageRoot ? `yarn --cwd ${normalizedPackageRoot} build` : 'yarn build'
    };
  }
  if (scopedFileNames.includes('bun.lock') || scopedFileNames.includes('bun.lockb')) {
    return {
      label: 'bun',
      installCommand: normalizedPackageRoot ? `bun --cwd ${normalizedPackageRoot} install` : 'bun install',
      devCommand: normalizedPackageRoot ? `bun --cwd ${normalizedPackageRoot} run dev` : 'bun run dev',
      buildCommand: normalizedPackageRoot ? `bun --cwd ${normalizedPackageRoot} run build` : 'bun run build'
    };
  }

  return {
    label: 'npm',
    installCommand: normalizedPackageRoot ? `npm --prefix ${normalizedPackageRoot} install` : 'npm install',
    devCommand: normalizedPackageRoot ? `npm --prefix ${normalizedPackageRoot} run dev` : 'npm run dev',
    buildCommand: normalizedPackageRoot ? `npm --prefix ${normalizedPackageRoot} run build` : 'npm run build'
  };
};

export const getTerminalStatusTone = (status?: 'idle' | 'running' | 'success' | 'failed') => {
  switch (status) {
    case 'running':
      return { dot: 'bg-amber-400', badge: 'border-amber-500/30 bg-amber-500/10 text-amber-200' };
    case 'success':
      return { dot: 'bg-emerald-400', badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' };
    case 'failed':
      return { dot: 'bg-red-400', badge: 'border-red-500/30 bg-red-500/10 text-red-200' };
    default:
      return { dot: 'bg-[#6f7785]', badge: 'border-white/8 bg-white/[0.03] text-[#8d95a3]' };
  }
};

export const getAiActivityTone = (status?: 'planning' | 'working' | 'done' | 'error') => {
  switch (status) {
    case 'working':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
    case 'done':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
    case 'error':
      return 'border-red-500/20 bg-red-500/10 text-red-200';
    default:
      return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  }
};

export const buildDeveloperPromptPrefix = (taskPresetId: string, selectedSkill: string) => {
  const preset = DEVELOPER_TASK_PRESETS.find((item) => item.id === taskPresetId);
  if (!preset) return '';
  const skill = AURA_COLLECTIVE.find((item) => item.name === selectedSkill || item.id === preset.agentId);
  const skillWorkflow = skill?.workflow?.map((item: string) => `- ${item}`).join('\n') || '';
  const skillChecklist = skill?.checklist?.map((item: string) => `- ${item}`).join('\n') || '';
  const taskChecklist = preset.executionChecklist?.map((item: string) => `- ${item}`).join('\n') || '';
  const antiPatterns = skill?.antiPatterns?.map((item: string) => `- ${item}`).join('\n') || '';

  return [
    `Developer Task Preset: ${preset.label}`,
    `Developer Skill: ${selectedSkill}`,
    `Task Focus: ${preset.description}`,
    `Execution Rules: ${preset.aiRules}`,
    `System Role: ${preset.systemInstruction}`,
    skill ? `Skill Role: ${skill.description}` : '',
    skillWorkflow ? `Skill Workflow:\n${skillWorkflow}` : '',
    taskChecklist ? `Task Execution Checklist:\n${taskChecklist}` : '',
    skillChecklist ? `Quality Checklist:\n${skillChecklist}` : '',
    antiPatterns ? `Avoid These Anti-Patterns:\n${antiPatterns}` : '',
    'Coding Output Rules:',
    '- Prioritaskan solusi yang benar-benar bisa dijalankan, bukan pseudo-code.',
    '- Jika membuat atau mengubah file, gunakan path file yang jelas.',
    '- Untuk UI/UX, hasil harus responsif, rapi, dan siap dipakai di project nyata.',
    '- Untuk bugfix, jelaskan akar masalah secara singkat lalu berikan patch final.',
    '- Untuk refactor/fullstack, jaga struktur file dan dependency tetap konsisten.'
  ].join('\n');
};

export const formatCompactPrice = (value?: number | null, fallbackLabel?: string) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value === 0) return 'free';
    return `$${value.toFixed(value < 0.001 ? 6 : value < 0.01 ? 4 : 2)}`;
  }
  return fallbackLabel || '';
};

export const formatModelDropdownLabel = (model: { name: string; meta?: string; badge?: string }) => {
  const parts = [model.name];
  if (model.meta) parts.push(model.meta);
  const label = parts.join(' | ');
  return model.badge ? `[${model.badge}] ${label}` : label;
};

export const detectWorkDomains = (prompt: string, activeFile: FileItem | null, files: FileItem[]) => {
  const signals = new Set<string>();
  const source = `${prompt}\n${activeFile?.path || activeFile?.name || ''}\n${files.map((file) => file.path || file.name).join('\n')}`.toLowerCase();

  if (/src\/|component|tsx|jsx|css|tailwind|responsive|layout|ui|ux|frontend|page|react/.test(source)) signals.add('frontend');
  if (/api|server|backend|route|controller|service|schema|database|sql|auth|endpoint/.test(source)) signals.add('backend');
  if (/tauri|src-tauri|rust|invoke|plugin-shell|plugin-fs|desktop/.test(source)) signals.add('tauri');
  if (/security|auth|token|secret|sanitize|escape|permission|owasp|csrf|xss/.test(source)) signals.add('security');
  if (/design system|token|typography|spacing|component library|theme|a11y|accessibility/.test(source)) signals.add('design-system');
  if (signals.size === 0) signals.add('frontend');
  return Array.from(signals);
};

export const getRelativeFilePath = (filePath: string, rootPath?: string | null) => {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  if (!normalizedRoot) return normalizedFilePath;
  if (!normalizedFilePath.startsWith(normalizedRoot)) return normalizedFilePath;
  return normalizedFilePath.slice(normalizedRoot.length).replace(/^\/+/, '') || normalizedFilePath;
};

export const inferPreferredWorkspaceTargets = (
  domains: string[],
  files: FileItem[],
  rootPath?: string | null,
  activeFile?: FileItem | null
) => {
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const existingFolders = new Set<string>();

  files.forEach((file) => {
    const normalized = normalizePath(file.path || file.id);
    const relative = normalizedRoot ? getRelativeFilePath(normalized, normalizedRoot) : normalized;
    const segments = relative.split('/').filter(Boolean);
    for (let index = 0; index < segments.length - 1; index += 1) {
      existingFolders.add(segments.slice(0, index + 1).join('/'));
    }
  });

  const domainFolders: Record<string, string[]> = {
    frontend: ['src/components', 'src/pages', 'src/app', 'src/routes', 'src', 'components', 'pages', 'client/src/components', 'client/src'],
    backend: ['src/api', 'src/server', 'src/services', 'src/lib', 'server', 'api', 'backend', 'client/src/api', 'src'],
    tauri: ['src-tauri/src', 'src-tauri/capabilities', 'src-tauri'],
    security: ['src/server', 'src/api', 'src/lib', 'server', 'api', 'src-tauri/src'],
    'design-system': ['src/components/ui', 'src/design-system', 'src/ui', 'src/components', 'components', 'ui', 'src']
  };

  const ranked = new Set<string>();
  const activeFileParent = activeFile?.path ? getRelativeFilePath(activeFile.path, normalizedRoot).split('/').slice(0, -1).join('/') : '';
  if (activeFileParent) ranked.add(activeFileParent);

  domains.forEach((domain) => {
    (domainFolders[domain] || []).forEach((folder) => {
      if (!folder) return;
      if (existingFolders.has(folder) || folder.startsWith('src-tauri') || folder.startsWith('src')) ranked.add(folder);
    });
  });

  if (ranked.size === 0) {
    if (existingFolders.has('src')) ranked.add('src');
    if (existingFolders.has('src/components')) ranked.add('src/components');
    if (existingFolders.has('src-tauri/src')) ranked.add('src-tauri/src');
  }

  return Array.from(ranked).filter(Boolean).slice(0, 6);
};

export const inferExecutionPlan = (domains: string[], preferredTargets: string[], prompt: string) => {
  const steps: string[] = ['Review request, active task preset, and workspace context before editing files.'];

  if (domains.includes('frontend')) {
    steps.push(`Create or update UI foundation in ${preferredTargets[0] || 'src/components'} before touching secondary files.`);
    steps.push('Connect page/component structure, props, and state flow so the UI is actually usable.');
    steps.push('Refine styles, responsiveness, and interaction polish after the structure is stable.');
  }
  if (domains.includes('backend')) {
    steps.push(`Implement API/service layer in ${preferredTargets.find((target) => /api|server|service/.test(target)) || preferredTargets[0] || 'src/api'} before wiring UI consumers.`);
    steps.push('Connect data flow, validation, and error handling after the backend shape is clear.');
  }
  if (domains.includes('tauri')) {
    steps.push(`Handle desktop/native integration in ${preferredTargets.find((target) => target.startsWith('src-tauri')) || 'src-tauri/src'} after app-level flow is defined.`);
  }
  if (domains.includes('design-system')) {
    steps.push('Normalize tokens, components, and visual language before duplicating UI patterns.');
  }
  if (domains.includes('security')) {
    steps.push('Review auth, sensitive flows, and unsafe patterns before finalizing implementation.');
  }

  if (/build|browser|localhost|npm run dev|preview|run/i.test(prompt)) {
    steps.push('Verify the resulting project can install, build, and run in the browser after code changes are prepared.');
  } else {
    steps.push('Do a quick implementation sanity check before marking the draft ready.');
  }

  return Array.from(new Set(steps)).slice(0, 6);
};

export const getWorkspacePackageManifest = (files: FileItem[], rootPath?: string | null) => {
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const packagePath = normalizedRoot ? `${normalizedRoot}/package.json` : 'package.json';
  const packageFile = files.find((file) => normalizePath(file.path || file.id) === packagePath);
  if (!packageFile?.content) return null;

  try {
    return JSON.parse(packageFile.content) as {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
  } catch {
    return null;
  }
};

export const getPrimaryWorkspacePackageTarget = (files: FileItem[], rootPath?: string | null) => {
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const readManifest = (relativePath: string) => {
    const absolutePath = normalizedRoot ? `${normalizedRoot}/${relativePath}` : relativePath;
    const packageFile = files.find((file) => normalizePath(file.path || file.id) === normalizePath(absolutePath));
    if (!packageFile?.content) return null;

    try {
      return JSON.parse(packageFile.content) as {
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
    } catch {
      return null;
    }
  };

  const summarize = (relativePath: string) => {
    const manifest = readManifest(relativePath);
    if (!manifest) return null;
    return {
      packageRoot: relativePath === 'package.json' ? '' : relativePath.replace(/\/package\.json$/i, ''),
      manifest,
      dependencyCount: Object.keys(manifest.dependencies || {}).length + Object.keys(manifest.devDependencies || {}).length,
      scriptCount: Object.keys(manifest.scripts || {}).length
    };
  };

  const rootSummary = summarize('package.json');
  const frontendSummary = summarize('frontend/package.json');
  const clientSummary = summarize('client/package.json');
  const nestedPreferred = [frontendSummary, clientSummary].find((entry) => entry && entry.dependencyCount > 0 && entry.scriptCount > 0);

  if (rootSummary && rootSummary.dependencyCount > 0) {
    return {
      packageRoot: rootSummary.packageRoot,
      manifest: rootSummary.manifest,
      isNested: false
    };
  }

  if (nestedPreferred) {
    return {
      packageRoot: nestedPreferred.packageRoot,
      manifest: nestedPreferred.manifest,
      isNested: true
    };
  }

  if (rootSummary) {
    return {
      packageRoot: rootSummary.packageRoot,
      manifest: rootSummary.manifest,
      isNested: false
    };
  }

  return null;
};

export const inferSuggestedVerificationCommands = (
  files: FileItem[],
  rootPath: string | null | undefined,
  domains: string[],
  packageManager: ReturnType<typeof detectWorkspacePackageManager>
) => {
  const packageTarget = getPrimaryWorkspacePackageTarget(files, rootPath);
  const manifest = packageTarget?.manifest || getWorkspacePackageManifest(files, rootPath);
  if (!manifest) return [];

  const packageRoot = packageTarget?.packageRoot || '';
  const effectivePackageManager = detectWorkspacePackageManagerAt(files, rootPath, packageRoot) || packageManager;
  const hasNodeModules = files.some((file) => {
    const relativePath = getRelativeFilePath(file.path || file.id, rootPath);
    return packageRoot
      ? relativePath.startsWith(`${packageRoot}/`) && relativePath.includes('/node_modules/')
      : relativePath.includes('/node_modules/');
  });
  const scripts = manifest.scripts || {};
  const commands: Array<{ label: string; command: string; reason: string }> = [];
  const hasDependencies = Object.keys(manifest.dependencies || {}).length > 0 || Object.keys(manifest.devDependencies || {}).length > 0;

  if (hasDependencies && !hasNodeModules) {
    commands.push({ label: 'Install', command: effectivePackageManager.installCommand, reason: 'Pasang dependency dulu agar draft bisa diverifikasi.' });
  }
  if (scripts.build) {
    commands.push({ label: 'Build', command: effectivePackageManager.buildCommand, reason: 'Cek apakah perubahan berhasil dikompilasi tanpa error.' });
  }
  if (scripts.dev) {
    commands.push({
      label: packageRoot ? `Run Dev (${packageRoot})` : 'Run Dev',
      command: effectivePackageManager.devCommand,
      reason: domains.includes('frontend') || domains.includes('design-system')
        ? 'Lihat hasil UI langsung di browser.'
        : 'Jalankan workspace untuk verifikasi perilaku runtime.'
    });
  }
  if (scripts.lint) {
    const lintCommand =
      effectivePackageManager.label === 'pnpm' ? (packageRoot ? `pnpm --dir ${packageRoot} lint` : 'pnpm lint') :
      effectivePackageManager.label === 'yarn' ? (packageRoot ? `yarn --cwd ${packageRoot} lint` : 'yarn lint') :
      effectivePackageManager.label === 'bun' ? (packageRoot ? `bun --cwd ${packageRoot} run lint` : 'bun run lint') :
      (packageRoot ? `npm --prefix ${packageRoot} run lint` : 'npm run lint');
    commands.push({ label: 'Lint', command: lintCommand, reason: 'Validasi kualitas dasar dan error statis setelah draft siap.' });
  }

  return commands.slice(0, 4);
};

export const rewriteCommandForPrimaryWorkspaceApp = (
  command: string,
  files: FileItem[],
  rootPath?: string | null
) => {
  const trimmed = command.trim();
  if (!trimmed) return trimmed;

  const normalized = trimmed.toLowerCase();
  const packageTarget = getPrimaryWorkspacePackageTarget(files, rootPath);
  if (!packageTarget?.packageRoot) return trimmed;

  const packageRoot = packageTarget.packageRoot;
  const manifest = packageTarget.manifest || {};
  const scripts = manifest.scripts || {};
  const packageManager = detectWorkspacePackageManagerAt(files, rootPath, packageRoot);

  const alreadyScoped = /\s(--prefix|--cwd|--dir)\s/i.test(trimmed);
  if (alreadyScoped) return trimmed;

  const isInstall = /^(npm|pnpm|yarn|bun)\s+(install|i)\b/i.test(trimmed);
  const isDev = /^(npm\s+run\s+dev|pnpm\s+dev|yarn\s+dev|bun\s+run\s+dev)\b/i.test(trimmed);
  const isBuild = /^(npm\s+run\s+build|pnpm\s+build|yarn\s+build|bun\s+run\s+build)\b/i.test(trimmed);
  const isLint = /^(npm\s+run\s+lint|pnpm\s+lint|yarn\s+lint|bun\s+run\s+lint)\b/i.test(trimmed);

  if (isInstall) return packageManager.installCommand;
  if (isDev && scripts.dev) return packageManager.devCommand;
  if (isBuild && scripts.build) return packageManager.buildCommand;
  if (isLint && scripts.lint) {
    if (packageManager.label === 'pnpm') return `pnpm --dir ${packageRoot} lint`;
    if (packageManager.label === 'yarn') return `yarn --cwd ${packageRoot} lint`;
    if (packageManager.label === 'bun') return `bun --cwd ${packageRoot} run lint`;
    return `npm --prefix ${packageRoot} run lint`;
  }

  return trimmed;
};

export const resolveAiCandidatePath = (
  candidatePath: string,
  preferredTargets: string[],
  normalizedRoot: string,
  files: FileItem[] = [],
  activeFile?: FileItem | null
) => {
  const cleanedCandidate = candidatePath.replace(/^\/+/, '');
  if (/^[A-Za-z]:[\\/]/.test(candidatePath)) return normalizePath(candidatePath);
  const normalizedCandidate = normalizePath(cleanedCandidate);
  const existingExactMatch = files.find((file) => normalizePath(getRelativeFilePath(file.path || file.id, normalizedRoot)) === normalizedCandidate);
  if (existingExactMatch) {
    return normalizePath(existingExactMatch.path || existingExactMatch.id);
  }
  if (cleanedCandidate.includes('/')) {
    const basename = cleanedCandidate.split('/').pop()?.toLowerCase() || '';
    const candidateDir = normalizePath(cleanedCandidate.split('/').slice(0, -1).join('/'));
    const suffixMatches = files.filter((file) => {
      const filePath = normalizePath(file.path || file.id);
      return filePath.toLowerCase().endsWith(`/${normalizedCandidate.toLowerCase()}`);
    });

    if (suffixMatches.length === 1) {
      return normalizePath(suffixMatches[0].path || suffixMatches[0].id);
    }

    if (candidateDir) {
      const preferredMatch = preferredTargets.find((target) => {
        const normalizedTarget = normalizePath(target).toLowerCase();
        return normalizedTarget === candidateDir.toLowerCase() || normalizedTarget.endsWith(`/${candidateDir.toLowerCase()}`);
      });
      if (preferredMatch) {
        return normalizedRoot
          ? normalizePath(`${normalizedRoot}/${preferredMatch}/${cleanedCandidate.split('/').pop()}`)
          : normalizePath(`${preferredMatch}/${cleanedCandidate.split('/').pop()}`);
      }

      const directorySuffixMatches = files.filter((file) => {
        const filePath = normalizePath(file.path || file.id);
        const fileDir = filePath.split('/').slice(0, -1).join('/').toLowerCase();
        return file.name?.toLowerCase() === basename && (fileDir === candidateDir.toLowerCase() || fileDir.endsWith(`/${candidateDir.toLowerCase()}`));
      });
      if (directorySuffixMatches.length === 1) {
        return normalizePath(directorySuffixMatches[0].path || directorySuffixMatches[0].id);
      }
    }

    return normalizedRoot ? normalizePath(`${normalizedRoot}/${cleanedCandidate}`) : normalizePath(cleanedCandidate);
  }

  const normalizedCandidateName = cleanedCandidate.toLowerCase();
  const basenameMatches = files.filter((file) => (file.name || '').toLowerCase() === normalizedCandidateName);

  if (activeFile?.name?.toLowerCase() === normalizedCandidateName && activeFile.path) {
    return normalizePath(activeFile.path);
  }

  if (basenameMatches.length === 1) {
    return normalizePath(basenameMatches[0].path || basenameMatches[0].id);
  }

  if (preferredTargets.length > 0) {
    return normalizedRoot
      ? normalizePath(`${normalizedRoot}/${preferredTargets[0]}/${cleanedCandidate}`)
      : normalizePath(`${preferredTargets[0]}/${cleanedCandidate}`);
  }
  return normalizedRoot ? normalizePath(`${normalizedRoot}/${cleanedCandidate}`) : normalizePath(cleanedCandidate);
};

const compareExplorerNodes = (a: ExplorerNode, b: ExplorerNode) => {
  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
};

export const buildExplorerTree = (files: FileItem[], folders: string[], rootPath?: string | null) => {
  const root: ExplorerNode = { id: 'root', name: 'root', type: 'folder', path: rootPath || '', children: [] };

  folders.forEach((folderPath) => {
    const relativePath = getRelativeFilePath(folderPath, rootPath);
    const segments = relativePath.split('/').filter(Boolean);
    let current = root;
    segments.forEach((segment, index) => {
      if (!current.children) current.children = [];
      const currentFolderPath = segments.slice(0, index + 1).join('/');
      let next = current.children.find((child) => child.type === 'folder' && child.path === currentFolderPath);
      if (!next) {
        next = { id: `folder:${currentFolderPath}`, name: segment, type: 'folder', path: currentFolderPath, children: [] };
        current.children.push(next);
      }
      current = next;
    });
  });

  files.forEach((file) => {
    const relativePath = getRelativeFilePath(file.path || file.id, rootPath);
    const segments = relativePath.split('/').filter(Boolean);
    let current = root;
    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;
      if (!current.children) current.children = [];
      if (isLeaf) {
        current.children.push({ id: file.id, name: file.name, type: 'file', path: file.path || file.id, fileId: file.id });
        return;
      }
      const folderPath = segments.slice(0, index + 1).join('/');
      let next = current.children.find((child) => child.type === 'folder' && child.path === folderPath);
      if (!next) {
        next = { id: `folder:${folderPath}`, name: segment, type: 'folder', path: folderPath, children: [] };
        current.children.push(next);
      }
      current = next;
    });
  });

  const sortNodes = (nodes: ExplorerNode[]) => {
    nodes.sort(compareExplorerNodes);
    nodes.forEach((node) => { if (node.children) sortNodes(node.children); });
  };

  sortNodes(root.children || []);
  return root.children || [];
};

export const analyzeWorkspaceHealth = (files: FileItem[], rootPath?: string | null) => {
  const issues: WorkspaceHealthIssue[] = [];
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const byPath = new Map(files.map((file) => [normalizePath(file.path || file.id), file]));
  const rootPackagePath = normalizedRoot ? `${normalizedRoot}/package.json` : 'package.json';
  const clientPackagePath = normalizedRoot ? `${normalizedRoot}/client/package.json` : 'client/package.json';
  const clientSrcPath = normalizedRoot ? `${normalizedRoot}/client/src` : 'client/src';

  const rootPackage = byPath.get(rootPackagePath);
  const clientPackage = byPath.get(clientPackagePath);
  const hasClientSource = files.some((file) => {
    const target = normalizePath(file.path || file.id);
    return target.includes(`${clientSrcPath}/`) || target === clientSrcPath;
  });

  if (rootPackage) {
    try {
      const manifest = JSON.parse(rootPackage.content) as {
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const dependencyCount = Object.keys(manifest.dependencies || {}).length + Object.keys(manifest.devDependencies || {}).length;
      const scripts = manifest.scripts || {};
      const usesVite = Object.values(scripts).some((script) => /\bvite\b/i.test(script));
      const hasViteDependency = Boolean(manifest.dependencies?.vite || manifest.devDependencies?.vite);
      const frontendPackagePath = normalizedRoot ? `${normalizedRoot}/frontend/package.json` : 'frontend/package.json';
      const frontendPackage = byPath.get(frontendPackagePath);
      const hasNestedAppManifest = Boolean(clientPackage || frontendPackage);

      if (dependencyCount === 0 && Object.keys(scripts).length > 0 && !hasNestedAppManifest) {
        issues.push({
          severity: 'warning',
          title: 'Package Root Masih Kosong',
          detail: 'package.json root punya scripts, tetapi belum punya dependencies/devDependencies. npm install akan terlihat sukses, tapi tidak akan menyiapkan tool build apa pun.'
        });
      }
      if (dependencyCount === 0 && Object.keys(scripts).length > 0 && hasNestedAppManifest) {
        issues.push({
          severity: 'warning',
          title: 'Struktur Project Campuran',
          detail: 'Root package.json terlihat seperti shell, tetapi app utama ada di folder frontend/client. AURA akan mengarahkan verifikasi ke app yang paling lengkap, tetapi struktur ini sebaiknya disederhanakan.'
        });
      }
      if (usesVite && !hasViteDependency) {
        issues.push({
          severity: 'error',
          title: 'Script Memanggil Vite Tanpa Dependency',
          detail: 'Script dev/build di root memanggil Vite, tetapi package.json aktif tidak mendeklarasikan `vite`, jadi npm run dev/build akan gagal.'
        });
      }
    } catch {
      issues.push({
        severity: 'warning',
        title: 'package.json Tidak Bisa Dibaca',
        detail: 'AURA menemukan package.json root, tetapi kontennya tidak valid untuk dianalisis.'
      });
    }
  }

  if (hasClientSource && !clientPackage) {
    issues.push({
      severity: 'warning',
      title: 'Frontend Terlihat Terpisah',
      detail: 'Ditemukan folder client/src, tetapi tidak ada client/package.json. Ini tanda struktur proyek belum selesai atau frontend belum diinisialisasi penuh.'
    });
  }

  return issues;
};

const extractLastMatch = (source: string, pattern: RegExp) => {
  const matches = Array.from(source.matchAll(pattern));
  const last = matches.at(-1);
  return last?.[1] ? last[1].replace(/^["'`]|["'`]$/g, '').trim() : '';
};

const sanitizeAiCandidatePath = (value: string) => {
  const trimmed = value
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/^[(*\s]+|[)*,\s:;]+$/g, '')
    .replace(/^file\s*[:=]\s*/i, '')
    .replace(/^path\s*[:=]\s*/i, '')
    .replace(/^filename\s*[:=]\s*/i, '')
    .replace(/^\/+/, '');

  const withoutInlineComment = trimmed
    .replace(/\*\/.*$/g, '')
    .replace(/\s+#.*$/g, '')
    .replace(/[<>:"|?*]/g, '');

  return withoutInlineComment.replace(/\\/g, '/').trim();
};

const extractFilePathFromFenceInfo = (info: string, preface: string) => {
  const explicitPatterns = [
    /(?:file|path|filename)\s*[:=]\s*([^\s`]+)/gi,
    /([A-Za-z0-9_.-]+\/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)/g,
    /([A-Za-z0-9_.-]+\.[A-Za-z0-9]+)/g
  ];

  const prefaceLines = preface
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-6)
    .reverse();

  for (const source of [info, ...prefaceLines]) {
    for (const pattern of explicitPatterns) {
      const candidate = extractLastMatch(source, pattern);
      if (candidate) {
        const sanitized = sanitizeAiCandidatePath(candidate);
        if (sanitized) {
          return sanitized;
        }
      }
    }
  }

  return '';
};

export const collectParentFolderPaths = (absolutePath: string, rootPath?: string | null) => {
  if (!rootPath) return [];
  const normalizedRoot = normalizePath(rootPath);
  const relative = getRelativeFilePath(absolutePath, normalizedRoot);
  const segments = relative.split('/').filter(Boolean);
  const folders: string[] = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    folders.push(normalizePath(`${normalizedRoot}/${segments.slice(0, index + 1).join('/')}`));
  }
  return folders;
};

const SCRIPT_EXTENSIONS = new Set(['ts', 'tsx', 'js', 'jsx']);

const getExtension = (filePath: string) => filePath.split('.').pop()?.toLowerCase() || '';

const getFileDirectory = (relativePath: string) => {
  const normalized = normalizePath(relativePath);
  const parts = normalized.split('/').filter(Boolean);
  parts.pop();
  return parts.join('/');
};

const resolveRelativeImportTarget = (fromRelativePath: string, importPath: string) => {
  const baseDir = getFileDirectory(fromRelativePath);
  const baseParts = baseDir ? baseDir.split('/').filter(Boolean) : [];
  const importParts = importPath.split('/').filter(Boolean);
  const resolvedParts = [...baseParts];

  importParts.forEach((part) => {
    if (part === '.') return;
    if (part === '..') {
      resolvedParts.pop();
      return;
    }
    resolvedParts.push(part);
  });

  return normalizePath(resolvedParts.join('/'));
};

const buildRelativeImportPath = (fromRelativePath: string, toRelativePath: string) => {
  const fromDirParts = getFileDirectory(fromRelativePath).split('/').filter(Boolean);
  const toParts = normalizePath(toRelativePath).split('/').filter(Boolean);

  while (fromDirParts.length > 0 && toParts.length > 0 && fromDirParts[0] === toParts[0]) {
    fromDirParts.shift();
    toParts.shift();
  }

  const backtrack = new Array(fromDirParts.length).fill('..');
  const combined = [...backtrack, ...toParts].join('/');
  return combined.startsWith('.') ? combined : `./${combined || ''}`.replace(/\/+$/, '');
};

const stripKnownScriptExtension = (value: string) => value.replace(/\.(tsx|ts|jsx|js)$/i, '');

const resolveMissingRelativeModuleImport = (
  fromRelativePath: string,
  importPath: string,
  knownRelativePaths: Set<string>
) => {
  const resolvedTarget = resolveRelativeImportTarget(fromRelativePath, importPath);
  const normalizedResolved = normalizePath(resolvedTarget);
  const directCandidates = [
    normalizedResolved,
    `${normalizedResolved}.tsx`,
    `${normalizedResolved}.ts`,
    `${normalizedResolved}.jsx`,
    `${normalizedResolved}.js`,
    `${normalizedResolved}/index.tsx`,
    `${normalizedResolved}/index.ts`,
    `${normalizedResolved}/index.jsx`,
    `${normalizedResolved}/index.js`
  ];

  const exactMatch = directCandidates.find((candidate) => knownRelativePaths.has(candidate));
  if (exactMatch) {
    return buildRelativeImportPath(fromRelativePath, exactMatch);
  }

  const requestedBase = stripKnownScriptExtension(normalizedResolved).toLowerCase();
  const baseName = requestedBase.split('/').pop() || '';
  if (!baseName) return importPath;

  const basenameMatches = Array.from(knownRelativePaths).filter((candidate) => {
    const normalizedCandidate = stripKnownScriptExtension(normalizePath(candidate)).toLowerCase();
    return normalizedCandidate.endsWith(`/${baseName}`) || normalizedCandidate === baseName;
  });

  if (basenameMatches.length === 1) {
    return buildRelativeImportPath(fromRelativePath, basenameMatches[0]);
  }

  const currentDir = getFileDirectory(fromRelativePath).toLowerCase();
  const sameTreeMatch = basenameMatches.find((candidate) => {
    const candidateDir = getFileDirectory(candidate).toLowerCase();
    return currentDir && (candidateDir === currentDir || candidateDir.startsWith(`${currentDir}/`));
  });

  if (sameTreeMatch) {
    return buildRelativeImportPath(fromRelativePath, sameTreeMatch);
  }

  return importPath;
};

export const normalizeGeneratedFrontendFiles = (
  generatedFiles: AiGeneratedFile[],
  workspaceFiles: FileItem[] = [],
  rootPath?: string | null
) => {
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const workspaceRelativePaths = new Set(
    workspaceFiles.map((file) => getRelativeFilePath(file.path || file.id, normalizedRoot)).map(normalizePath)
  );
  const generatedRelativePaths = new Set(generatedFiles.map((file) => normalizePath(file.relativePath)));
  const knownRelativePaths = new Set([...workspaceRelativePaths, ...generatedRelativePaths]);

  return generatedFiles.map((generatedFile) => {
    const extension = getExtension(generatedFile.relativePath);
    if (!SCRIPT_EXTENSIONS.has(extension)) {
      return generatedFile;
    }

    const currentDir = getFileDirectory(generatedFile.relativePath);
    const sameDirCandidates = ['style.css', 'styles.css', 'index.css', 'app.css', 'App.css']
      .map((name) => normalizePath(currentDir ? `${currentDir}/${name}` : name))
      .filter((candidate, index, array) => array.indexOf(candidate) === index);

    let nextContent = generatedFile.content.replace(
      /(import\s+["'])(\.[^"']+\.css)(["'];?)/g,
      (_fullMatch, prefix: string, importPath: string, suffix: string) => {
        const resolvedTarget = resolveRelativeImportTarget(generatedFile.relativePath, importPath);
        if (knownRelativePaths.has(resolvedTarget)) {
          return `${prefix}${importPath}${suffix}`;
        }

        const fallbackTarget = sameDirCandidates.find((candidate) => knownRelativePaths.has(candidate));
        if (!fallbackTarget) {
          return `${prefix}${importPath}${suffix}`;
        }

        const normalizedImport = buildRelativeImportPath(generatedFile.relativePath, fallbackTarget);
        return `${prefix}${normalizedImport}${suffix}`;
      }
    );

    nextContent = nextContent.replace(
      /(import\s+[^'"]*?from\s+["'])(\.[^"']+)(["'])/g,
      (_fullMatch, prefix: string, importPath: string, suffix: string) => {
        if (importPath.endsWith('.css')) {
          return `${prefix}${importPath}${suffix}`;
        }
        const normalizedImport = resolveMissingRelativeModuleImport(
          generatedFile.relativePath,
          importPath,
          knownRelativePaths
        );
        return `${prefix}${normalizedImport}${suffix}`;
      }
    );

    return nextContent === generatedFile.content
      ? generatedFile
      : {
          ...generatedFile,
          content: nextContent
        };
  });
};

export const extractAiGeneratedFiles = (
  responseText: string,
  activeFile: FileItem | null,
  rootPath?: string | null,
  preferredTargets: string[] = [],
  files: FileItem[] = []
): AiGeneratedFile[] => {
  const codeFenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  const found = new Map<string, AiGeneratedFile>();
  const normalizedRoot = rootPath ? normalizePath(rootPath) : '';
  const matches = Array.from(responseText.matchAll(codeFenceRegex));

  matches.forEach((match) => {
    const info = (match[1] || '').trim();
    const content = (match[2] || '').replace(/\s+$/, '');
    if (!content.trim()) return;
    const preface = responseText.slice(Math.max(0, (match.index || 0) - 180), match.index || 0);
    let candidatePath = extractFilePathFromFenceInfo(info, preface);
    if (!candidatePath && matches.length === 1 && activeFile?.path) candidatePath = activeFile.path;
    if (!candidatePath) return;

    const absolutePath = resolveAiCandidatePath(candidatePath, preferredTargets, normalizedRoot, files, activeFile);
    const name = absolutePath.split('/').pop() || candidatePath;
    found.set(absolutePath, {
      absolutePath,
      relativePath: normalizedRoot ? getRelativeFilePath(absolutePath, normalizedRoot) : absolutePath,
      name,
      content,
      language: getLanguageByExtension(name)
    });
  });

  return normalizeGeneratedFrontendFiles(Array.from(found.values()), files, rootPath);
};
