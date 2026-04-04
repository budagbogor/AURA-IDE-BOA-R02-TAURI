import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { terminalEngine } from '../core/terminal-engine';
import type { CodeProblem } from '../types';

type TerminalSuggestion = {
  command: string;
  description: string;
};

type TerminalPreset = {
  label: string;
  command: string;
  description: string;
};

const BASE_TERMINAL_SUGGESTIONS: TerminalSuggestion[] = [
  { command: 'npm install', description: 'Install project dependencies' },
  { command: 'npm run dev', description: 'Start web development server' },
  { command: 'npm run build', description: 'Build frontend production bundle' },
  { command: 'npm run lint', description: 'Run TypeScript validation' },
  { command: 'npm run dev:tauri', description: 'Start Tauri desktop development mode' },
  { command: 'npm run build:tauri', description: 'Build Windows desktop installer' },
  { command: 'clear', description: 'Clear current terminal output' },
  { command: 'cls', description: 'Clear current terminal output on Windows' },
  { command: 'cd ..', description: 'Go to parent directory' },
  { command: 'git status', description: 'Show current git status' },
  { command: 'git diff', description: 'Show unstaged changes' },
  { command: 'cargo check --manifest-path src-tauri/Cargo.toml', description: 'Validate Rust side of Tauri app' }
];

const buildTerminalPresets = (fileNames: string[]): TerminalPreset[] => {
  const lowerFileNames = fileNames.map((name) => name.toLowerCase());
  const hasPackageJson = lowerFileNames.includes('package.json');
  const hasTauriConfig = lowerFileNames.includes('tauri.conf.json');
  const hasCargoToml = lowerFileNames.includes('cargo.toml');
  const presets: TerminalPreset[] = [];

  if (hasPackageJson) {
    presets.push(
      { label: 'Install', command: 'npm install', description: 'Pasang dependency proyek' },
      { label: 'Dev Web', command: 'npm run dev', description: 'Jalankan dev server web' },
      { label: 'Build Web', command: 'npm run build', description: 'Build frontend produksi' },
      { label: 'Lint', command: 'npm run lint', description: 'Validasi TypeScript proyek' }
    );
  }

  if (hasPackageJson && hasTauriConfig) {
    presets.push(
      { label: 'Dev Tauri', command: 'npm run dev:tauri', description: 'Jalankan desktop dev mode' },
      { label: 'Build Tauri', command: 'npm run build:tauri', description: 'Buat installer Windows' }
    );
  }

  if (hasCargoToml || hasTauriConfig) {
    presets.push({
      label: 'Cargo Check',
      command: 'cargo check --manifest-path src-tauri/Cargo.toml',
      description: 'Cek sisi Rust/Tauri'
    });
  }

  presets.push(
    { label: 'Git Status', command: 'git status', description: 'Lihat status perubahan git' },
    { label: 'Clear', command: 'clear', description: 'Bersihkan output terminal' }
  );

  return presets;
};

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/\/+/g, '/');

const ansiRegex = /\u001b\[[0-9;]*m/g;

const parseTerminalProblems = (lines: string[]): CodeProblem[] => {
  const cleanLines = lines.map((line) => line.replace(ansiRegex, ''));
  const problems: CodeProblem[] = [];

  let npmPath: string | undefined;

  for (let i = 0; i < cleanLines.length; i += 1) {
    const line = cleanLines[i].trim();
    if (!line) continue;

    const npmPathMatch = line.match(/^npm error path (.+)$/i);
    if (npmPathMatch) {
      npmPath = npmPathMatch[1].trim();
      continue;
    }

    const viteImportMatch = line.match(/^Failed to resolve import\s+"([^"]+)"\s+from\s+"([^"]+)"/i);
    if (viteImportMatch) {
      const locationLine = cleanLines.slice(i + 1, i + 6).find((candidate) =>
        /^[A-Za-z]:[\\/].+:\d+:\d+$/i.test(candidate.trim())
      );
      const locationMatch = locationLine?.trim().match(/^([A-Za-z]:[\\/].+):(\d+):(\d+)$/i);
      problems.push({
        severity: 'error',
        line: locationMatch ? Number(locationMatch[2]) : 1,
        file: viteImportMatch[2],
        path: locationMatch?.[1],
        message: `Failed to resolve import "${viteImportMatch[1]}" from "${viteImportMatch[2]}".`
      });
      continue;
    }

    const tsMatch = line.match(/^(.+?)\((\d+),(\d+)\): error TS\d+:\s+(.+)$/i);
    if (tsMatch) {
      problems.push({
        severity: 'error',
        line: Number(tsMatch[2]),
        file: tsMatch[1],
        path: tsMatch[1],
        message: tsMatch[4]
      });
      continue;
    }

    const genericLocationMatch = line.match(/^([A-Za-z]:[\\/].+):(\d+):(\d+)$/i);
    if (genericLocationMatch) {
      const nextLine = cleanLines[i + 1]?.trim();
      if (nextLine && /error|failed|cannot|enoent|not found/i.test(nextLine)) {
        problems.push({
          severity: 'error',
          line: Number(genericLocationMatch[2]),
          path: genericLocationMatch[1],
          message: nextLine
        });
      }
      continue;
    }

    if (/npm error enoent/i.test(line) || /npm error syscall/i.test(line)) {
      problems.push({
        severity: 'error',
        line: 1,
        path: npmPath,
        message: line
      });
      continue;
    }

    if (/^\[AURA ERROR\]/i.test(line) || /^\[AI DRAFT ERROR\]/i.test(line)) {
      problems.push({
        severity: 'error',
        line: 1,
        message: line.replace(/^\[[^\]]+\]\s*/i, '')
      });
    }
  }

  return problems.filter((problem, index, array) =>
    array.findIndex((item) =>
      item.message === problem.message &&
      item.path === problem.path &&
      item.line === problem.line
    ) === index
  );
};

