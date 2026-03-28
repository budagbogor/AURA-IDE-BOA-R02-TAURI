import { create } from 'zustand';
import { FileItem, ChatMessage, McpServer } from '@/types';

interface AppState {
  // --- CORE DATA STATE ---
  files: FileItem[];
  activeFileId: string;
  chatMessages: ChatMessage[];
  mcpServers: McpServer[];
  
  // --- ACTIONS ---
  setFiles: (updater: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
  setActiveFileId: (id: string) => void;
  setChatMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setMcpServers: (updater: McpServer[] | ((prev: McpServer[]) => McpServer[])) => void;
}

// Persist MCP servers dari LocalStorage
const getInitialMcpServers = (): McpServer[] => {
  try {
    const stored = localStorage.getItem('aura_mcp_servers');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useAppStore = create<AppState>((set) => ({
  files: [],
  activeFileId: '',
  chatMessages: [],
  mcpServers: getInitialMcpServers(),

  setFiles: (updater) => set((state) => ({ 
    files: typeof updater === 'function' ? updater(state.files) : updater 
  })),
  
  setActiveFileId: (id) => set({ activeFileId: id }),
  
  setChatMessages: (updater) => set((state) => ({ 
    chatMessages: typeof updater === 'function' ? updater(state.chatMessages) : updater 
  })),
  
  setMcpServers: (updater) => set((state) => {
    const newServers = typeof updater === 'function' ? updater(state.mcpServers) : updater;
    // Auto-save ke localStorage tiap kali berubah
    localStorage.setItem('aura_mcp_servers', JSON.stringify(newServers));
    return { mcpServers: newServers };
  })
}));
