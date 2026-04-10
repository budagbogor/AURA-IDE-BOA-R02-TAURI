const STORAGE_KEY = 'aura.diagnostics.v1';
const MAX_ENTRIES = 120;

export type DiagnosticLevel = 'info' | 'warn' | 'error';

export type DiagnosticEntry = {
  timestamp: string;
  level: DiagnosticLevel;
  scope: string;
  message: string;
  detail?: string;
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readEntries(): DiagnosticEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: DiagnosticEntry[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Ignore storage failures to avoid breaking the app.
  }
}

export function logDiagnostic(level: DiagnosticLevel, scope: string, message: string, detail?: unknown) {
  const entry: DiagnosticEntry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    detail: typeof detail === 'string' ? detail : detail ? String(detail) : undefined
  };

  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  logger(`[AURA:${scope}] ${message}`, detail ?? '');
  writeEntries([...readEntries(), entry]);
}

export function installGlobalDiagnostics() {
  if (typeof window === 'undefined') return;

  const diagnosticsWindow = window as Window & {
    __AURA_DIAGNOSTICS_INSTALLED__?: boolean;
    __AURA_DIAGNOSTICS__?: {
      read: () => DiagnosticEntry[];
      clear: () => void;
    };
  };

  if (diagnosticsWindow.__AURA_DIAGNOSTICS_INSTALLED__) return;
  diagnosticsWindow.__AURA_DIAGNOSTICS_INSTALLED__ = true;

  diagnosticsWindow.__AURA_DIAGNOSTICS__ = {
    read: () => readEntries(),
    clear: () => writeEntries([])
  };

  window.addEventListener('error', (event) => {
    logDiagnostic('error', 'window', event.message || 'Unhandled window error', event.error?.stack || event.filename || '');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logDiagnostic(
      'error',
      'promise',
      'Unhandled promise rejection',
      typeof reason === 'string' ? reason : reason?.stack || JSON.stringify(reason)
    );
  });
}

export function clearDiagnostics() {
  writeEntries([]);
}

export function getDiagnostics() {
  return readEntries();
}
