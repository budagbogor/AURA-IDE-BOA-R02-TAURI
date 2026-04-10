import type { AiActivityEntry } from '@/features/workspace/workspaceSupport';

export const upsertVerificationStepInEntries = (
  entries: AiActivityEntry[],
  activityId: string,
  command: string,
  status: 'planning' | 'working' | 'done' | 'error',
  detail: string
) => entries.map((entry) => {
  if (entry.id !== activityId) return entry;

  const steps = [...(entry.steps || [])];
  const label = `Verification • ${command}`;
  const nextStep = { label, detail, status };
  const existingIndex = steps.findIndex((step) => step.label === label);

  if (existingIndex >= 0) {
    steps[existingIndex] = nextStep;
  } else {
    steps.push(nextStep);
  }

  return { ...entry, steps };
});

export const shouldRefreshWorkspaceAfterCommand = (command: string) => {
  const normalized = command.toLowerCase();
  return (
    normalized.startsWith('npm install') ||
    normalized.startsWith('npm run build') ||
    normalized.startsWith('npm run dev') ||
    normalized.startsWith('pnpm install') ||
    normalized.startsWith('pnpm build') ||
    normalized.startsWith('pnpm dev') ||
    normalized.startsWith('yarn install') ||
    normalized.startsWith('yarn build') ||
    normalized.startsWith('yarn dev') ||
    normalized.startsWith('bun install') ||
    normalized.startsWith('bun run build') ||
    normalized.startsWith('bun run dev')
  );
};

export const createVerificationSummary = (succeeded: boolean) =>
  succeeded
    ? 'Draft selesai diverifikasi lewat terminal. Lanjutkan review atau jalankan langkah berikutnya.'
    : 'Draft dibuat, tetapi verifikasi terminal melaporkan kegagalan. Cek output terminal untuk detail.';

export const createVerificationDetail = (code?: number | null) => {
  const succeeded = (code ?? 1) === 0;
  return succeeded
    ? `Verifikasi selesai dengan exit code ${code ?? 0}.`
    : `Verifikasi gagal dengan exit code ${code ?? -1}.`;
};
