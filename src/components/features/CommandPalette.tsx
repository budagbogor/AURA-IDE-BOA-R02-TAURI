import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: { id: string, name: string, action: () => void }[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedIndex: number;
}

export function CommandPalette({ isOpen, onClose, commands, searchQuery, setSearchQuery, selectedIndex }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#252526] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-white/5">
          <Search size={16} className="text-[#858585] mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[#cccccc] text-sm focus:outline-none"
            placeholder="Type a command..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {commands.map((cmd, i) => (
            <div
              key={cmd.id}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              className={`px-4 py-2 text-sm flex items-center justify-between cursor-pointer ${i === selectedIndex ? 'bg-[#0060c0] text-white' : 'text-[#cccccc] hover:bg-[#2d2d2d]'}`}
            >
              <span>{cmd.name}</span>
            </div>
          ))}
          {commands.length === 0 && (
            <div className="p-4 text-center text-[#858585] text-sm">
              No commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
