import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useLayout = (appendTerminalOutput: (msg: string | string[]) => void) => {
  const store = useAppStore();
  
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [isResizingAiPanel, setIsResizingAiPanel] = useState(false);

  // Tauri specifics
  const [TauriCommand, setTauriCommand] = useState<any>(null);
  const [tauriDialog, setTauriDialog] = useState<any>(null);
  const [tauriFs, setTauriFs] = useState<any>(null);

  const isTauri = typeof window !== 'undefined' && (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);

  useEffect(() => {
    if (isTauri) {
      const loadTauriPlugins = async () => {
        try {
          // Dynamic imports for Tauri v2 plugins
          const dialog = await import('@tauri-apps/plugin-dialog');
          const fs = await import('@tauri-apps/plugin-fs');
          const shell = await import('@tauri-apps/plugin-shell');
          
          setTauriDialog(dialog);
          setTauriFs(fs);
          setTauriCommand(shell.Command);
          
          console.log('[AURA] Tauri Native Plugins Loaded Successfully');
        } catch (err) {
          console.error('[AURA] Failed to load Tauri plugins dynamically:', err);
        }
      };
      loadTauriPlugins();
    }
  }, [isTauri]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        let newWidth;
        if (store.layoutMode === 'modern') {
          newWidth = window.innerWidth - e.clientX - 56;
        } else {
          newWidth = e.clientX - 56;
        }
        if (newWidth > 150 && newWidth < 900) store.setSidebarWidth(newWidth);
      }
      if (isResizingBottom) {
        const newHeight = window.innerHeight - e.clientY - 26; 
        if (newHeight >= 60 && newHeight <= window.innerHeight - 80) store.setBottomHeight(newHeight);
      }
      if (isResizingAiPanel) {
        let newWidth;
        if (store.layoutMode === 'modern') {
          newWidth = e.clientX - 56;
        } else {
          newWidth = window.innerWidth - e.clientX;
        }
        if (newWidth > 200 && newWidth < 800) store.setAiPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingBottom(false);
      setIsResizingAiPanel(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizingSidebar || isResizingBottom || isResizingAiPanel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingBottom, isResizingAiPanel, store.layoutMode]);

  // Sync AI Panel vs Sidebar AI tab (Modular logic from PRD)
  useEffect(() => {
    if (store.sidebarTab === 'ai' && store.showAiPanel) {
      store.setShowAiPanel(false);
    }
  }, [store.sidebarTab]);

  useEffect(() => {
    if (store.showAiPanel && store.sidebarTab === 'ai') {
      store.setSidebarTab('files');
    }
  }, [store.showAiPanel]);


  const openFolder = async () => {
    if (isTauri && tauriDialog) {
      const selected = await tauriDialog.open({ directory: true, multiple: false });
      if (selected && typeof selected === 'string') {
        store.setNativeProjectPath(selected);
        // Trigger sync from native path here if needed
      }
    } else {
      // Browser fallback - using File System Access API
      try {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        store.setNativeProjectPath(handle.name);
      } catch (e) {
        console.warn('Directory picker cancelled or unsupported');
      }
    }
  };

  const closeFolder = () => {
    store.setNativeProjectPath(null);
    store.setFiles([]);
  };

  const relayout = (preset: 'default' | 'zen') => {
    if (preset === 'default') {
      store.setLayoutMode('classic');
      store.setZenMode(false);
      store.setShowSidebar(true);
      store.setShowBottomPanel(true);
      store.setShowAiPanel(true);
    } else {
      store.setZenMode(true);
      store.setShowSidebar(false);
      store.setShowBottomPanel(false);
      store.setShowAiPanel(false);
    }
  };

  const resetAllConnections = () => {
    store.setChatMessages([]);
    store.setComposerMessages([]);
    store.setStagingFiles([]);
    appendTerminalOutput('[SYSTEM] Semua koneksi dan state sementara telah di-reset.');
  };

  return {
    ...store,
    isTauri,
    isResizingSidebar, setIsResizingSidebar,
    isResizingBottom, setIsResizingBottom,
    isResizingAiPanel, setIsResizingAiPanel,
    TauriCommand, setTauriCommand,
    tauriDialog, setTauriDialog,
    tauriFs, setTauriFs,
    openFolder,
    closeFolder,
    relayout,
    resetAllConnections,
    // Add legacy props for compatibility during migration
    showGuideModal: store.showCommandPalette,
    setShowGuideModal: (val: boolean) => store.setShowCommandPalette(val),
    showCreateProjectModal: store.showCreateProjectModal,
    setShowCreateProjectModal: (val: boolean) => store.setShowCreateProjectModal(val),
    commandInput: store.commandInput,
    setCommandInput: (val: string) => store.setCommandInput(val),
    fileSearchInput: store.fileSearchInput,
    setFileSearchInput: (val: string) => store.setFileSearchInput(val),
    repoSearchInput: '',
    setRepoSearchInput: (val: string) => {},
    newMcpName: 'New Server',
    setNewMcpName: (val: string) => {},
    newMcpUrl: '',
    setNewMcpUrl: (val: string) => {},
    newMcpType: 'sse' as 'sse' | 'stdio',
    setNewMcpType: (val: 'sse' | 'stdio') => {},
    newMcpEnvStr: '',
    setNewMcpEnvStr: (val: string) => {},
    selectedMcpTemplateIdx: 0,
    setSelectedMcpTemplateIdx: (val: number | 'custom') => {},
    mcpTemplateData: {},
    setMcpTemplateData: (val: any) => {},
    showMcpLogsFor: null,
    setShowMcpLogsFor: (val: string | null) => {},
    activeMcpLogs: [],
    setActiveMcpLogs: (val: string[]) => {},
  };
};
