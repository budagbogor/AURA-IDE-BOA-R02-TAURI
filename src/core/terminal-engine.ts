import { useAppStore } from '../store/useAppStore';

type AppendOutput = (data: string | string[], sessionId?: string) => void;

const runningProcesses = new Map<string, { pid?: number; kill: () => Promise<void> }>();
const ansiRegex = /\u001b\[[0-9;]*m/g;

const devServerPatterns = [
  /Local:\s+(http:\/\/localhost:\d+)/i,
  /(http:\/\/localhost:\d+)/i,
  /(http:\/\/127\.0\.0\.1:\d+)/i,
  /(http:\/\/0\.0\.0\.0:\d+)/i
];

const isTauri =
  typeof window !== 'undefined' &&
  (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);

const normalizePath = (path: string) => path.replace(/\\/g, '/').replace(/\/+/g, '/');

const getSession = (sessionId: string) => useAppStore.getState().terminalSessions.find((session) => session.id === sessionId);

const setSessionState = (
  sessionId: string,
  updater: (session: any) => any
) => {
  useAppStore.setState((state) => ({
    terminalSessions: state.terminalSessions.map((session) =>
      session.id === sessionId ? updater(session) : session
    )
  }));
};

const detectDevServer = (data: string, onDevServerDetected: (url: string) => void) => {
  const cleanData = data.replace(ansiRegex, '');
  for (const pattern of devServerPatterns) {
    const match = cleanData.match(pattern);
    if (match?.[1]) {
      onDevServerDetected(match[1].replace('127.0.0.1', 'localhost').replace('0.0.0.0', 'localhost'));
      return;
    }
  }
};

const setSessionCwd = (sessionId: string, cwd?: string) => {
  setSessionState(sessionId, (session) => ({
    ...session,
    cwd
  }));
};

const stripWrappingQuotes = (value: string) => value.replace(/^['"]|['"]$/g, '');

const tokenizeCommand = (value: string) => {
  const matches = value.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return matches.map((token) => stripWrappingQuotes(token));
};

type CommandStrategy = {
  program: string;
  args: string[];
  note?: string;
};

type PackageManifest = {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const readProjectManifest = async (cwd?: string) => {
  if (!cwd) return null;

  const { exists, readTextFile } = await import('@tauri-apps/plugin-fs');
  const packageJsonPath = `${cwd.replace(/\/+$/, '')}/package.json`;
  const hasPackageJson = await exists(packageJsonPath);
  if (!hasPackageJson) {
    return null;
  }

  try {
    const raw = await readTextFile(packageJsonPath);
    return JSON.parse(raw) as PackageManifest;
  } catch {
    return null;
  }
};

const analyzeNpmProjectState = async (cwd: string | undefined, appendOutput: AppendOutput, sessionId: string, command: string) => {
  const { exists } = await import('@tauri-apps/plugin-fs');
  const manifest = await readProjectManifest(cwd);
  if (!manifest || !cwd) return;

  const dependencyCount = Object.keys(manifest.dependencies || {}).length + Object.keys(manifest.devDependencies || {}).length;
  const scripts = manifest.scripts || {};
  const hasClientSource = await exists(`${cwd.replace(/\/+$/, '')}/client/src`);
  const hasClientPackageJson = await exists(`${cwd.replace(/\/+$/, '')}/client/package.json`);
  const hasViteDependency = Boolean(manifest.dependencies?.vite || manifest.devDependencies?.vite);

  if (/^npm\s+install$/i.test(command) && dependencyCount === 0) {
    appendOutput('[AURA] Diagnosa: package.json aktif tidak punya dependencies/devDependencies, jadi npm install memang tidak akan membuat node_modules yang berisi tool frontend.', sessionId);
  }

  if (/^npm\s+run\s+(dev|build|preview)\b/i.test(command)) {
    const scriptName = command.match(/^npm\s+run\s+(\w+)/i)?.[1];
    const scriptBody = scriptName ? scripts[scriptName] : '';

    if (!scriptBody) {
      appendOutput(`[AURA] Diagnosa: script "${scriptName}" tidak ditemukan di package.json aktif.`, sessionId);
      return;
    }

    if (/vite\b/i.test(scriptBody) && !hasViteDependency) {
      appendOutput('[AURA] Diagnosa: script ini memanggil Vite, tetapi package.json aktif tidak mendeklarasikan dependency `vite`.', sessionId);
    }
  }

  if (hasClientSource && !hasClientPackageJson) {
    appendOutput('[AURA] Info struktur proyek: ditemukan folder client/src, tetapi tidak ada client/package.json. Saat ini npm dijalankan dari root proyek.', sessionId);
  }
};

const resolveCwdTarget = (currentCwd: string | undefined, rawTarget: string, fallbackRoot?: string | null) => {
  const target = stripWrappingQuotes(rawTarget.trim());
  if (!target || target === '~') {
    return fallbackRoot ? normalizePath(fallbackRoot) : currentCwd;
  }

  if (/^[a-zA-Z]:[\\/]/.test(target) || target.startsWith('/')) {
    return normalizePath(target);
  }

  const base = normalizePath(currentCwd || fallbackRoot || '');
  if (!base) return normalizePath(target);

  const combined = normalizePath(`${base}/${target}`);
  const segments: string[] = [];

  for (const segment of combined.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (segments.length > 1 || (segments.length === 1 && !segments[0].endsWith(':'))) {
        segments.pop();
      }
      continue;
    }
    segments.push(segment);
  }

  if (segments.length > 0 && segments[0].endsWith(':')) {
    return `${segments[0]}/${segments.slice(1).join('/')}`.replace(/\/$/, '') || `${segments[0]}/`;
  }

  return `/${segments.join('/')}`.replace(/\/$/, '') || '/';
};

const getParentDirectory = (value: string) => {
  const normalized = normalizePath(value).replace(/\/+$/, '');
  if (!normalized) return '';
  const driveRootMatch = normalized.match(/^[A-Za-z]:$/);
  if (driveRootMatch) {
    return normalized;
  }

  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash <= 0) {
    return normalized;
  }

  const parent = normalized.slice(0, lastSlash);
  return parent || normalized;
};

const isSameOrInsidePath = (target: string, parent: string) => {
  const normalizedTarget = normalizePath(target).replace(/\/+$/, '');
  const normalizedParent = normalizePath(parent).replace(/\/+$/, '');
  return normalizedTarget === normalizedParent || normalizedTarget.startsWith(`${normalizedParent}/`);
};

const findNearestGitRoot = async (startPath: string) => {
  const { exists } = await import('@tauri-apps/plugin-fs');
  let current = normalizePath(startPath).replace(/\/+$/, '');

  while (current) {
    if (await exists(`${current}/.git`)) {
      return current;
    }

    const parent = getParentDirectory(current);
    if (!parent || parent === current) {
      break;
    }
    current = parent;
  }

  return null;
};

const handleCdCommand = async (sessionId: string, command: string, appendOutput: AppendOutput) => {
  const { exists, stat } = await import('@tauri-apps/plugin-fs');
  const store = useAppStore.getState();
  const session = getSession(sessionId);
  const currentCwd = session?.cwd || store.nativeProjectPath || undefined;
  const trimmed = command.trim();
  const explicitTarget = trimmed.replace(/^cd(?:\s+\/d)?/i, '').trim();
  const nextCwd = resolveCwdTarget(currentCwd, explicitTarget, store.nativeProjectPath);

  if (!nextCwd) {
    appendOutput('[AURA] Folder aktif belum tersedia untuk perintah cd.', sessionId);
    return;
  }

  const pathExists = await exists(nextCwd);
  if (!pathExists) {
    appendOutput(`[AURA] Path tidak ditemukan: ${nextCwd}`, sessionId);
    return;
  }

  const info = await stat(nextCwd);
  if (!info.isDirectory) {
    appendOutput(`[AURA] Bukan folder: ${nextCwd}`, sessionId);
    return;
  }

  setSessionCwd(sessionId, nextCwd);
  appendOutput(`[AURA] cwd -> ${nextCwd}`, sessionId);
};

const clearSessionOutput = (sessionId: string) => {
  useAppStore.setState((state) => ({
    terminalSessions: state.terminalSessions.map((session) =>
      session.id === sessionId ? {
        ...session,
        output: [],
        processStatus: session.isRunning ? 'running' : 'idle',
        lastExitCode: session.isRunning ? session.lastExitCode ?? null : null
      } : session
    )
  }));

  window.dispatchEvent(new CustomEvent('terminal-clear', {
    detail: { id: sessionId }
  }));
};

const stopWindowsProcessTree = async (pid: number) => {
  const { Command } = await import('@tauri-apps/plugin-shell');
  const psCommand = `
$rootPid = ${pid}
$all = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId
$targets = New-Object System.Collections.Generic.List[Int32]
function Add-Children([int]$parentPid) {
  $children = $all | Where-Object { $_.ParentProcessId -eq $parentPid }
  foreach ($child in $children) {
    if (-not $targets.Contains([int]$child.ProcessId)) {
      $targets.Add([int]$child.ProcessId)
      Add-Children([int]$child.ProcessId)
    }
  }
}
Add-Children $rootPid
$targets.Add($rootPid)
$targets | Sort-Object -Descending | ForEach-Object {
  try { Stop-Process -Id $_ -Force -ErrorAction Stop } catch {}
}
`.trim();

  try {
    await Command.create('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psCommand]).execute();
  } catch {
    await Command.create('taskkill', ['/PID', String(pid), '/T', '/F']).execute();
  }
};

const stopSessionProcess = async (sessionId: string, appendOutput?: AppendOutput) => {
  const process = runningProcesses.get(sessionId);
  if (!process) {
    appendOutput?.('[AURA] Tidak ada proses aktif untuk dihentikan.', sessionId);
    return;
  }

  const activeSession = getSession(sessionId);
  const stoppedCommand = activeSession?.currentCommand;
  const stoppedCwd = activeSession?.cwd;

  if (navigator.platform.toLowerCase().includes('win') && process.pid) {
    try {
      await stopWindowsProcessTree(process.pid);
    } catch {
      await process.kill();
    }
  } else {
    await process.kill();
  }
  runningProcesses.delete(sessionId);
  setSessionState(sessionId, (session) => ({
    ...session,
    isRunning: false,
    currentCommand: undefined,
    processStatus: 'failed',
    lastExitCode: -1
  }));
  window.dispatchEvent(new CustomEvent('aura-terminal-process-closed', {
    detail: {
      sessionId,
      cwd: stoppedCwd,
      command: stoppedCommand,
      code: -1,
      signal: 'stopped'
    }
  }));
  appendOutput?.('[AURA] Proses aktif dihentikan.', sessionId);
};

export const terminalEngine = {
  stop: stopSessionProcess,
  clear: clearSessionOutput,

  async execute(
    command: string,
    sessionId: string,
    appendOutput: AppendOutput,
    onDevServerDetected: (url: string) => void
  ) {
    const val = command.trim();
    if (!val) return;

    if (val === '\u0003' || val.toLowerCase() === 'ctrl+c') {
      await stopSessionProcess(sessionId, appendOutput);
      return;
    }

    if (val.toLowerCase() === 'clear' || val.toLowerCase() === 'cls') {
      clearSessionOutput(sessionId);
      return;
    }

    if (/^cd(\s+.*)?$/i.test(val) || /^cd\s+\/d\s+.*$/i.test(val)) {
      if (!isTauri) {
        appendOutput('[AURA] Perintah cd persisten hanya tersedia di aplikasi desktop Tauri.', sessionId);
        return;
      }
      await handleCdCommand(sessionId, val, appendOutput);
      return;
    }

    appendOutput(`> ${val}`, sessionId);

    if (!isTauri) {
      appendOutput(
        '[AURA] Eksekusi terminal native hanya tersedia di aplikasi Tauri desktop. Jalankan via `npm run dev:tauri` untuk terminal interaktif.',
        sessionId
      );
      return;
    }

    if (runningProcesses.has(sessionId)) {
      appendOutput(
        '[AURA] Sesi ini masih menjalankan proses lain. Hentikan dulu sebelum menjalankan perintah berikutnya.',
        sessionId
      );
      return;
    }

    try {
      const { Command } = await import('@tauri-apps/plugin-shell');
      const { exists } = await import('@tauri-apps/plugin-fs');
      const store = useAppStore.getState();
      const isWindows = navigator.platform.toLowerCase().includes('win');
      const cwd = getSession(sessionId)?.cwd || store.nativeProjectPath || undefined;
      const tokens = tokenizeCommand(val);
      const executable = tokens[0]?.toLowerCase();
      let executionCwd = cwd;

      if (executable === 'git') {
        const workspaceRoot = store.nativeProjectPath ? normalizePath(store.nativeProjectPath) : '';
        const gitSearchRoot = cwd || workspaceRoot;

        if (!gitSearchRoot) {
          appendOutput('[AURA] Workspace aktif belum tersedia untuk menjalankan perintah Git.', sessionId);
          return;
        }

        const gitRoot = await findNearestGitRoot(gitSearchRoot);
        if (!gitRoot) {
          appendOutput('[AURA] Folder aktif belum menjadi repo Git. `git status` tidak dijalankan.', sessionId);
          appendOutput('[AURA] Jika memang ingin repo lokal terpisah, jalankan `git init` di root workspace proyek ini.', sessionId);
          return;
        }

        if (workspaceRoot && !isSameOrInsidePath(gitRoot, workspaceRoot)) {
          appendOutput(`[AURA] Git root terdekat berada di luar workspace aktif: ${gitRoot}`, sessionId);
          appendOutput('[AURA] Untuk keamanan, AURA membatalkan perintah Git agar tidak membaca repo induk atau home directory.', sessionId);
          appendOutput(`[AURA] Workspace aktif: ${workspaceRoot}`, sessionId);
          appendOutput('[AURA] Solusi: buka folder repo yang benar atau buat repo baru khusus di workspace ini dengan `git init`.', sessionId);
          return;
        }

        executionCwd = gitRoot;
        if (gitRoot !== cwd) {
          appendOutput(`[AURA] Menjalankan Git dari root repo aktif: ${gitRoot}`, sessionId);
        }
      }

      if (isWindows && executable === 'npm' && cwd) {
        const packageJsonPath = `${cwd.replace(/\/+$/, '')}/package.json`;
        const hasPackageJson = await exists(packageJsonPath);
        if (!hasPackageJson) {
          appendOutput(`[AURA] Peringatan: package.json tidak ditemukan di cwd aktif (${cwd}).`, sessionId);
        }
      }

      if (executable === 'npm') {
        await analyzeNpmProjectState(cwd, appendOutput, sessionId, val);
      }

      const strategies: CommandStrategy[] = (() => {
        if (isWindows && executable === 'npm') {
          return [
            {
              program: 'npm.cmd',
              args: tokens.slice(1),
              note: '[AURA] Strategy 1/2: npm.cmd langsung'
            },
            {
              program: 'powershell',
              args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', val],
              note: '[AURA] Strategy 2/2: fallback via PowerShell'
            }
          ];
        }

        if (isWindows && executable === 'npx') {
          return [
            {
              program: 'npx.cmd',
              args: tokens.slice(1),
              note: '[AURA] Strategy 1/2: npx.cmd langsung'
            },
            {
              program: 'powershell',
              args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', val],
              note: '[AURA] Strategy 2/2: fallback via PowerShell'
            }
          ];
        }

        if (isWindows && executable === 'git') {
          return [
            {
              program: 'git',
              args: tokens.slice(1),
              note: '[AURA] Strategy: git langsung'
            }
          ];
        }

        if (!isWindows && tokens.length > 0) {
          return [
            {
              program: tokens[0],
              args: tokens.slice(1)
            }
          ];
        }

        return [
          {
            program: isWindows ? 'powershell' : 'sh',
            args: isWindows
              ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', val]
              : ['-lc', val]
          }
        ];
      })();

      let lastError: unknown = null;

      for (const strategy of strategies) {
        appendOutput(
          `[AURA] Exec -> ${strategy.program}${strategy.args.length ? ` ${strategy.args.join(' ')}` : ''}${executionCwd ? ` | cwd=${executionCwd}` : ''}`,
          sessionId
        );
        if (strategy.note) {
          appendOutput(strategy.note, sessionId);
        }

        try {
          const spawned = Command.create(strategy.program, strategy.args, {
            cwd: executionCwd,
            env: {
              FORCE_COLOR: '1'
            }
          });

          spawned.stdout.on('data', (data) => {
            const chunk = `${data}`.replace(/\r?\n$/, '');
            if (!chunk) return;
            appendOutput(chunk, sessionId);
            detectDevServer(chunk, onDevServerDetected);
          });

          spawned.stderr.on('data', (data) => {
            const chunk = `${data}`.replace(/\r?\n$/, '');
            if (!chunk) return;
            appendOutput(chunk, sessionId);
            detectDevServer(chunk, onDevServerDetected);
          });

          spawned.on('close', ({ code, signal }) => {
            runningProcesses.delete(sessionId);
            const nextStatus = code === 0 ? 'success' : 'failed';
            setSessionState(sessionId, (session) => ({
              ...session,
              isRunning: false,
              currentCommand: undefined,
              processStatus: nextStatus,
              lastExitCode: code
            }));
            window.dispatchEvent(new CustomEvent('aura-terminal-process-closed', {
              detail: {
                sessionId,
                cwd: executionCwd,
                command: val,
                code,
                signal
              }
            }));
            appendOutput(
              `[AURA] Proses selesai${code !== null ? ` dengan exit code ${code}` : ''}${signal !== null ? ` (signal ${signal})` : ''}.`,
              sessionId
            );
          });

          spawned.on('error', (error) => {
            runningProcesses.delete(sessionId);
            setSessionState(sessionId, (session) => ({
              ...session,
              isRunning: false,
              currentCommand: undefined,
              processStatus: 'failed',
              lastExitCode: -1
            }));
            appendOutput(`[AURA ERROR] ${error}`, sessionId);
          });

          const child = await spawned.spawn();
          setSessionState(sessionId, (session) => ({
            ...session,
            isRunning: true,
            currentCommand: val,
            cwd,
            processStatus: 'running',
            lastExitCode: null
          }));
          runningProcesses.set(sessionId, {
            pid: child.pid,
            kill: () => child.kill()
          });
          appendOutput(`[AURA] Menjalankan PID ${child.pid}`, sessionId);
          return;
        } catch (strategyError: any) {
          lastError = strategyError;
          appendOutput(
            `[AURA] Strategy gagal: ${strategy.program}${strategyError?.message ? ` -> ${strategyError.message}` : ''}`,
            sessionId
          );
        }
      }

      throw lastError instanceof Error ? lastError : new Error(String(lastError ?? 'Unknown terminal error'));
    } catch (err: any) {
      runningProcesses.delete(sessionId);
      setSessionState(sessionId, (session) => ({
        ...session,
        isRunning: false,
        currentCommand: undefined,
        processStatus: 'failed',
        lastExitCode: -1
      }));
      appendOutput(`[AURA ERROR] ${err.message}`, sessionId);
    }
  }
};
