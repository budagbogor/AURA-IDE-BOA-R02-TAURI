import { useState, useCallback } from 'react';
import { FileItem } from '../types';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Helper to check if running in Tauri desktop mode
export const isTauri = !!(window as any).__TAURI_INTERNALS__;

export function useFileSystem(appendTerminalOutput: (msg: string | string[]) => void) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [projectName, setProjectName] = useState('AURA-PROJECT');
  const [nativeProjectPath, setNativeProjectPath] = useState<string | null>(null);

  const activeFile = files.find(f => f.id === activeFileId) || (files.length > 0 ? files[0] : null);

  const updateFileContent = useCallback((id: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content: newContent } : f));
  }, []);

  const createNewFile = useCallback(() => {
    setFiles(prev => {
      const newFile: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: `new-file-${prev.length + 1}.ts`,
        content: '',
        language: 'typescript'
      };
      setActiveFileId(newFile.id);
      return [...prev, newFile];
    });
  }, []);

  const closeFolder = useCallback(() => {
    setFiles([]);
    setActiveFileId('');
    setProjectName('AURA-PROJECT');
    setNativeProjectPath(null);
    appendTerminalOutput('Folder closed.');
  }, [appendTerminalOutput]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    if (!newName) return;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(newFiles.length > 0 ? newFiles[0].id : '');
      }
      return newFiles;
    });
  }, [activeFileId]);

  const exportProject = useCallback(async () => {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName.toLowerCase()}.zip`);
    appendTerminalOutput(`Project exported as ${projectName.toLowerCase()}.zip`);
  }, [files, projectName, appendTerminalOutput]);

  const handleSaveFile = useCallback(async () => {
    if (!activeFile) return;
    
    if (isTauri && activeFile.path) {
      try {
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        await writeTextFile(activeFile.path, activeFile.content);
        appendTerminalOutput(`[SYSTEM] File saved to disk: ${activeFile.path}`);
      } catch (err: any) {
        console.error("Desktop Save Error:", err);
        appendTerminalOutput(`[ERROR] Failed to save native file: ${err.message}`);
      }
    } else {
      // Web Mode: Download via file-saver
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      saveAs(blob, activeFile.name);
      appendTerminalOutput(`[AURA] File downloaded: ${activeFile.name}`);
    }
  }, [activeFile, appendTerminalOutput]);

  const openFolderWeb = useCallback(async () => {
    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      const newFiles: FileItem[] = [];
      
      async function scan(handle: any) {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const content = await file.text();
            const ext = file.name.split('.').pop();
            newFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              content: content,
              language: ext === 'ts' || ext === 'tsx' ? 'typescript' : ext === 'js' || ext === 'jsx' ? 'javascript' : ext || 'plaintext'
            });
          }
        }
      }
      
      await scan(dirHandle);
      if (newFiles.length > 0) {
        setFiles(newFiles);
        setActiveFileId(newFiles[0].id);
        setNativeProjectPath(null); 
        setProjectName(dirHandle.name.toUpperCase());
        appendTerminalOutput([
          `Opened folder: ${dirHandle.name}`, 
          `Loaded ${newFiles.length} files.`, 
          `[WARNING] Folder dibuka via Browser API. Terminal tidak mendukung perintah sistem (npm/git) dalam mode ini.`
        ]);
      }
    } catch (err) {
      console.error('Error opening folder:', err);
      appendTerminalOutput('Error: Could not open local folder. (Browser may block this in iframes)');
    }
  }, [appendTerminalOutput]);

  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile,
    projectName,
    setProjectName,
    nativeProjectPath,
    setNativeProjectPath,
    updateFileContent,
    createNewFile,
    closeFolder,
    renameFile,
    deleteFile,
    exportProject,
    handleSaveFile,
    openFolderWeb
  };
}
