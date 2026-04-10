import type { FileItem, StagingFile } from '@/types';
import { getLanguageByExtension, normalizePath } from '@/features/workspace/workspaceSupport';

export const upsertWorkspaceFileList = (
  files: FileItem[],
  absolutePath: string,
  content: string
) => {
  const normalizedPath = normalizePath(absolutePath);
  const fileName = normalizedPath.split('/').pop() || normalizedPath;
  const nextItem: FileItem = {
    id: normalizedPath,
    path: normalizedPath,
    name: fileName,
    content,
    language: getLanguageByExtension(fileName),
    lastModified: Date.now()
  };

  const existingIndex = files.findIndex((file) => normalizePath(file.id) === normalizedPath);
  if (existingIndex >= 0) {
    const next = [...files];
    next[existingIndex] = { ...next[existingIndex], ...nextItem };
    return next;
  }

  return [...files, nextItem];
};

export const removeWorkspaceFileFromList = (files: FileItem[], absolutePath: string) => {
  const normalizedPath = normalizePath(absolutePath);
  return files.filter((file) => normalizePath(file.id) !== normalizedPath);
};

export const removeDraftFromList = (drafts: StagingFile[], draftPath: string) => {
  const normalizedPath = normalizePath(draftPath);
  return drafts.filter((item) => normalizePath(item.path) !== normalizedPath);
};

export const resolveDiscardedDraftFiles = (
  files: FileItem[],
  draft: StagingFile
) => {
  if (draft.action === 'create_or_modify') {
    if (draft.existedBefore) {
      return upsertWorkspaceFileList(files, draft.path, draft.originalContent);
    }
    return removeWorkspaceFileFromList(files, draft.path);
  }

  return files;
};

export const resolveAppliedDraftFiles = (
  files: FileItem[],
  draft: StagingFile
) => {
  if (draft.action === 'delete') {
    return removeWorkspaceFileFromList(files, draft.path);
  }

  return upsertWorkspaceFileList(files, draft.path, draft.newContent);
};
