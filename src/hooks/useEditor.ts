import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  path?: string;
  lastModified?: number;
}

export interface CodeProblem {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface StagingFile {
  path: string;
  originalContent: string;
  newContent: string;
  action: 'create_or_modify' | 'delete';
  status: 'pending' | 'accepted' | 'rejected';
}

export const useEditor = () => {
  const files = useAppStore(state => state.files);
  const setFiles = useAppStore(state => state.setFiles);
  const activeFileId = useAppStore(state => state.activeFileId);
  const setActiveFileId = useAppStore(state => state.setActiveFileId);
  const [projectName, setProjectName] = useState('AURA-PROJECT');
  const [problems, setProblems] = useState<CodeProblem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [nativeProjectPath, setNativeProjectPath] = useState<string | null>(null);
  const [stagingFiles, setStagingFiles] = useState<StagingFile[]>([]);
  const [autoFixTrigger, setAutoFixTrigger] = useState(0);
  const [autoFixMsg, setAutoFixMsg] = useState("");

  const activeFile = useMemo(() => 
    files.find(f => f.id === activeFileId) || (files.length > 0 ? files[0] : null)
  , [files, activeFileId]);

  return {
    files, setFiles,
    activeFileId, setActiveFileId,
    activeFile,
    projectName, setProjectName,
    problems, setProblems,
    isScanning, setIsScanning,
    editorFontSize, setEditorFontSize,
    nativeProjectPath, setNativeProjectPath,
    stagingFiles, setStagingFiles,
    autoFixTrigger, setAutoFixTrigger,
    autoFixMsg, setAutoFixMsg
  };
};
