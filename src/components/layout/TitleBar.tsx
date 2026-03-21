import React from 'react';
import { Minus, Square, X, Folder, AlertTriangle } from 'lucide-react';
import { isTauri } from '../../hooks/useFileSystem';

interface TitleBarProps {
  zenMode: boolean;
  projectName: string;
}

export function TitleBar({ zenMode, projectName }: TitleBarProps) {
  if (zenMode || !isTauri) return null;

  return (
    <div data-tauri-drag-region className="h-9 shrink-0 flex items-center justify-between border-b border-white/5 titlebar select-none">
      <div className="flex items-center gap-2 pl-3 pointer-events-none">
        <div className="flex gap-1.5 opacity-50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[11px] font-semibold text-[#cccccc] ml-2 tracking-wide font-sans">AURA AI IDE</span>
        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded ml-1 font-mono">{projectName}</span>
      </div>
      
      <div className="flex h-full">
        <div className="w-11 h-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer titlebar-btn">
          <Minus size={14} className="text-[#cccccc]" />
        </div>
        <div className="w-11 h-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer titlebar-btn">
          <Square size={12} className="text-[#cccccc]" />
        </div>
        <div 
          onClick={() => {
            if((window as any).__TAURI_INTERNALS__) {
              import('@tauri-apps/plugin-process').then(({ exit }) => exit(0));
            }
          }}
          className="w-11 h-full flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer titlebar-btn group"
        >
          <X size={16} className="text-[#cccccc] group-hover:text-white" />
        </div>
      </div>
    </div>
  );
}
