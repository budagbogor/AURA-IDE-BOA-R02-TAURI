import React from 'react';
import { 
  ChevronRight, Search, FileCode, Monitor, 
  Smartphone, Layout, Eye, X, Download, 
  Sparkles, Terminal, FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

interface QuickSearchProps {
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  showFileSearch: boolean;
  setShowFileSearch: (show: boolean) => void;
  commandInput: string;
  setCommandInput: (val: string) => void;
  fileSearchInput: string;
  setFileSearchInput: (val: string) => void;
  
  // Actions
  onBuildDesktop: (type: 'cloud' | 'local') => void;
  onBuildAndroid: (type: 'cloud' | 'local') => void;
  onRelayout: (mode: 'default' | 'zen') => void;
  onCreateNewFile: () => void;
  onOpenFolder: () => void;
  onCloseFolder: () => void;
  onExportProject: () => void;
  onToggleLayoutMode: () => void;
  onToggleZenMode: () => void;
  onScanProblems: () => void;
  onClearTerminal: () => void;
  onRunDevServer: () => void;
  onInstallDependencies: () => void;
  onKillTerminalProcess: () => void;
  onFocusTerminal: () => void;
  onBuildInstaller: () => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  showCommandPalette, setShowCommandPalette,
  showFileSearch, setShowFileSearch,
  commandInput, setCommandInput,
  fileSearchInput, setFileSearchInput,
  onBuildDesktop, onBuildAndroid, onRelayout,
  onCreateNewFile, onOpenFolder, onCloseFolder, onExportProject,
  onToggleLayoutMode, onToggleZenMode, onScanProblems, onClearTerminal,
  onRunDevServer, onInstallDependencies, onKillTerminalProcess, onFocusTerminal,
  onBuildInstaller
}) => {
  const { files, setActiveFileId } = useAppStore();

  const commands = [
    { icon: <Terminal size={16} />, label: 'Terminal: Focus Panel', action: onFocusTerminal },
    { icon: <Terminal size={16} />, label: 'Terminal: Run Dev Server', action: onRunDevServer },
    { icon: <Download size={16} />, label: 'Terminal: Install Dependencies', action: onInstallDependencies },
    { icon: <X size={16} />, label: 'Terminal: Kill Active Process', action: onKillTerminalProcess },
    { icon: <Terminal size={16} />, label: 'Terminal: Clear Output', action: onClearTerminal },
    { icon: <Monitor size={16} />, label: 'Build Windows Installer', action: onBuildInstaller },
    { icon: <Monitor size={16} />, label: 'Build Windows App (.exe) - Cloud Build', action: () => onBuildDesktop('cloud') },
    { icon: <Monitor size={16} />, label: 'Build Windows App (.exe) - Local', action: () => onBuildDesktop('local') },
    { icon: <Smartphone size={16} />, label: 'Build Android App (.apk) - Cloud Build', action: () => onBuildAndroid('cloud') },
    { icon: <Smartphone size={16} />, label: 'Build Android App (.apk) - Local', action: () => onBuildAndroid('local') },
    { icon: <Layout size={16} />, label: 'Relayout: Default', action: () => onRelayout('default') },
    { icon: <Eye size={16} />, label: 'Relayout: Zen', action: () => onRelayout('zen') },
    { icon: <FileCode size={16} />, label: 'Create New File', action: onCreateNewFile },
    { icon: <FolderOpen size={16} />, label: 'Open Folder', action: onOpenFolder },
    { icon: <X size={16} />, label: 'Close Folder', action: onCloseFolder },
    { icon: <Download size={16} />, label: 'Export Project', action: onExportProject },
    { icon: <Layout size={16} />, label: 'Toggle Layout Mode', action: onToggleLayoutMode },
    { icon: <Eye size={16} />, label: 'Toggle Zen Mode', action: onToggleZenMode },
    { icon: <Sparkles size={16} />, label: 'Scan Code for Problems', action: onScanProblems },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(commandInput.toLowerCase())
  );

  return (
    <>
      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl glass-card rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <ChevronRight size={18} className="text-blue-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Type a command or search..."
                  className="bg-transparent border-none outline-none text-white text-lg w-full"
                  value={commandInput}
                  onChange={e => setCommandInput(e.target.value)}
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredCommands.map((cmd, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                      setCommandInput('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="text-[#858585] group-hover:text-blue-500 transition-colors">
                      {cmd.icon}
                    </div>
                    <span className="text-[14px]">{cmd.label}</span>
                  </div>
                ))}
                {filteredCommands.length === 0 && (
                  <div className="px-4 py-6 text-sm text-[#858585]">
                    No command matched your search.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Search */}
      <AnimatePresence>
        {showFileSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFileSearch(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl glass-card rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Search size={18} className="text-blue-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search files by name..."
                  className="bg-transparent border-none outline-none text-white text-lg w-full"
                  value={fileSearchInput}
                  onChange={e => setFileSearchInput(e.target.value)}
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                {files.filter(f => f.name.toLowerCase().includes(fileSearchInput.toLowerCase())).map((file, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setShowFileSearch(false);
                      setFileSearchInput('');
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
                  >
                    <FileCode size={16} className="text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-[14px]">{file.name}</span>
                      <span className="text-[10px] text-[#858585]">AURA-PROJECT</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Internal icon import mock to avoid missing icons removed as we now use lucide-react
