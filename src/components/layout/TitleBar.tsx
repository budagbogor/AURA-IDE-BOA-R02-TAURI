import React from 'react';
import { 
  FileCode, Save, FolderOpen, Download, X, 
  Edit3, Copy, Scissors, Trash2, 
  PanelRight, PanelBottom, Layout, Eye, 
  Plus, RefreshCw, Play, Package, 
  Settings, Github, Database, 
  BookOpen, Info, RotateCcw
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

interface TitleBarProps {
  onNewFile: () => void;
  onSave: () => void;
  onOpenFolder: () => void;
  onCloseFolder: () => void;
  onExport: () => void;
  onBuildInstaller: () => void;
  onExit: () => void;
  onResetConnections: () => void;
  onShowGuide: () => void;
  executeCommand: (cmd: string) => void;
  addTerminalSession: () => void;
  showAiPanel: boolean;
  setShowAiPanel: (show: boolean) => void;
  showBottomPanel: boolean;
  setShowBottomPanel: (show: boolean) => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onNewFile, onSave, onOpenFolder, onCloseFolder, onExport, onBuildInstaller, onExit,
  onResetConnections, onShowGuide, executeCommand, addTerminalSession,
  showAiPanel, setShowAiPanel, showBottomPanel, setShowBottomPanel
}) => {
  const { 
    projectName, sidebarTab, setSidebarTab, 
    zenMode, setZenMode, setBottomTab
  } = useAppStore();

  const relayout = (mode: 'default' | 'zen') => {
    if (mode === 'zen') {
      setZenMode(true);
      setShowAiPanel(false);
      setShowBottomPanel(false);
    } else {
      setZenMode(false);
      setShowAiPanel(true);
      setShowBottomPanel(true);
    }
  };

  return (
    <div className="h-8 bg-[#323233] flex items-center px-2 select-none border-b border-white/5 z-[100] relative">
      <div className="flex items-center gap-1.5 mr-4 ml-1">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
      </div>

      <div className="flex items-center text-[12px] text-[#cccccc] h-full overflow-hidden">
        {/* File Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>File</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[200px] z-[70] backdrop-blur-xl bg-opacity-95">
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onNewFile}>
              <FileCode size={14} /> <span>New File</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onSave}>
              <Save size={14} /> <span>Save File</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onOpenFolder}>
              <FolderOpen size={14} /> <span>Open Folder...</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onCloseFolder}>
               <X size={14} /> <span>Close Folder</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onExport}>
              <Download size={14} /> <span>Export Project (ZIP)</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onBuildInstaller}>
              <Package size={14} /> <span>Build Windows Installer</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onExit}>
              <X size={14} /> <span>Exit AURA</span>
            </div>
          </div>
        </div>

        {/* Edit Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>Edit</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[180px] z-[70] backdrop-blur-xl bg-opacity-95">
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2">
              <Edit3 size={14} /> <span>Undo</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2 text-white/40">
              <RotateCcw size={14} /> <span>Redo</span>
            </div>
          </div>
        </div>

        {/* View Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>View</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[260px] z-[70] backdrop-blur-xl bg-opacity-95">
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => setShowAiPanel(!showAiPanel)}>
              <div className="flex items-center gap-2"><PanelRight size={14} /> <span>Aura AI Assistant Panel</span></div>
              {showAiPanel && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => setShowBottomPanel(!showBottomPanel)}>
              <div className="flex items-center gap-2"><PanelBottom size={14} /> <span>Terminal & Output View</span></div>
              {showBottomPanel && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => setSidebarTab('files')}>
              <FileCode size={14} className="text-blue-400" /> <span>Explorer</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => setSidebarTab('git')}>
              <Github size={14} /> <span>Source Control</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => setSidebarTab('database')}>
              <Database size={14} /> <span>Databases</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 hover:bg-blue-400 hover:text-white cursor-pointer transition-colors flex items-center justify-between group/item" onClick={() => relayout('default')}>
              <div className="flex items-center gap-2"><Layout size={14} /> <span>Layout: Default</span></div>
              {!zenMode && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
            </div>
            <div className="px-3 py-1.5 hover:bg-purple-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => relayout('zen')}>
              <div className="flex items-center gap-2"><Eye size={14} /> <span>Layout: Zen Mode</span></div>
              {zenMode && <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>}
            </div>
          </div>
        </div>

        {/* Terminal Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>Terminal</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[220px] z-[70] backdrop-blur-xl bg-opacity-95">
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={addTerminalSession}>
               <Plus size={14} /> <span>New Terminal</span>
             </div>
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => executeCommand('clear')}>
               <RefreshCw size={14} /> <span>Clear Terminal</span>
             </div>
             <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
             <div className="px-3 py-1.5 hover:bg-emerald-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between group/cmd" onClick={() => executeCommand('npm run dev')}>
               <div className="flex items-center gap-2"><Play size={14} className="text-emerald-400" /> <span>Run Dev Server</span></div>
               <span className="text-[9px] opacity-40 uppercase">npm dev</span>
             </div>
             <div className="px-3 py-1.5 hover:bg-purple-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => executeCommand('npm run build')}>
               <div className="flex items-center gap-2"><Package size={14} className="text-purple-400" /> <span>Build Application</span></div>
               <span className="text-[9px] opacity-40 uppercase">npm build</span>
             </div>
             <div className="px-3 py-1.5 hover:bg-amber-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={onBuildInstaller}>
               <div className="flex items-center gap-2"><Package size={14} className="text-amber-300" /> <span>Build Windows Installer</span></div>
               <span className="text-[9px] opacity-40 uppercase">tauri build</span>
             </div>
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center justify-between" onClick={() => executeCommand('npm install')}>
               <div className="flex items-center gap-2"><RefreshCw size={14} className="text-blue-400" /> <span>Install/Update</span></div>
               <span className="text-[9px] opacity-40 uppercase">npm install</span>
             </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>Settings</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[220px] z-[70] backdrop-blur-xl bg-opacity-95">
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => setSidebarTab('settings')}>
               <Settings size={14} /> <span>Global Settings</span>
             </div>
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => setSidebarTab('github')}>
               <Github size={14} /> <span>GitHub Sync Config</span>
             </div>
             <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
             <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onResetConnections}>
               <RefreshCw size={14} /> <span>Reset All Connectors</span>
             </div>
          </div>
        </div>

        {/* Help Menu */}
        <div className="relative group cursor-pointer hover:text-white px-3 py-1.5 transition-colors rounded">
          <span>Help</span>
          <div className="absolute top-full left-0 mt-0 bg-[#252526] border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block min-w-[200px] z-[70] backdrop-blur-xl bg-opacity-95">
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={onShowGuide}>
              <BookOpen size={14} /> <span>Guidance & Tips</span>
            </div>
            <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex items-center gap-2" onClick={() => window.open('https://github.com/budagbogor/AURA-IDE-BOA', '_blank')}>
              <Github size={14} /> <span>Source Repository</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
            <div className="px-3 py-1.5 flex items-center gap-2 text-white/40 cursor-default">
              <Info size={14} /> <span className="text-[10px]">AURA AI IDE v15.3.7-PRO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Display */}
      <div className="absolute left-1/2 -translate-x-1/2 text-[11px] text-[#858585] flex items-center gap-2 font-medium">
        <span>{projectName}</span>
        <span>—</span>
        <span className="opacity-50 tracking-wider font-bold text-[10px] text-blue-400">AURA AI IDE</span>
      </div>
    </div>
  );
};
