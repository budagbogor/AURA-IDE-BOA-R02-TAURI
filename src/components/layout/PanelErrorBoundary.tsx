import React, { Component, ReactNode } from 'react';

interface PanelErrorBoundaryProps {
  title: string;
  children: ReactNode;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  constructor(props: PanelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[AURA] Panel crash: ${this.props.title}`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="text-sm font-bold uppercase tracking-wide">{this.props.title} crashed</div>
          <div className="mt-2 text-xs opacity-80">
            {this.state.error?.toString() || 'Unknown panel error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
