import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fsEngine } from '../core/fs-engine';

const isTauri =
  typeof window !== 'undefined' &&
  (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  'target'
]);

const TEXT_FILE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'jsonc', 'css', 'scss', 'sass', 'less',
  'html', 'htm', 'md', 'mdx', 'txt', 'yml', 'yaml', 'toml', 'env', 'gitignore', 'npmrc',
  'sh', 'ps1', 'bat', 'cmd', 'rs', 'py', 'java', 'kt', 'go', 'c', 'cpp', 'h', 'hpp', 'cs',
  'php', 'rb', 'swift', 'sql', 'prisma', 'xml', 'svg', 'lock'
]);

const isAbsolutePath = (path: string) => /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('/');

const normalizeNativePath = (path: string) => path.replace(/\\/g, '/').replace(/\/+/g, '/');

const shouldLoadFile = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower === '.env' || lower === '.gitignore') return true;
  const ext = lower.includes('.') ? lower.split('.').pop() || '' : '';
  return TEXT_FILE_EXTENSIONS.has(ext);
};

const resolveProjectPath = (projectRoot: string, filePath: string) => {
  if (isAbsolutePath(filePath)) return normalizeNativePath(filePath);
  return normalizeNativePath(`${projectRoot}/${filePath}`);
};

const shouldIgnorePath = (path: string) => {
  const normalized = normalizeNativePath(path);
  return (
    normalized.includes('/src-tauri/target') ||
    Array.from(IGNORED_DIRECTORIES).some((dir) => normalized.includes(`/${dir}/`) || normalized.endsWith(`/${dir}`))
  );
};

