import type { AttachedFile, StagingFile } from '@/types';
import type { AiActivityEntry } from '@/features/workspace/workspaceSupport';
import type { PreparedAiDraftBundle } from '@/features/ai/aiOrchestrator';
import {
  buildFailureActivitySteps,
  buildGeneratingActivitySteps,
  buildNoDraftActivitySteps,
  buildPlanningActivitySteps
} from '@/features/ai/aiWorkflowSupport';

export const buildUserPromptMessage = (prompt: string, attachments: AttachedFile[]) => {
  const attachmentLabel = attachments.length > 0
    ? `\n\n[Attached: ${attachments.map((file) => file.name).join(', ')}]`
    : '';

  return `${prompt}${attachmentLabel}`;
};

export const createPlanningActivityPayload = ({
  domains,
  executionPlan,
  preferredTargets
}: {
  domains: string[];
  executionPlan: string[];
  preferredTargets: string[];
}) => ({
  title: 'AI planning request',
  summary: 'AURA sedang menganalisis kebutuhan, memilih skill, dan menyusun langkah implementasi.',
  status: 'planning' as const,
  files: [] as string[],
  domains,
  steps: buildPlanningActivitySteps(domains, executionPlan, preferredTargets)
});

export const createGeneratingActivityUpdate = ({
  domains,
  preferredTargets,
  executionPlan,
  provider,
  model
}: {
  domains: string[];
  preferredTargets: string[];
  executionPlan: string[];
  provider: string;
  model: string;
}) => ({
  title: 'AI generating workspace changes',
  summary: 'Model aktif sedang menyusun keputusan teknis dan menulis draft perubahan kode untuk workspace.',
  domains,
  status: 'working' as const,
  steps: buildGeneratingActivitySteps({
    domains,
    preferredTargets,
    executionPlan,
    provider,
    model
  })
});

export const createNoDraftActivityUpdate = (domains: string[]) => ({
  title: 'AI response completed',
  summary: 'Respons selesai tanpa perubahan file. Ringkasan keputusan tetap ada di panel chat kanan.',
  files: [] as string[],
  domains,
  status: 'done' as const,
  steps: buildNoDraftActivitySteps()
});

export const createFailureActivityUpdate = (message: string, domains: string[]) => ({
  title: 'AI request failed',
  summary: message,
  domains,
  status: 'error' as const,
  steps: buildFailureActivitySteps(message)
});

export const mergePendingDrafts = (prev: StagingFile[], nextDrafts: StagingFile[]) => {
  const remaining = prev.filter((item) =>
    !nextDrafts.some((draft) => item.path.replace(/\\/g, '/') === draft.path.replace(/\\/g, '/'))
  );
  return [...remaining, ...nextDrafts];
};

export const createDraftReadyActivityUpdate = (
  draftBundle: PreparedAiDraftBundle,
  domains: string[]
) => ({
  title: 'AI draft ready for review',
  summary: `AI menyiapkan ${draftBundle.generatedFiles.length} draft file untuk direview dan diterapkan di panel tengah.`,
  files: draftBundle.generatedFiles.map((item) => item.relativePath),
  domains,
  suggestedCommands: draftBundle.suggestedCommands,
  status: 'done' as const,
  steps: draftBundle.readySteps
});

export const createStandaloneDraftEntry = (
  draftBundle: PreparedAiDraftBundle,
  domains: string[]
): AiActivityEntry => ({
  id: `activity-${Date.now()}`,
  title: 'AI coding draft prepared',
  summary: `AI menyiapkan ${draftBundle.generatedFiles.length} draft file untuk direview dan diterapkan.`,
  files: draftBundle.generatedFiles.map((item) => item.relativePath),
  domains,
  suggestedCommands: draftBundle.suggestedCommands,
  createdAt: Date.now(),
  status: 'done',
  steps: draftBundle.readySteps
});
