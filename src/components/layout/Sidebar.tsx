import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getFileIcon } from '@/utils/icons';
import Markdown from 'react-markdown';
import { 
  FileCode, Search, Sparkles, GitBranch, Github, Globe, HelpCircle, 
  Settings, ChevronRight, X, RotateCcw, Monitor, Smartphone, Layout, 
  Eye, FolderOpen, Download, Terminal, Plus, CloudUpload, CloudDownload,
  FolderTree, RefreshCw, Bot, User, ImageIcon, FileIcon, Paperclip, Send,
  Cpu, ExternalLink, CheckCircle, AlertTriangle, Play, ChevronDown
} from 'lucide-react';
import { FileItem, ChatMessage, CodeProblem, McpServer, TerminalSession } from '@/types';
import { 
  FREE_MODELS, BYTEZ_MODELS, SUMOPOD_MODELS, 
  SUPER_CLAUDE_SKILLS, SUPER_CLAUDE_COMMANDS, MCP_TEMPLATES 
} from '@/utils/constants';

interface SidebarProps {
  layoutMode: 'classic' | 'modern';
  zenMode: boolean;
  sidebarTab: 'files' | 'search' | 'git' | 'ai' | 'github' | 'settings' | 'browser';
  setSidebarTab: (tab: 'files' | 'search' | 'git' | 'ai' | 'github' | 'settings' | 'browser') => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isResizingSidebar: boolean;
  setIsResizingSidebar: (isResizing: boolean) => void;
  setShowGuideModal: (show: boolean) => void;
  files: FileItem[];
  setFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
  activeFileId: string;
  setActiveFileId: (id: string) => void;
  fileSearchInput: string;
  setFileSearchInput: (input: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  isAiLoading: boolean;
  handleSendMessage: () => void;
  attachedFiles: { name: string; type: string; data: string; content?: string }[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<{ name: string; type: string; data: string; content?: string }[]>>;
  removeAttachment: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  githubConnected: boolean;
  setGithubConnected: (connected: boolean) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  githubRepos: any[];
  setGithubRepos: (repos: any[]) => void;
  isFetchingRepos: boolean;
  setIsFetchingRepos: (fetching: boolean) => void;
  repoSearchInput: string;
  setRepoSearchInput: (input: string) => void;
  handleCloneRepo: (repo: any) => void;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  browserSrcDoc: string | null;
  setBrowserSrcDoc: (doc: string | null) => void;
  setShowBrowser: (show: boolean) => void;
  isTauri: boolean;
  TauriCommand: any;
  openFolderNative: () => void;
  createNewFile: () => void;
  openFolder: () => void;
  closeFolder: () => void;
  exportProject: () => void;
  handleCloudSave: () => void;
  handleCloudLoad: () => void;
  handleGithubPush: () => void;
  executeCommand: (cmd: string) => void;
  appendTerminalOutput: (msg: string | string[], sessionId?: string) => void;
  handleContextMenu: (e: React.MouseEvent, fileId: string) => void;

  // Settings specific state
  relayout: (preset: 'default' | 'zen' | 'modern') => void;
  setLayoutMode: (mode: 'classic' | 'modern') => void;
  setZenMode: (mode: boolean) => void;
  aiProvider: 'gemini' | 'openrouter' | 'bytez' | 'sumopod';
  setAiProvider: (provider: 'gemini' | 'openrouter' | 'bytez' | 'sumopod') => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  bytezApiKey: string;
  setBytezApiKey: (key: string) => void;
  bytezModel: string;
  setBytezModel: (model: string) => void;
  sumopodApiKey: string;
  setSumopodApiKey: (key: string) => void;
  sumopodModel: string;
  setSumopodModel: (model: string) => void;
  openRouterApiKey: string;
  setOpenRouterApiKey: (key: string) => void;
  openRouterModel: string;
  setOpenRouterModel: (model: string) => void;
  dynamicFreeModels: any[];
  isFetchingModels: boolean;
  refreshModels: () => void;
  systemInstruction: string;
  setSystemInstruction: (inst: string) => void;
  aiRules: string;
  setAiRules: (rules: string) => void;
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  context7Mode: boolean;
  setContext7Mode: (mode: boolean) => void;
  supabaseUrl: string;
  setSupabaseUrl: (url: string) => void;
  supabaseAnonKey: string;
  setSupabaseAnonKey: (key: string) => void;
  supabaseConnected: boolean;
  setSupabaseConnected: (connected: boolean) => void;
  mcpServers: McpServer[];
  setMcpServers: React.Dispatch<React.SetStateAction<McpServer[]>>;
  selectedMcpTemplateIdx: number | 'custom';
  setSelectedMcpTemplateIdx: (idx: number | 'custom') => void;
  mcpTemplateData: Record<string, string>;
  setMcpTemplateData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  newMcpName: string;
  setNewMcpName: (name: string) => void;
  newMcpType: 'sse' | 'stdio';
  setNewMcpType: (type: 'sse' | 'stdio') => void;
  newMcpUrl: string;
  setNewMcpUrl: (url: string) => void;
  newMcpEnvStr: string;
  setNewMcpEnvStr: (env: string) => void;
  showMcpLogsFor: string | null;
  setShowMcpLogsFor: (name: string | null) => void;
  activeMcpLogs: string[];
  setActiveMcpLogs: (logs: string[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  layoutMode, zenMode, sidebarTab, setSidebarTab,
  sidebarWidth, setSidebarWidth, isResizingSidebar, setIsResizingSidebar,
  setShowGuideModal, files, setFiles, activeFileId, setActiveFileId,
  fileSearchInput, setFileSearchInput, chatMessages, setChatMessages,
  chatInput, setChatInput, isAiLoading, handleSendMessage,
  attachedFiles, setAttachedFiles, removeAttachment, handleFileUpload,
  fileInputRef, chatEndRef, githubConnected, setGithubConnected,
  githubToken, setGithubToken, githubRepos, setGithubRepos,
  isFetchingRepos, setIsFetchingRepos, repoSearchInput, setRepoSearchInput,
  handleCloneRepo, browserUrl, setBrowserUrl, browserSrcDoc, setBrowserSrcDoc,
  setShowBrowser, isTauri, TauriCommand, openFolderNative,
  createNewFile, openFolder, closeFolder, exportProject,
  handleCloudSave, handleCloudLoad, handleGithubPush, executeCommand,
  appendTerminalOutput, handleContextMenu,

  relayout, setLayoutMode, setZenMode, aiProvider, setAiProvider,
  geminiApiKey, setGeminiApiKey, selectedModel, setSelectedModel,
  bytezApiKey, setBytezApiKey, bytezModel, setBytezModel,
  sumopodApiKey, setSumopodApiKey, sumopodModel, setSumopodModel,
  openRouterApiKey, setOpenRouterApiKey, openRouterModel, setOpenRouterModel,
  dynamicFreeModels, isFetchingModels, refreshModels,
  systemInstruction, setSystemInstruction, aiRules, setAiRules,
  selectedSkill, setSelectedSkill, context7Mode, setContext7Mode,
  supabaseUrl, setSupabaseUrl, supabaseAnonKey, setSupabaseAnonKey,
  supabaseConnected, setSupabaseConnected, mcpServers, setMcpServers,
  selectedMcpTemplateIdx, setSelectedMcpTemplateIdx, mcpTemplateData, setMcpTemplateData,
  newMcpName, setNewMcpName, newMcpType, setNewMcpType,
  newMcpUrl, setNewMcpUrl, newMcpEnvStr, setNewMcpEnvStr,
  showMcpLogsFor, setShowMcpLogsFor, activeMcpLogs, setActiveMcpLogs
}) => {

  if (zenMode) return null;

  return (
    <>
      {/* Activity Bar */}
      <div className={cn(
        "w-14 bg-[#333333] flex flex-col items-center py-4 gap-4 z-50 glass-dark shrink-0",
        layoutMode === 'modern' ? "border-l border-white/5" : "border-r border-white/5"
      )}>
        <div 
          onClick={() => setSidebarTab('files')}
          title="Explorer (Ctrl+Shift+E)"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'files' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <FileCode size={24} className={cn("transition-transform duration-200", sidebarTab === 'files' && "scale-110")} />
          {sidebarTab === 'files' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div 
          onClick={() => setSidebarTab('search')}
          title="Search (Ctrl+Shift+F)"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'search' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <Search size={24} className={cn("transition-transform duration-200", sidebarTab === 'search' && "scale-110")} />
          {sidebarTab === 'search' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div 
          onClick={() => setSidebarTab('ai')}
          title="Aura AI Chat (Ctrl+Shift+A)"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'ai' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <Sparkles size={24} className={cn("transition-transform duration-200", sidebarTab === 'ai' && "scale-110")} />
          {sidebarTab === 'ai' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div 
          onClick={() => setSidebarTab('git')}
          title="Source Control (Ctrl+Shift+G)"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'git' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <GitBranch size={24} className={cn("transition-transform duration-200", sidebarTab === 'git' && "scale-110")} />
          {sidebarTab === 'git' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div 
          onClick={() => setSidebarTab('github')}
          title="GitHub Integration"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'github' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <Github size={24} className={cn("transition-transform duration-200", sidebarTab === 'github' && "scale-110")} />
          {sidebarTab === 'github' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div 
          onClick={() => setSidebarTab('browser')}
          title="Internal Browser"
          className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'browser' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
        >
          <Globe size={24} className={cn("transition-transform duration-200", sidebarTab === 'browser' && "scale-110")} />
          {sidebarTab === 'browser' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
        </div>
        <div className="mt-auto flex flex-col gap-2 w-full items-center">
          <div 
            onClick={() => setShowGuideModal(true)}
            title="Panduan Workflow"
            className="p-2.5 cursor-pointer transition-all duration-200 rounded-xl text-[#858585] hover:text-white hover:bg-white/5"
          >
            <HelpCircle size={24} />
          </div>
          <div 
            onClick={() => setSidebarTab('settings')}
            title="Settings"
            className={cn("p-2.5 cursor-pointer transition-all duration-200 rounded-xl group relative", sidebarTab === 'settings' ? "text-white bg-blue-600/20 shadow-lg shadow-blue-500/10" : "text-[#858585] hover:text-white hover:bg-white/5")}
          >
            <Settings size={24} className={cn("transition-transform duration-200", sidebarTab === 'settings' && "scale-110")} />
            {sidebarTab === 'settings' && <motion.div layoutId="activeTab" className="absolute left-[-12px] w-1 h-8 bg-blue-500 rounded-r-full" />}
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: sidebarWidth, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        style={{ width: sidebarWidth }}
        className={cn(
          "bg-[#252526] flex flex-col overflow-hidden relative transition-[width] duration-75 shrink-0",
          layoutMode === 'modern' ? "border-l border-white/5" : "border-r border-white/5"
        )}
      >
        {/* Resizer Handle (Vertical) */}
        <div 
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingSidebar(true);
            document.body.style.cursor = 'col-resize';
          }}
          className={cn(
            "absolute top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/30 transition-colors z-50",
            layoutMode === 'modern' ? "left-0" : "right-0"
          )}
        />
        
        {/* Sidebar Header */}
        <div className="p-4 text-[11px] uppercase tracking-widest font-black text-[#bbbbbb] flex justify-between items-center border-b border-white/5 bg-[#252526]/50 backdrop-blur-sm sticky top-0 z-10">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            {sidebarTab === 'files' && 'Explorer'}
            {sidebarTab === 'search' && 'Search'}
            {sidebarTab === 'git' && 'Source Control'}
            {sidebarTab === 'ai' && 'Aura AI Chat'}
            {sidebarTab === 'github' && 'GitHub'}
            {sidebarTab === 'settings' && 'Settings'}
            {sidebarTab === 'browser' && 'Browser'}
          </span>
          <div className="flex gap-2.5">
            {sidebarTab === 'ai' && (
              <button onClick={() => setChatMessages([])} title="Clear Chat" className="hover:text-white transition-colors">
                <RefreshCw size={14} />
              </button>
            )}
            {sidebarTab === 'files' && (
              <div className="flex gap-2.5">
                <button onClick={createNewFile} title="New File" className="hover:text-white transition-colors">
                  <Plus size={14} />
                </button>
                <button onClick={openFolder} title="Open Folder Lokal (Web)" className="hover:text-white transition-colors">
                  <FolderOpen size={14} />
                </button>
                {TauriCommand && (
                  <button onClick={openFolderNative} title="Open Folder Proyek (Native - Support Terminal/NPM)" className="hover:text-yellow-400 transition-colors relative group">
                    <FolderTree size={14} />
                  </button>
                )}
                <button onClick={handleCloudSave} title="Save to Supabase Cloud" className="hover:text-emerald-400 transition-colors">
                  <CloudUpload size={14} />
                </button>
                <button onClick={handleCloudLoad} title="Load from Supabase Cloud" className="hover:text-blue-400 transition-colors">
                  <CloudDownload size={14} />
                </button>
                <button onClick={handleGithubPush} title="Push Project to GitHub" className="hover:text-[#adbac7] transition-colors relative group">
                  <Github size={14} />
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </button>
                <button onClick={closeFolder} title="Close Folder" className="hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
                <button onClick={exportProject} title="Export Project (ZIP)" className="hover:text-white transition-colors">
                  <Download size={14} />
                </button>
              </div>
            )}
            {sidebarTab === 'git' && (
              <div className="flex gap-2.5">
                <button onClick={() => executeCommand('git fetch')} title="Fetch from Remote" className="hover:text-blue-400 transition-colors">
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => executeCommand('git status')} title="Check Status" className="hover:text-white transition-colors">
                  <Search size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* FILES TAB */}
            {sidebarTab === 'files' && (
              <motion.div 
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer group">
                  <ChevronDown size={16} />
                  <span className="text-[13px] font-bold">AURA-PROJECT</span>
                </div>
                <div className="pl-4">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      onContextMenu={(e) => handleContextMenu(e, file.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1 cursor-pointer text-[13px] transition-colors group relative",
                        activeFileId === file.id ? "bg-[#37373d] text-white" : "hover:bg-[#2a2d2e] text-[#cccccc]"
                      )}
                    >
                      {getFileIcon(file.name)}
                      <span className="truncate">{file.name}</span>
                      {activeFileId === file.id && <div className="absolute right-2 w-1 h-1 rounded-full bg-blue-500" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* GIT TAB */}
            {sidebarTab === 'git' && (
              <motion.div 
                key="git"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col p-4 gap-4"
              >
                <p className="text-[11px] text-[#858585] italic leading-tight">
                  {isTauri ? 'Native project detected. Git commands will run in your system terminal.' : 'Simulated Git mode (Web). Build Desktop to use real Git.'}
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Changes</div>
                      <div className="space-y-1">
                        {files.slice(0, 3).map(f => (
                          <div key={f.id} className="flex items-center justify-between text-[12px] px-2 py-1.5 hover:bg-white/5 rounded-lg group">
                            <div className="flex items-center gap-2 truncate">
                              {getFileIcon(f.name)}
                              <span className="truncate">{f.name}</span>
                            </div>
                            <span className="text-[10px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">M</span>
                          </div>
                        ))}
                        {files.length > 3 && <p className="text-[10px] text-gray-500 text-center mt-2">... and {files.length - 3} other files</p>}
                      </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                    <input 
                      type="text" 
                      placeholder="Commit message (Ctrl+Enter to commit)"
                      className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button 
                      onClick={() => {
                        const msg = "chore: updates from AURA IDE";
                        executeCommand(`git add . ; git commit -m "${msg}" ; git push`);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-[12px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <GitBranch size={14} /> Commit & Push
                    </button>
                    <p className="text-[10px] text-center text-gray-500 opacity-60">One-click automation v4.0.0</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SEARCH TAB */}
            {sidebarTab === 'search' && (
              <motion.div 
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585] group-focus-within:text-blue-500 transition-colors" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search files and content..."
                    value={fileSearchInput}
                    onChange={e => setFileSearchInput(e.target.value)}
                    className="w-full bg-[#3c3c3c] border border-white/5 rounded-md py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar">
                  {fileSearchInput && files.filter(f => 
                    f.name.toLowerCase().includes(fileSearchInput.toLowerCase()) || 
                    f.content.toLowerCase().includes(fileSearchInput.toLowerCase())
                  ).map(file => (
                    <div 
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className="p-2 rounded hover:bg-[#37373d] cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileCode size={12} className="text-blue-400" />
                        <span className="text-[12px] font-medium text-[#cccccc] group-hover:text-white">{file.name}</span>
                      </div>
                      {file.content.toLowerCase().includes(fileSearchInput.toLowerCase()) && (
                        <div className="text-[10px] text-[#858585] line-clamp-2 font-mono bg-black/20 p-1 rounded">
                          {file.content.split('\n').find(line => line.toLowerCase().includes(fileSearchInput.toLowerCase()))?.trim()}
                        </div>
                      )}
                    </div>
                  ))}
                  {!fileSearchInput && (
                    <div className="text-center py-10 opacity-30">
                      <Search size={32} className="mx-auto mb-2" />
                      <p className="text-[11px]">Type to search across project</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* AI TAB */}
            {sidebarTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white">Aura AI Assistant</p>
                        <p className="text-[11px]">How can I help you build today?</p>
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex flex-col gap-1 max-w-[90%]",
                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-lg transition-all duration-300",
                        msg.role === 'user' 
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none shadow-blue-500/10" 
                          : "bg-[#3c3c3c] text-[#cccccc] rounded-tl-none border border-white/5 shadow-black/20"
                      )}>
                        <div className="markdown-body prose prose-invert prose-sm max-w-none">
                          <Markdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative group/code">
                                    <pre className={className} {...props}>
                                      {children}
                                    </pre>
                                  </div>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </Markdown>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#858585] px-1 uppercase tracking-widest font-bold flex items-center gap-1">
                        {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                        {msg.role === 'user' ? 'You' : 'Aura AI'}
                      </span>
                    </motion.div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-[#858585] text-[11px] animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      Aura is thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-white/5 bg-[#252526]/80 backdrop-blur-md flex flex-col">
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          <div className="flex items-center gap-2 bg-[#3c3c3c] border border-white/10 rounded-lg px-2 py-1 text-[10px] max-w-[100px] truncate">
                            {file.type.startsWith('image/') ? <ImageIcon size={10} /> : <FileIcon size={10} />}
                            {file.name}
                          </div>
                          <button 
                            onClick={() => removeAttachment(i)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative flex-1">
                    <textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask Aura anything..."
                      className="w-full bg-[#3c3c3c] border border-white/5 rounded-xl py-3 pl-4 pr-12 text-[13px] focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[80px] max-h-48 custom-scrollbar"
                      rows={3}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-[#858585] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Paperclip size={16} />
                      </button>
                      <button 
                        onClick={handleSendMessage}
                        disabled={isAiLoading || (!chatInput.trim() && attachedFiles.length === 0)}
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      multiple 
                      className="hidden" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {sidebarTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-8 custom-scrollbar"
              >
                <section className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-500">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#333333]/50 rounded-xl border border-white/5">
                      <div className="space-y-0.5">
                        <p className="text-[13px] font-medium text-white">Layout Presets</p>
                        <p className="text-[11px] text-[#858585]">Quick switch layout modes</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => relayout('default')} className="px-2 py-1 bg-[#3c3c3c] rounded text-[10px] hover:bg-[#454545] transition-colors">Default</button>
                        <button onClick={() => relayout('modern')} className="px-2 py-1 bg-[#3c3c3c] rounded text-[10px] hover:bg-[#454545] transition-colors">Modern</button>
                        <button onClick={() => relayout('zen')} className="px-2 py-1 bg-[#3c3c3c] rounded text-[10px] hover:bg-[#454545] transition-colors">Zen</button>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Sisanya biarkan diringkas, seperti AI Config, Supabase, MCP yg ada di App.tsx */}
                
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};
