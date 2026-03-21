import { useState, useCallback, useRef } from 'react';
import { TerminalSession } from '../types';
import { isTauri } from './useFileSystem';

export function useTerminal() {
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([
    { id: 'default', name: 'Terminal', output: ['Aura Terminal v4.0.0 (Cursor Core)', 'Ready for input...'] }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('default');
  const [terminalInput, setTerminalInput] = useState('');
  
  // Ref for Tauri plugins to avoid hook dependency issues with dynamic imports
  const tauriCommandRef = useRef<any>(null);

  const initTauriPlugins = useCallback(async () => {
    if (isTauri) {
      try {
        const { Command } = await import('@tauri-apps/plugin-shell');
        tauriCommandRef.current = Command;
      } catch (e) {
        console.error("Failed to load Tauri shell plugin", e);
      }
    }
  }, []);

  const currentSession = terminalSessions.find(s => s.id === activeTerminalId) || terminalSessions[0];

  const appendTerminalOutput = useCallback((data: string | string[], sessionId?: string) => {
    setTerminalSessions(prev => {
      const targetId = sessionId || activeTerminalId;
      // If targetId is not found (e.g., deleted session), append to active
      const finalTargetId = prev.some(s => s.id === targetId) ? targetId : activeTerminalId;
      const lines = Array.isArray(data) ? data : [data];
      
      return prev.map(s => 
        s.id === finalTargetId ? { ...s, output: [...s.output, ...lines] } : s
      );
    });
  }, [activeTerminalId]);

  const addTerminalSession = useCallback(() => {
    const newId = `term-${Date.now()}`;
    const newSession: TerminalSession = {
      id: newId,
      name: `Terminal ${terminalSessions.length + 1}`,
      output: [`[AURA] New session started at ${new Date().toLocaleTimeString()}`]
    };
    setTerminalSessions(prev => [...prev, newSession]);
    setActiveTerminalId(newId);
  }, [terminalSessions.length]);

  const closeTerminalSession = useCallback((id: string) => {
    setTerminalSessions(prev => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter(s => s.id !== id);
      if (activeTerminalId === id) {
        setActiveTerminalId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeTerminalId]);

  const clearTerminal = useCallback(() => {
    setTerminalSessions(prev => prev.map(s => s.id === activeTerminalId ? { ...s, output: ['Terminal cleared.'] } : s));
  }, [activeTerminalId]);

  return {
    terminalSessions,
    activeTerminalId,
    setActiveTerminalId,
    currentSession,
    terminalInput,
    setTerminalInput,
    appendTerminalOutput,
    addTerminalSession,
    closeTerminalSession,
    clearTerminal,
    initTauriPlugins,
    tauriCommandRef
  };
}
