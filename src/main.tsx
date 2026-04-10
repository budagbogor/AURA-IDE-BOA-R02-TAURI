import { StrictMode, Component, ReactNode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { installGlobalDiagnostics, logDiagnostic } from './utils/diagnostics';

const LazyApp = lazy(() => import('./App.tsx'));

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error: any;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any) {
    console.error('[AURA] IDE bootstrap failed:', error);
    logDiagnostic('error', 'bootstrap', 'IDE bootstrap failed', error?.stack || error?.message || error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#1e1e1e', color: '#ff4444', height: '100vh', fontFamily: 'monospace' }}>
          <h1>AURA IDE MODULE ERROR</h1>
          <p>Modul workspace utama gagal dimuat saat startup.</p>
          <pre style={{ background: '#000', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
            {this.state.error?.stack || this.state.error?.toString() || 'Unknown Error'}
          </pre>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}
            >
              Muat Ulang (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

installGlobalDiagnostics();
logDiagnostic('info', 'bootstrap', 'main.tsx initialized');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex items-center justify-center font-mono">
            <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
              <div className="text-lg font-bold text-white">Loading AURA IDE</div>
              <div className="mt-2 text-sm text-[#858585]">Memuat workspace default...</div>
            </div>
          </div>
        }
      >
        <LazyApp />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>
);
