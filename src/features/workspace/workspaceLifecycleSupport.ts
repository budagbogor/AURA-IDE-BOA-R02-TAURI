export const getWorkspaceDisplayName = (rootPath: string | null, fallback = 'AURA-WORKSPACE') =>
  rootPath?.split('/').pop()?.toUpperCase() || fallback;

export const buildWorkspaceSessionUpdate = (
  targetPath: string,
  activeTerminalId: string,
  output?: string[]
) => (session: any, index: number) =>
  session.id === activeTerminalId || index === 0
    ? {
        ...session,
        cwd: targetPath,
        ...(output
          ? {
              output,
              commandHistory: [],
              historyIndex: -1
            }
          : {})
      }
    : session;

export const buildCloneTerminalOutput = (repoUrl: string, targetPath: string, outputLines: string[]) => [
  `[AURA] Repository cloned: ${repoUrl}`,
  `[AURA] Opened workspace: ${targetPath}`,
  ...outputLines
];

export const buildCreateProjectTerminalOutput = (projectRoot: string) => [
  `[AURA] Project created: ${projectRoot}`,
  '[AURA] Workspace kosong siap dipakai. Kirim prompt AI untuk generate file sesuai kebutuhan.'
];

export const buildStarterProjectFiles = (projectRoot: string, projectName: string) => {
  const normalizedProjectName = projectName.trim().replace(/[^\w-]+/g, '-');
  const srcRoot = `${projectRoot}/src`;

  return {
    srcRoot,
    initialFilePath: null as string | null,
    filesToWrite: [
      {
        path: `${projectRoot}/package.json`,
        content: `${JSON.stringify({
          name: normalizedProjectName.toLowerCase(),
          private: true,
          version: '0.1.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0'
          },
          devDependencies: {
            vite: '^6.4.1',
            typescript: '^5.8.2',
            '@types/react': '^19.0.10',
            '@types/react-dom': '^19.0.4',
            '@vitejs/plugin-react': '^5.0.4'
          }
        }, null, 2)}\n`
      },
      {
        path: `${projectRoot}/index.html`,
        content: [
          '<!doctype html>',
          '<html lang="en">',
          '  <head>',
          '    <meta charset="UTF-8" />',
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
          `    <title>${projectName}</title>`,
          '  </head>',
          '  <body>',
          '    <div id="root"></div>',
          '    <script type="module" src="/src/main.tsx"></script>',
          '  </body>',
          '</html>',
          ''
        ].join('\n')
      },
      {
        path: `${projectRoot}/tsconfig.json`,
        content: `${JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'Bundler',
            allowImportingTsExtensions: false,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            baseUrl: '.',
            paths: {
              '@/*': ['src/*']
            }
          },
          include: ['src']
        }, null, 2)}\n`
      },
      {
        path: `${projectRoot}/vite.config.ts`,
        content: [
          "import { fileURLToPath, URL } from 'node:url';",
          "import { defineConfig } from 'vite';",
          "import react from '@vitejs/plugin-react';",
          '',
          'export default defineConfig({',
          '  plugins: [react()],',
          '  resolve: {',
          '    alias: {',
          "      '@': fileURLToPath(new URL('./src', import.meta.url))",
          '    }',
          '  },',
          '  server: {',
          "    host: '0.0.0.0',",
          '    port: 3000',
          '  }',
          '});',
          ''
        ].join('\n')
      },
      {
        path: `${srcRoot}/main.tsx`,
        content: [
          "import React from 'react';",
          "import ReactDOM from 'react-dom/client';",
          "import App from './App';",
          "import './index.css';",
          '',
          "ReactDOM.createRoot(document.getElementById('root')!).render(",
          '  <React.StrictMode>',
          '    <App />',
          '  </React.StrictMode>',
          ');',
          ''
        ].join('\n')
      },
      {
        path: `${srcRoot}/App.tsx`,
        content: [
          '// AURA_EMPTY_ENTRY',
          'export default function App() {',
          '  return null;',
          '}',
          ''
        ].join('\n')
      },
      {
        path: `${srcRoot}/index.css`,
        content: ''
      }
    ]
  };
};