export const useEditor = () => {
  const store = useAppStore();

  const activeFile = useMemo(() => 
    store.files.find(f => f.id === store.activeFileId) || (store.files.length > 0 ? store.files[0] : null)
  , [store.files, store.activeFileId]);

  const handleEditorChange = (value: string) => {
    if (!store.activeFileId) return;
    store.setFiles(prev => prev.map(f => 
      f.id === store.activeFileId ? { ...f, content: value } : f
    ));
  };

  const createNewFile = () => {
    const newId = `new-file-${Date.now()}.ts`;
    const newFile = {
      id: newId,
      name: 'untitled.ts',
      content: '',
      language: 'typescript'
    };
    store.setFiles(prev => [...prev, newFile]);
    store.setActiveFileId(newId);
    store.setSidebarTab('files');
  };

  const scanForProblems = async () => {
    store.setIsScanning(true);
    // Mock scanning logic - in real world this calls a worker or LSP
    setTimeout(() => {
      store.setIsScanning(false);
    }, 1000);
  };

  const onAcceptStaging = () => {
    // Commit staging files to main files
    store.setFiles(prev => {
      let updated = [...prev];
      store.stagingFiles.forEach(s => {
        const idx = updated.findIndex(f => f.id === s.path);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], content: s.newContent };
        } else if (s.action === 'create_or_modify') {
          // If file didn't exist, create it (new files)
          updated.push({
            id: s.path,
            name: s.path.split('/').pop() || 'new-file',
            content: s.newContent,
            language: 'typescript'
          });
        }
      });
      return updated;
    });
    store.setStagingFiles([]);
  };

  const persistFileChange = async (
    path: string,
    content: string,
    action: 'create_or_modify' | 'delete'
  ) => {
    if (!isTauri || !store.nativeProjectPath) return;

    const targetPath = resolveProjectPath(store.nativeProjectPath, path);
    const { mkdir, writeTextFile, remove } = await import('@tauri-apps/plugin-fs');

    if (action === 'delete') {
      await remove(targetPath);
      return;
    }

    const parentDir = targetPath.split('/').slice(0, -1).join('/');
    if (parentDir) {
      await mkdir(parentDir, { recursive: true });
    }
    await writeTextFile(targetPath, content);
  };

  const onDiscardStaging = () => {
    store.setStagingFiles([]);
  };

  const onUpdateStagingStatus = (path: string, status: 'accepted' | 'discarded') => {
    if (status === 'accepted') {
      const staging = store.stagingFiles.find(s => s.path === path);
      if (staging) {
        store.setFiles(prev => prev.map(f => f.id === path ? { ...f, content: staging.newContent } : f));
        void persistFileChange(path, staging.newContent, staging.action).catch((err) => {
          console.error('[AURA] Failed to persist accepted staging file:', err);
        });
      }
    }
    store.setStagingFiles(prev => prev.filter(s => s.path !== path));
  };

  const saveActiveFile = async () => {
    if (!activeFile || !store.nativeProjectPath || !isTauri) return;

    const originalPath = activeFile.path || activeFile.id;
    const targetPath = resolveProjectPath(store.nativeProjectPath, originalPath);
    const { mkdir, writeTextFile } = await import('@tauri-apps/plugin-fs');
    const parentDir = targetPath.split('/').slice(0, -1).join('/');
    if (parentDir) {
      await mkdir(parentDir, { recursive: true });
    }
    await writeTextFile(targetPath, activeFile.content);

    if (activeFile.id !== targetPath || activeFile.path !== targetPath) {
      store.setFiles(prev => prev.map(f =>
        f.id === activeFile.id
          ? { ...f, id: targetPath, path: targetPath, name: targetPath.split('/').pop() || f.name }
          : f
      ));
      store.setActiveFileId(targetPath);
    }
  };

  const persistAcceptedStaging = async () => {
    if (!isTauri || !store.nativeProjectPath || store.stagingFiles.length === 0) return;
    for (const staging of store.stagingFiles) {
      await persistFileChange(staging.path, staging.newContent, staging.action);
    }
  };

  const syncFilesFromNativePath = async (path: string) => {
    if (!path || !isTauri) return;

    const { readDir, readTextFile } = await import('@tauri-apps/plugin-fs');

    const walk = async (dir: string): Promise<any[]> => {
      const entries = await readDir(dir);
      const files: any[] = [];

      for (const entry of entries) {
        if (!entry.name) continue;
        const entryPath = normalizeNativePath(`${dir}/${entry.name}`);

        if (entry.isDirectory) {
          if (IGNORED_DIRECTORIES.has(entry.name) || entryPath.includes('/src-tauri/target')) {
            continue;
          }
          files.push(...await walk(entryPath));
          continue;
        }

        if (!entry.isFile || !shouldLoadFile(entry.name)) continue;

        try {
          const content = await readTextFile(entryPath);
          files.push({
            id: entryPath,
            path: entryPath,
            name: entry.name,
            content,
            language: fsEngine.getLanguageByExtension(entry.name),
            lastModified: Date.now()
          });
        } catch (err) {
          console.warn(`[AURA] Skipping unreadable file: ${entryPath}`, err);
        }
      }

      return files;
    };

    const normalizedRoot = normalizeNativePath(path);
    const loadedFiles = await walk(normalizedRoot);

    store.setNativeProjectPath(normalizedRoot);
    store.setProjectName(normalizedRoot.split('/').pop()?.toUpperCase() || 'AURA-PROJECT');
    store.setFiles(loadedFiles);
    if (loadedFiles.length > 0) {
      const currentExists = loadedFiles.some(f => f.id === store.activeFileId);
      store.setActiveFileId(currentExists ? store.activeFileId : loadedFiles[0].id);
    } else {
      store.setActiveFileId('');
    }
  };

  const syncNativeChanges = async (paths: string[]) => {
    if (!isTauri || !store.nativeProjectPath || paths.length === 0) return;

    const normalizedPaths = [...new Set(paths.map(normalizeNativePath))].filter((path) => !shouldIgnorePath(path));
    if (normalizedPaths.length === 0) return;

    const isLargeBatch = normalizedPaths.length > 50;
    const likelyFolderMove = normalizedPaths.some((path) => {
      const lastSegment = path.split('/').pop() || '';
      return !lastSegment.includes('.');
    });
    if (isLargeBatch || likelyFolderMove) {
      await syncFilesFromNativePath(store.nativeProjectPath);
      return;
    }

    const { exists, stat, readTextFile } = await import('@tauri-apps/plugin-fs');
    let requiresFullResync = false;

    for (const changedPath of normalizedPaths) {
      const fileName = changedPath.split('/').pop() || '';

      try {
        const pathExists = await exists(changedPath);
        if (!pathExists) {
          store.setFiles(prev => prev.filter(f => f.id !== changedPath));
          continue;
        }

        const info = await stat(changedPath);
        if (info.isDirectory) {
          requiresFullResync = true;
          continue;
        }

        if (!shouldLoadFile(fileName)) {
          store.setFiles(prev => prev.filter(f => f.id !== changedPath));
          continue;
        }

        const content = await readTextFile(changedPath);
        store.setFiles(prev => {
          const existingIndex = prev.findIndex(f => f.id === changedPath);
          const nextFile = {
            id: changedPath,
            path: changedPath,
            name: fileName,
            content,
            language: fsEngine.getLanguageByExtension(fileName),
            lastModified: Date.now()
          };

          if (existingIndex === -1) {
            return [...prev, nextFile];
          }

          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...nextFile };
          return updated;
        });
      } catch (err) {
        console.warn(`[AURA] Incremental sync fallback for: ${changedPath}`, err);
        requiresFullResync = true;
      }
    }

    if (requiresFullResync) {
      await syncFilesFromNativePath(store.nativeProjectPath);
      return;
    }

    const nextFiles = useAppStore.getState().files;
    if (nextFiles.length > 0) {
      const currentExists = nextFiles.some(f => f.id === useAppStore.getState().activeFileId);
      if (!currentExists) {
        store.setActiveFileId(nextFiles[0].id);
      }
    } else {
      store.setActiveFileId('');
    }
  };

  return {
    ...store,
    activeFile,
    handleEditorChange,
    createNewFile,
    scanForProblems,
    onAcceptStaging,
    onDiscardStaging,
    onUpdateStagingStatus,
    saveActiveFile,
    persistAcceptedStaging,
    syncFilesFromNativePath,
    syncNativeChanges
  };
};
