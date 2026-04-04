import React from 'react';
import { 
  ChevronRight, X, AlertTriangle, 
  EyeOff, Eye 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

interface StatusBarProps {
  problems: any[];
  activeFile: any;
  openRouterModel: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  problems, activeFile, openRouterModel
}) => {
  const { 
    zenMode, setZenMode, 
    aiProvider, selectedModel
  } = useAppStore();

  return (
    <div className="z-50 flex flex-col shrink-0">
      <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-[11px] gap-4 shadow-2xl backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
          <ChevronRight size={12} />
          <span className="font-medium">main*</span>
        </div>
        <div className="flex items-center gap-3 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
          <div className="flex items-center gap-1">
            <X size={12} className="text-white/70" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle size={12} className="text-white/70" />
            <span>{problems.length}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center h-full">
          <div className="hover:bg-white/10 px-3 h-full flex items-center cursor-pointer transition-colors border-l border-white/10 text-white/70 italic gap-3">
            <span>Ctrl+P Search Files</span>
            <span className="opacity-40">|</span>
            <span>Ctrl+Shift+P Commands</span>
          </div>
          <div 
            onClick={() => setZenMode(!zenMode)}
            className={cn(
              "hover:bg-white/10 px-3 h-full flex items-center cursor-pointer transition-colors border-l border-white/10",
              zenMode && "bg-white/20 text-blue-200"
            )}
            title="Toggle Zen Mode"
          >
            {zenMode ? <EyeOff size={12} className="mr-1" /> : <Eye size={12} className="mr-1" />}
            Zen
          </div>
          <div className="hover:bg-white/10 px-3 h-full flex items-center cursor-pointer transition-colors border-l border-white/10">Spaces: 2</div>
          <div className="hover:bg-white/10 px-3 h-full flex items-center cursor-pointer transition-colors border-l border-white/10 uppercase tracking-tighter opacity-80">UTF-8</div>
          <div className="hover:bg-white/10 px-3 h-full flex items-center cursor-pointer transition-colors border-l border-white/10 font-bold uppercase tracking-widest text-[10px]">{activeFile?.language || 'No File'}</div>
          <div className="flex items-center gap-2 hover:bg-white/10 px-3 h-full cursor-pointer transition-colors border-l border-white/10 bg-white/5" title={`Active Model: ${aiProvider === 'gemini' ? selectedModel : openRouterModel}`}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="font-black tracking-tighter text-[10px]">AURA ONLINE</span>
            <span className="text-white/70 text-[10px] ml-1">({aiProvider === 'gemini' ? selectedModel : openRouterModel})</span>
          </div>
        </div>
      </div>
      <div className="h-5 bg-[#1e1e1e] border-t border-white/5 flex items-center justify-center text-[10px] text-[#858585]">
        &copy; 2026 B.O.A. Indonesia
      </div>
    </div>
  );
};
