import { useEffect } from 'react';
import { AI_ACTIVITY_TAB_ID, type ExplorerNode } from '@/features/workspace/workspaceSupport';
import { ensureActiveFileTab, syncOpenFileTabs } from '@/features/workspace/workspaceTabSupport';
import type { FileItem, StagingFile } from '@/types';

type Params = {
  files: FileItem[];
  activeFileId: string;
  activeFile: FileItem | null;
  activeDraft?: StagingFile;
  explorerTree: ExplorerNode[];
  aiActivityCount: number;
  openFileTabs: string[];
  activeWorkspaceTab: string;
  setOpenFileTabs: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveWorkspaceTab: React.Dispatch<React.SetStateAction<string>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setDraftViewMode: React.Dispatch<React.SetStateAction<'editor' | 'diff'>>;
  setActiveFileId: (id: string) => void;
};

export const useWorkspaceUiEffects = ({
  files,
  activeFileId,
  activeFile,
  activeDraft,
  explorerTree,
  aiActivityCount,
  openFileTabs,
  activeWorkspaceTab,
  setOpenFileTabs,
  setActiveWorkspaceTab,
  setExpandedFolders,
  setDraftViewMode,
  setActiveFileId
}: Params) => {
  useEffect(() => {
    if (!activeFile && files.length > 0) {
      setActiveFileId(files[0].id);
    }
  }, [activeFile, files, setActiveFileId]);

  useEffect(() => {
    setOpenFileTabs((prev) => syncOpenFileTabs(prev, files.map((file) => file.id)));
  }, [files, setOpenFileTabs]);

  useEffect(() => {
    if (files.length === 0) {
      setOpenFileTabs([]);
      if (aiActivityCount === 0) {
        setActiveWorkspaceTab('');
      }
      return;
    }

    if (!activeFileId && files[0]) {
      setActiveFileId(files[0].id);
    }

    if (activeFileId) {
      setOpenFileTabs((prev) => ensureActiveFileTab(prev, activeFileId));
    }

    if (!activeWorkspaceTab && activeFileId) {
      setActiveWorkspaceTab(activeFileId);
    }
  }, [
    files,
    activeFileId,
    openFileTabs,
    activeWorkspaceTab,
    aiActivityCount,
    setOpenFileTabs,
    setActiveWorkspaceTab,
    setActiveFileId
  ]);

  useEffect(() => {
    if (activeDraft) {
      setDraftViewMode('diff');
    }
  }, [activeDraft?.path, setDraftViewMode]);

  useEffect(() => {
    if (files.length === 0) return;

    setExpandedFolders((prev) => {
      const next = { ...prev };
      explorerTree.forEach((node) => {
        if (node.type === 'folder' && next[node.id] === undefined) {
          next[node.id] = true;
        }
      });
      return next;
    });
  }, [explorerTree, files.length, setExpandedFolders]);
};

export const fallbackWorkspaceTabAfterFileRemoval = (
  remainingFiles: FileItem[],
  activeFileId: string,
  aiActivityCount: number
) => {
  const fallback = remainingFiles.find((file) => file.id !== activeFileId);
  if (fallback?.id) {
    return fallback.id;
  }
  return aiActivityCount > 0 ? AI_ACTIVITY_TAB_ID : '';
};
