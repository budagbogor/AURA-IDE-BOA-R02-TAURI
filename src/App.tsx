import React, { Suspense, lazy, useEffect } from 'react';
import { logDiagnostic } from './utils/diagnostics';

const AppFull = lazy(() => import('./AppFull'));

const fallbackCard = (
  <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-300">
    Loading workspace...
  </div>
);

export default function App() {
  useEffect(() => {
    logDiagnostic('info', 'app', 'App shell mounted');
  }, []);

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc]">
      <Suspense fallback={<div className="flex h-full items-center justify-center">{fallbackCard}</div>}>
        <AppFull />
      </Suspense>
    </div>
  );
}