const stripWrappingQuotes = (value: string) => value.replace(/^['"]|['"]$/g, '');

const collectDirectoryCandidates = (paths: string[], rootPath?: string | null) => {
  const directories = new Set<string>();

  if (rootPath) {
    directories.add(normalizePath(rootPath));
  }

  paths.forEach((rawPath) => {
    if (!rawPath) return;
    const normalized = normalizePath(rawPath);
    const segments = normalized.split('/');

    for (let i = 1; i < segments.length; i += 1) {
      const partial = segments.slice(0, i).join('/');
      if (partial) directories.add(partial);
    }
  });

  return Array.from(directories);
};

const toRelativeDisplayPath = (target: string, cwd?: string) => {
  const normalizedTarget = normalizePath(target);
  const normalizedCwd = cwd ? normalizePath(cwd) : '';

  if (!normalizedCwd) {
    return normalizedTarget;
  }

  if (normalizedTarget === normalizedCwd) {
    return '.';
  }

  if (normalizedTarget.startsWith(`${normalizedCwd}/`)) {
    return normalizedTarget.slice(normalizedCwd.length + 1);
  }

  return normalizedTarget;
};

const buildCdSuggestions = (
  input: string,
  cwd: string | undefined,
  filePaths: string[],
  rootPath?: string | null
): TerminalSuggestion[] => {
  const trimmed = input.trim();
  if (!/^cd(?:\s+.*)?$/i.test(trimmed) && !/^cd\s+\/d\s+.*$/i.test(trimmed)) {
    return [];
  }

  const targetQuery = stripWrappingQuotes(trimmed.replace(/^cd(?:\s+\/d)?/i, '').trim()).toLowerCase();
  const candidates = collectDirectoryCandidates(filePaths, rootPath);

  return candidates
    .map((candidate) => {
      const relativePath = toRelativeDisplayPath(candidate, cwd);
      const quotedPath = /\s/.test(relativePath) ? `"${relativePath}"` : relativePath;
      return {
        command: relativePath === '.' ? 'cd .' : `cd ${quotedPath}`,
        description: `Masuk ke folder ${relativePath === '.' ? candidate : relativePath}`
      };
    })
    .filter((suggestion) => {
      if (!targetQuery) return suggestion.command.toLowerCase() !== 'cd .';
      return suggestion.command.toLowerCase().includes(targetQuery);
    })
    .slice(0, 6);
};

export const useTerminal = (
  onDevServerDetected?: (url: string) => void,
  onCommandStart?: (command: string) => void
) => {
  const store = useAppStore();
  
  const [terminalInput, setTerminalInput] = useState('');
  const currentSession = store.terminalSessions.find(s => s.id === store.activeTerminalId) || store.terminalSessions[0];
  const commandHistory = currentSession?.commandHistory || [];
  const historyIndex = currentSession?.historyIndex ?? -1;
  const projectFileNames = store.files.map((file) => file.name);
  const projectFilePaths = store.files.map((file) => file.path || '').filter(Boolean);
  const terminalPresets = buildTerminalPresets(projectFileNames);
  const normalizedInput = terminalInput.trim().toLowerCase();
  const cdSuggestions = buildCdSuggestions(terminalInput, currentSession?.cwd, projectFilePaths, store.nativeProjectPath);
  const commandSuggestions = normalizedInput
    ? BASE_TERMINAL_SUGGESTIONS
        .filter((suggestion) => suggestion.command.toLowerCase().includes(normalizedInput))
        .slice(0, 6)
    : terminalPresets.slice(0, 6).map(({ command, description }) => ({ command, description }));
  const terminalSuggestions = [...cdSuggestions, ...commandSuggestions]
    .filter((suggestion, index, array) =>
      array.findIndex((item) => item.command === suggestion.command) === index
    )
    .slice(0, 6);

  useEffect(() => {
    if (!store.nativeProjectPath) return;
    store.setTerminalSessions(prev => prev.map((session, index) =>
      session.cwd ? session : { ...session, cwd: index === 0 ? store.nativeProjectPath || undefined : session.cwd }
    ));
  }, [store.nativeProjectPath]);

  useEffect(() => {
    store.setProblems(parseTerminalProblems(currentSession?.output || []));
  }, [currentSession?.id, currentSession?.output]);

  const appendTerminalOutput = (data: string | string[], sessionId?: string) => {
    const targetId = sessionId || store.activeTerminalId;
    const lines = Array.isArray(data) ? data : [data];
    
    store.setTerminalSessions(prev => prev.map(s => 
      s.id === targetId ? { ...s, output: [...s.output, ...lines] } : s
    ));
  };

  const updateSessionHistory = (
    sessionId: string,
    updater: (session: typeof currentSession) => Partial<typeof currentSession>
  ) => {
    store.setTerminalSessions(prev => prev.map((session) =>
      session.id === sessionId
        ? { ...session, ...updater(session as typeof currentSession) }
        : session
    ));
  };

  const setSessionHistoryIndex = (index: number, sessionId?: string) => {
    const targetId = sessionId || store.activeTerminalId;
    updateSessionHistory(targetId, () => ({ historyIndex: index }));
  };

  const executeTerminalCommand = (rawCommand: string) => {
    const cmd = rawCommand.trim();
    if (!cmd) return;

    onCommandStart?.(cmd);
    terminalEngine.execute(cmd, store.activeTerminalId, appendTerminalOutput, (url) => {
      onDevServerDetected?.(url);
    });
    updateSessionHistory(store.activeTerminalId, (session) => ({
      commandHistory: [cmd, ...(session?.commandHistory || []).filter((item) => item !== cmd)].slice(0, 100),
      historyIndex: -1
    }));
    setTerminalInput('');
  };

  const handleTerminalCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeTerminalCommand(terminalInput);
    } else if (e.key === 'Tab') {
      if (terminalSuggestions.length > 0) {
        e.preventDefault();
        setTerminalInput(terminalSuggestions[0].command);
      }
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setSessionHistoryIndex(nextIdx);
        setTerminalInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setSessionHistoryIndex(nextIdx);
        setTerminalInput(commandHistory[nextIdx]);
      } else {
        setSessionHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  const clearTerminalSession = (id?: string) => {
    const targetId = id || store.activeTerminalId;
    terminalEngine.clear(targetId);
  };

  const addTerminalSession = () => {
    const newId = `term-${Date.now()}`;
    const newSession = {
      id: newId,
      name: `Terminal ${store.terminalSessions.length + 1}`,
      output: [`[AURA] New session started at ${new Date().toLocaleTimeString()}`],
      cwd: currentSession?.cwd || store.nativeProjectPath || undefined,
      commandHistory: [],
      historyIndex: -1
    };
    store.setTerminalSessions(prev => [...prev, newSession]);
    store.setActiveTerminalId(newId);
    setTerminalInput('');
  };

  const closeTerminalSession = async (id: string) => {
    if (store.terminalSessions.length <= 1) return;
    await terminalEngine.stop(id);
    store.setTerminalSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (store.activeTerminalId === id) {
        store.setActiveTerminalId(filtered[0].id);
      }
      return filtered;
    });
  };

  return {
    ...store,
    currentSession,
    terminalInput,
    setTerminalInput,
    terminalSuggestions,
    terminalPresets,
    commandHistory,
    historyIndex,
    setHistoryIndex: setSessionHistoryIndex,
    appendTerminalOutput,
    executeTerminalCommand,
    handleTerminalCommand,
    clearTerminalSession,
    addTerminalSession,
    closeTerminalSession
  };
};
