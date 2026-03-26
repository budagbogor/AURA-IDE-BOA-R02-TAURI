import { useState, useEffect } from 'react';

export type SidebarTab = 'files' | 'search' | 'git' | 'ai' | 'github' | 'settings' | 'database' | 'auditor';
export type BottomTab = 'terminal' | 'problems' | 'output' | 'debug';
export type LayoutMode = 'classic' | 'modern';

export const useLayout = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('classic');
  const [zenMode, setZenMode] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('files');
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');
  const [context7Mode, setContext7Mode] = useState(false);
  
  // Modals & Overlays
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Inputs
  const [commandInput, setCommandInput] = useState('');
  const [fileSearchInput, setFileSearchInput] = useState('');
  const [repoSearchInput, setRepoSearchInput] = useState('');

  // MCP UI States
  const [newMcpName, setNewMcpName] = useState('New Server');
  const [newMcpUrl, setNewMcpUrl] = useState('');
  const [newMcpType, setNewMcpType] = useState<'sse' | 'stdio'>('sse');
  const [newMcpEnvStr, setNewMcpEnvStr] = useState('');
  const [selectedMcpTemplateIdx, setSelectedMcpTemplateIdx] = useState<number | 'custom'>(0);
  const [mcpTemplateData, setMcpTemplateData] = useState<Record<string, string>>({});
  const [showMcpLogsFor, setShowMcpLogsFor] = useState<string | null>(null);
  const [activeMcpLogs, setActiveMcpLogs] = useState<string[]>([]);

  // Tauri specifics (moving them here for modularity)
  const [TauriCommand, setTauriCommand] = useState<any>(null);
  const [tauriDialog, setTauriDialog] = useState<any>(null);
  const [tauriFs, setTauriFs] = useState<any>(null);

  // Dimensions
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [bottomHeight, setBottomHeight] = useState(200);
  const [aiPanelWidth, setAiPanelWidth] = useState(525);

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [isResizingAiPanel, setIsResizingAiPanel] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        let newWidth;
        if (layoutMode === 'modern') {
          newWidth = window.innerWidth - e.clientX - 56;
        } else {
          newWidth = e.clientX - 56;
        }
        if (newWidth > 150 && newWidth < 900) setSidebarWidth(newWidth);
      }
      if (isResizingBottom) {
        const newHeight = window.innerHeight - e.clientY - 44; 
        if (newHeight > 60 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
      }
      if (isResizingAiPanel) {
        let newWidth;
        if (layoutMode === 'modern') {
          newWidth = e.clientX - 56;
        } else {
          newWidth = window.innerWidth - e.clientX;
        }
        if (newWidth > 200 && newWidth < 800) setAiPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingBottom(false);
      setIsResizingAiPanel(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingSidebar || isResizingBottom || isResizingAiPanel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingBottom, isResizingAiPanel, layoutMode]);

  // Sync AI Panel vs Sidebar AI tab
  useEffect(() => {
    if (sidebarTab === 'ai' && showAiPanel) {
      setShowAiPanel(false);
    }
  }, [sidebarTab]);

  useEffect(() => {
    if (showAiPanel && sidebarTab === 'ai') {
      setSidebarTab('files');
    }
  }, [showAiPanel]);

  return {
    layoutMode, setLayoutMode,
    zenMode, setZenMode,
    showBottomPanel, setShowBottomPanel,
    showAiPanel, setShowAiPanel,
    sidebarTab, setSidebarTab,
    bottomTab, setBottomTab,
    context7Mode, setContext7Mode,
    sidebarWidth, setSidebarWidth,
    bottomHeight, setBottomHeight,
    aiPanelWidth, setAiPanelWidth,
    isResizingSidebar, setIsResizingSidebar,
    isResizingBottom, setIsResizingBottom,
    isResizingAiPanel, setIsResizingAiPanel,
    showCommandPalette, setShowCommandPalette,
    showFileSearch, setShowFileSearch,
    showGuideModal, setShowGuideModal,
    showCreateProjectModal, setShowCreateProjectModal,
    commandInput, setCommandInput,
    fileSearchInput, setFileSearchInput,
    repoSearchInput, setRepoSearchInput,
    newMcpName, setNewMcpName,
    newMcpUrl, setNewMcpUrl,
    newMcpType, setNewMcpType,
    newMcpEnvStr, setNewMcpEnvStr,
    selectedMcpTemplateIdx, setSelectedMcpTemplateIdx,
    mcpTemplateData, setMcpTemplateData,
    showMcpLogsFor, setShowMcpLogsFor,
    activeMcpLogs, setActiveMcpLogs,
    TauriCommand, setTauriCommand,
    tauriDialog, setTauriDialog,
    tauriFs, setTauriFs
  };
};
