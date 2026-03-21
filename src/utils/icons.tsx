import React from 'react';
import { FileCode, FileIcon } from 'lucide-react';

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts': return <FileCode size={14} className="text-blue-400" />;
    case 'jsx':
    case 'js': return <FileCode size={14} className="text-yellow-400" />;
    case 'css': return <FileCode size={14} className="text-blue-500" />;
    case 'html': return <FileCode size={14} className="text-orange-500" />;
    case 'json': return <FileCode size={14} className="text-yellow-600" />;
    case 'md': return <FileCode size={14} className="text-white" />;
    default: return <FileIcon size={14} className="text-gray-400" />;
  }
};
