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
        {/* Judul utama dihapus karena duplikasi dengan OS Title Bar */}
        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono opacity-80">{projectName}</span>
      </div>
      
      {/* System decorations are handled by Windows OS since decorations:true is set */}
    </div>
  );
}
