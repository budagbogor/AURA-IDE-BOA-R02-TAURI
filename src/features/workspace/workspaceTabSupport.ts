export const syncOpenFileTabs = (openFileTabs: string[], fileIds: string[]) =>
  openFileTabs.filter((fileId) => fileIds.includes(fileId));

export const ensureActiveFileTab = (openFileTabs: string[], activeFileId: string) =>
  activeFileId && !openFileTabs.includes(activeFileId)
    ? [...openFileTabs, activeFileId]
    : openFileTabs;

export const resolveCloseTabState = ({
  openFileTabs,
  closingFileId,
  activeWorkspaceTab,
  hasAiActivity
}: {
  openFileTabs: string[];
  closingFileId: string;
  activeWorkspaceTab: string;
  hasAiActivity: boolean;
}) => {
  const nextTabs = openFileTabs.filter((id) => id !== closingFileId);
  if (activeWorkspaceTab !== closingFileId) {
    return {
      nextTabs,
      nextActiveFileId: null as string | null,
      nextWorkspaceTab: activeWorkspaceTab
    };
  }

  const fallback = nextTabs[nextTabs.length - 1] || null;
  return {
    nextTabs,
    nextActiveFileId: fallback,
    nextWorkspaceTab: fallback || (hasAiActivity ? '__aura_ai_activity__' : '')
  };
};
