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
  '[AURA] Workspace siap. Jalankan perintah terminal atau kirim prompt AI untuk mulai membangun project.'
];

export const buildStarterProjectFiles = (projectRoot: string, projectName: string) => {
  const normalizedProjectName = projectName.trim().replace(/[^\w-]+/g, '-');
  const srcRoot = `${projectRoot}/src`;

  return {
    srcRoot,
    filesToWrite: [
      {
        path: `${projectRoot}/package.json`,
        content: JSON.stringify({
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
        }, null, 2)
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
          '</html>'
        ].join('\n')
      },
      {
        path: `${projectRoot}/tsconfig.json`,
        content: JSON.stringify({
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
            strict: true
          },
          include: ['src']
        }, null, 2)
      },
      {
        path: `${projectRoot}/vite.config.ts`,
        content: [
          "import { defineConfig } from 'vite';",
          "import react from '@vitejs/plugin-react';",
          '',
          'export default defineConfig({',
          '  plugins: [react()],',
          '  server: {',
          "    host: '0.0.0.0',",
          '    port: 3000',
          '  }',
          '});'
        ].join('\n')
      },
      {
        path: `${srcRoot}/main.tsx`,
        content: [
          "import React from 'react';",
          "import ReactDOM from 'react-dom/client';",
          "import App from './App';",
          "import './style.css';",
          '',
          "ReactDOM.createRoot(document.getElementById('root')!).render(",
          '  <React.StrictMode>',
          '    <App />',
          '  </React.StrictMode>',
          ');'
        ].join('\n')
      },
      {
        path: `${srcRoot}/App.tsx`,
        content: [
          'export default function App() {',
          '  return (',
          '    <main className="shell">',
          '      <div className="card">',
          '        <p className="eyebrow">AURA Starter</p>',
          `        <h1>${projectName}</h1>`,
          '        <p>Project baru ini dibuat dari AURA IDE dengan fondasi Vite + React + TypeScript yang bersih.</p>',
          '      </div>',
          '    </main>',
          '  );',
          '}'
        ].join('\n')
      },
      {
        path: `${srcRoot}/style.css`,
        content: [
          ':root {',
          "  color-scheme: dark;",
          "  font-family: 'Segoe UI', sans-serif;",
          "  background: #121212;",
          "  color: #f3f3f3;",
          '}',
          '',
          'body {',
          '  margin: 0;',
          '  min-height: 100vh;',
          '  background: radial-gradient(circle at top, #1d3557, #121212 58%);',
          '}',
          '',
          '.shell {',
          '  min-height: 100vh;',
          '  display: grid;',
          '  place-items: center;',
          '  padding: 24px;',
          '}',
          '',
          '.card {',
          '  width: min(720px, 100%);',
          '  border: 1px solid rgba(255,255,255,0.08);',
          '  border-radius: 24px;',
          '  padding: 32px;',
          '  background: rgba(18,18,18,0.82);',
          '  box-shadow: 0 24px 80px rgba(0,0,0,0.35);',
          '}',
          '',
          '.eyebrow {',
          '  margin: 0 0 12px;',
          '  text-transform: uppercase;',
          '  letter-spacing: 0.18em;',
          '  color: #7cc6ff;',
          '  font-size: 12px;',
          '}',
          '',
          'h1 {',
          '  margin: 0 0 16px;',
          '  font-size: clamp(36px, 6vw, 64px);',
          '}',
          '',
          'p {',
          '  margin: 0;',
          '  line-height: 1.7;',
          '  color: #cfd6df;',
          '}'
        ].join('\n')
      }
    ]
  };
};
