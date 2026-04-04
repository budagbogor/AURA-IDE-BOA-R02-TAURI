import { useEffect } from 'react';
import { normalizePath, readWorkspaceFiles, readWorkspaceFolders } from '@/features/workspace/workspaceSupport';
import {
  createVerificationDetail,
  createVerificationSummary,
  shouldRefreshWorkspaceAfterCommand
} from '@/features/ai/aiVerificationSupport';

type Params = {
  nativeProjectPath: string | null;
  workspaceDevCommand: string;
  devServerUrl: string | null;
  lastOpenedPreviewRef: React.MutableRefObject<string | null>;
  verificationActivityByCommandRef: React.MutableRefObject<Record<string, string>>;
  setFiles: (updater: any) => void;
  setWorkspaceFolders: React.Dispatch<React.SetStateAction<string[]>>;
  updateAiActivity: (activityId: string, updates: any) => void;
  upsertVerificationStep: (
    activityId: string,
    command: string,
    status: 'planning' | 'working' | 'done' | 'error',
    detail: string
  ) => void;
  onPreviewDetected: () => void;
  onVerificationResolved?: (payload: {
    activityId: string;
    command: string;
    succeeded: boolean;
    detail: string;
    source: 'process-close' | 'dev-server';
  }) => void;
};

export const useTerminalVerificationEffects = ({
  nativeProjectPath,
  workspaceDevCommand,
  devServerUrl,
  lastOpenedPreviewRef,
  verificationActivityByCommandRef,
  setFiles,
  setWorkspaceFolders,
  updateAiActivity,
  upsertVerificationStep,
  onPreviewDetected,
  onVerificationResolved
}: Params) => {
  useEffect(() => {
    const handleTerminalProcessClosed = (event: Event) => {
      const detail = (event as CustomEvent<{ cwd?: string; command?: string; code?: number | null }>).detail;
      if (!detail?.cwd || !nativeProjectPath) return;
      if (normalizePath(detail.cwd) !== normalizePath(nativeProjectPath)) return;

      const command = (detail.command || '').toLowerCase();
      const verificationActivityId = command ? verificationActivityByCommandRef.current[command] : undefined;

      if (verificationActivityId && detail.command) {
        const succeeded = (detail.code ?? 1) === 0;
        const verificationDetail = createVerificationDetail(detail.code);
        upsertVerificationStep(
          verificationActivityId,
          detail.command,
          succeeded ? 'done' : 'error',
          verificationDetail
        );
        updateAiActivity(verificationActivityId, {
          status: succeeded ? 'done' : 'error',
          summary: createVerificationSummary(succeeded)
        });
        delete verificationActivityByCommandRef.current[command];
        onVerificationResolved?.({
          activityId: verificationActivityId,
          command: detail.command,
          succeeded,
          detail: verificationDetail,
          source: 'process-close'
        });
      }

      if (shouldRefreshWorkspaceAfterCommand(command)) {
        void (async () => {
          const [loadedFiles, loadedFolders] = await Promise.all([
            readWorkspaceFiles(detail.cwd!),
            readWorkspaceFolders(detail.cwd!)
          ]);
          setWorkspaceFolders(loadedFolders);
          setFiles(loadedFiles);
        })().catch((error) => {
          console.warn('[AURA] Failed to refresh workspace after terminal command:', error);
        });
      }
    };

    window.addEventListener('aura-terminal-process-closed', handleTerminalProcessClosed);
    return () => window.removeEventListener('aura-terminal-process-closed', handleTerminalProcessClosed);
  }, [
    nativeProjectPath,
    workspaceDevCommand,
    verificationActivityByCommandRef,
    setFiles,
    setWorkspaceFolders,
    updateAiActivity,
    upsertVerificationStep,
    onVerificationResolved
  ]);

  useEffect(() => {
    if (!devServerUrl) return;
    const activityId = verificationActivityByCommandRef.current[workspaceDevCommand.toLowerCase()];
    if (!activityId) return;

    upsertVerificationStep(activityId, workspaceDevCommand, 'done', `Dev server aktif di ${devServerUrl}.`);
    updateAiActivity(activityId, {
      status: 'done',
      summary: `Draft berhasil diverifikasi. Dev server aktif di ${devServerUrl}.`
    });
    delete verificationActivityByCommandRef.current[workspaceDevCommand.toLowerCase()];
    onVerificationResolved?.({
      activityId,
      command: workspaceDevCommand,
      succeeded: true,
      detail: `Dev server aktif di ${devServerUrl}.`,
      source: 'dev-server'
    });
  }, [devServerUrl, workspaceDevCommand, verificationActivityByCommandRef, updateAiActivity, upsertVerificationStep, onVerificationResolved]);

  useEffect(() => {
    if (!devServerUrl) return;
    if (lastOpenedPreviewRef.current === devServerUrl) return;
    lastOpenedPreviewRef.current = devServerUrl;
    onPreviewDetected();
  }, [devServerUrl, lastOpenedPreviewRef, onPreviewDetected]);
};
