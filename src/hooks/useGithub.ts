import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fetchUserRepos, fetchUserProfile, cloneRepository } from '../services/githubService';

interface UseGithubProps {
  isTauri: boolean;
  tauriDialog: any;
  tauriFs: any;
  appendTerminalOutput: (data: string | string[]) => void;
  setNativeProjectPath: (path: string | null) => void;
  setFiles: (files: any[]) => void;
  syncFilesFromNativePath: (path: string) => Promise<void>;
  setProjectName: (name: string) => void;
  setSidebarTab: (tab: string) => void;
  setActiveFileId: (id: string) => void;
  setTestingStatus: any;
  setTestError: any;
}

export const useGithub = ({
  isTauri,
  tauriDialog,
  tauriFs,
  appendTerminalOutput,
  setNativeProjectPath,
  setFiles,
  syncFilesFromNativePath,
    setProjectName,
    setSidebarTab,
    setActiveFileId,
    setTestingStatus,
    setTestError
}: UseGithubProps) => {
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('aura_github_token') || '');
  const [githubUser, setGithubUser] = useState<any | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_github_token', githubToken);
    if (githubToken) {
      const loadProfile = async () => {
        try {
          const profile = await fetchUserProfile(githubToken);
          setGithubUser(profile);
          setGithubConnected(true);
          
          if (githubRepos.length === 0) {
            const repos = await fetchUserRepos(githubToken);
            setGithubRepos(repos);
          }
        } catch (err) {
          console.error("Failed to load GitHub profile:", err);
          setGithubConnected(false);
          setGithubUser(null);
        }
      };
      loadProfile();
    } else {
      setGithubConnected(false);
      setGithubUser(null);
      setGithubRepos([]);
    }
  }, [githubToken]);

  const testGithubConnection = async () => {
    if (!githubToken) return;
    setTestingStatus((prev: any) => ({ ...prev, github: 'loading' }));
    try {
      const profile = await fetchUserProfile(githubToken);
      setGithubUser(profile);
      setGithubConnected(true);
      setTestingStatus((prev: any) => ({ ...prev, github: 'success' }));
      appendTerminalOutput(`[GITHUB] Koneksi berhasil! Terhubung sebagai @${profile.login}`);
    } catch (err: any) {
      setGithubConnected(false);
      setTestingStatus((prev: any) => ({ ...prev, github: 'error' }));
      setTestError((prev: any) => ({ ...prev, github: err.message }));
      appendTerminalOutput(`[GITHUB ERROR] ${err.message}`);
    }
  };

  const handleCloneRepo = async (repo: any) => {
    if (!githubToken) return;

    let selectedPath: string | null = null;
    let projectDirHandle: any = null;

    if (isTauri && tauriDialog) {
      try {
        const selected = await tauriDialog.open({
          directory: true,
          multiple: false,
          title: `Pilih Folder untuk Meng-clone ${repo.name}`
        });
        if (selected && typeof selected === 'string') {
          selectedPath = `${selected.replace(/\\/g, '/')}/${repo.name}`;
          appendTerminalOutput(`[GITHUB] Target folder (Native): ${selectedPath}`);
        } else {
          appendTerminalOutput('[GITHUB] Clone dibatalkan oleh pengguna.');
          return;
        }
      } catch (err) {
        console.error('Tauri Dialog Error:', err);
        return;
      }
    } else {
      try {
        // @ts-ignore
        const baseDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        projectDirHandle = await baseDirHandle.getDirectoryHandle(repo.name, { create: true });
      } catch (err) {
        appendTerminalOutput('[GITHUB] Clone cancelled. Please select a folder.');
        return;
      }
    }

    setIsFetchingRepos(true);
    appendTerminalOutput(`[GITHUB] Cloning repository ${repo.full_name}...`);
    
    try {
      const clonedFiles = await cloneRepository(githubToken, repo.owner.login, repo.name);
      
      if (clonedFiles.length > 0) {
        appendTerminalOutput(`[SYSTEM] Menyimpan ${clonedFiles.length} file...`);
        
        if (selectedPath && tauriFs) {
          try { await tauriFs.mkdir(selectedPath, { recursive: true }); } catch (e) {}

          for (const file of clonedFiles) {
            const pathParts = file.id.split('/');
            const fileName = pathParts.pop()!;
            let currentPath = selectedPath;
            
            for (const dirName of pathParts) {
              currentPath = `${currentPath}/${dirName}`;
              try { await tauriFs.mkdir(currentPath, { recursive: true }); } catch (e) {}
            }
            await tauriFs.writeTextFile(`${currentPath}/${fileName}`, file.content);
          }
          
          setNativeProjectPath(selectedPath);
          const mappedFiles = clonedFiles.map(f => ({
            ...f,
            id: `${selectedPath}/${f.id}`
          }));
          setFiles(mappedFiles);
          await syncFilesFromNativePath(selectedPath);
          appendTerminalOutput(`[SUCCESS] Clone berhasil! Terminal kini aktif di: ${selectedPath}`);
          alert(`Berhasil meng-clone ke ${selectedPath}.`);
        } else if (projectDirHandle) {
          for (const file of clonedFiles) {
            const pathParts = file.id.split('/');
            const fileName = pathParts.pop()!;
            let currentDir = projectDirHandle;
            for (const dirName of pathParts) {
              currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
            }
            const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file.content);
            await writable.close();
          }
          setFiles(clonedFiles);
        }

        setProjectName(repo.name.toUpperCase());
        setSidebarTab('files');
        if (clonedFiles.length > 0) setActiveFileId(clonedFiles[0].id);
      } else {
        appendTerminalOutput(`[GITHUB] Repository ${repo.full_name} is empty.`);
      }
    } catch (error) {
      appendTerminalOutput(`[GITHUB] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const store = useAppStore();

  return {
    ...store,
    githubConnected,
    githubToken,
    setGithubToken,
    githubUser,
    setGithubUser,
    githubRepos,
    setGithubRepos,
    isFetchingRepos,
    setIsFetchingRepos,
    handleCloneRepo,
    testGithubConnection
  };
};
