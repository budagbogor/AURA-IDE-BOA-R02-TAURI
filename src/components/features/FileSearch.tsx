import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FileItem } from '../../types';
import { getFileIcon } from '../../utils/icons';

interface FileSearchProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedIndex: number;
  onSelectFile: (id: string) => void;
}

export function FileSearch({ isOpen, onClose, files, searchQuery, setSearchQuery, selectedIndex, onSelectFile }: FileSearchProps) {
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
      <div className="relative bg-[#252526] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#1e1e1e]">
          <Search size={16} className="text-blue-400 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white text-[13px] focus:outline-none placeholder:text-[#858585]"
            placeholder="Search files by name or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto bg-[#252526] p-1">
          {files.map((file, i) => (
            <div
              key={file.id}
              onClick={() => {
                onSelectFile(file.id);
                onClose();
              }}
              className={`px-3 py-2 text-[13px] rounded-lg flex flex-col cursor-pointer transition-colors m-1 ${i === selectedIndex ? 'bg-blue-600 shadow-md text-white' : 'text-[#cccccc] hover:bg-[#2d2d2d]'}`}
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file.name)}
                <span className="font-medium">{file.name}</span>
              </div>
              {file.path && <span className="text-[10px] opacity-50 mt-1 ml-5 truncate">{file.path}</span>}
            </div>
          ))}
          {files.length === 0 && (
            <div className="p-8 text-center text-[#858585] flex flex-col items-center gap-3">
              <Search size={32} className="opacity-20" />
              <div className="text-[13px]">No files found matching your search.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
