import React from 'react';
import { Folder, ChevronRight, X, FolderOpen, Github, Plus, Globe } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getFileIcon } from '@/utils/icons';
import { AuraLogo } from '@/components/layout/AuraLogo';
import { FileItem } from '@/types';

interface EditorAreaProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  activeFileId: string;
  setActiveFileId: (id: string) => void;
  showBrowser: boolean;
  setShowBrowser: (show: boolean) => void;
  projectName: string;
  nativeProjectPath: string;
  activeFile: FileItem | null;
  handleEditorChange: (value: string | undefined) => void;
  editorFontSize: any;
  openFolder: () => void;
  setSidebarTab: (tab: any) => void;
  createNewFile: () => void;
  handleCloneRepo: (repo: any) => void;
  browserWidth: number;
  setIsResizingBrowser: (v: boolean) => void;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  browserSrcDoc: string | null;
  setBrowserSrcDoc: (doc: string | null) => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  files,
  setFiles,
  activeFileId,
  setActiveFileId,
  showBrowser,
  setShowBrowser,
  projectName,
  nativeProjectPath,
  activeFile,
  handleEditorChange,
  editorFontSize,
  openFolder,
  setSidebarTab,
  createNewFile,
  handleCloneRepo,
  browserWidth,
  setIsResizingBrowser,
  browserUrl,
  setBrowserUrl,
  browserSrcDoc,
  setBrowserSrcDoc
}) => {
  return (
    <div className="flex-1 flex min-h-0 relative">
      {/* Welcome Screen when no files are open */}
      {files.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1e1e1e] text-center p-8 space-y-8 overflow-y-auto">
          <div className="flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] mt-10">
            <AuraLogo size={100} className="drop-shadow-2xl" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome to Aura IDE</h2>
            <p className="text-[#858585] max-w-md">The next generation AI-powered development environment. Start by creating a new file or opening a folder.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-3xl px-4">
            <button onClick={openFolder} className="flex flex-col items-center gap-3 p-6 bg-[#252526]/50 backdrop-blur-md hover:bg-[#2d2d2d] rounded-2xl border border-white/5 transition-all group hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-95">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <FolderOpen size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">Open Folder</span>
            </button>
            <button 
              onClick={() => setSidebarTab('github')} 
              className="flex flex-col items-center gap-3 p-6 bg-[#252526]/50 backdrop-blur-md hover:bg-[#2d2d2d] rounded-2xl border border-white/5 transition-all group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Github size={24} className="text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">Clone Repo</span>
            </button>
            <button onClick={createNewFile} className="flex flex-col items-center gap-3 p-6 bg-[#252526]/50 backdrop-blur-md hover:bg-[#2d2d2d] rounded-2xl border border-white/5 transition-all group hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Plus size={24} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">New File</span>
            </button>
            <button onClick={() => {
              const url = prompt('Enter GitHub Repository URL (e.g. user/repo):');
              if (url) {
                const parts = url.split('/');
                const name = parts[parts.length - 1];
                const owner = parts[parts.length - 2];
                if (owner && name) {
                  handleCloneRepo({ name, owner: { login: owner }, full_name: url });
                } else {
                  alert('Invalid repository URL format. Please use "owner/repo"');
                }
              }
            }} className="flex flex-col items-center gap-3 p-6 bg-[#252526]/50 backdrop-blur-md hover:bg-[#2d2d2d] rounded-2xl border border-white/5 transition-all group hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-95">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Globe size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">Clone from URL</span>
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[11px] text-[#858585] font-mono uppercase tracking-widest pt-4 pb-10">
            <div className="flex items-center gap-2"><kbd className="bg-[#333] px-1.5 py-0.5 rounded border border-white/10 text-white">Ctrl+P</kbd> Search Files</div>
            <div className="flex items-center gap-2"><kbd className="bg-[#333] px-1.5 py-0.5 rounded border border-white/10 text-white">Ctrl+Shift+P</kbd> Commands</div>
          </div>
        </div>
      )}
      
      {/* Monaco Editor */}
      {activeFile && (
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {/* Breadcrumbs / Editor Header */}
          <div className="h-9 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4 gap-2 text-[11px] text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
            <Folder size={12} />
            <span>{projectName.toLowerCase()}</span>
            <ChevronRight size={12} className="opacity-40" />
            {getFileIcon(activeFile.name)}
            <span className="text-gray-300 font-medium">{activeFile.name}</span>
            {nativeProjectPath && <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500/80 rounded text-[9px] border border-yellow-500/10">NATIVE SYNC ON</span>}
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleEditorChange}
              options={{
                fontSize: editorFontSize,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                fontFamily: 'JetBrains Mono, monospace',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                lineNumbersMinChars: 3,
                glyphMargin: true,
                folding: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
