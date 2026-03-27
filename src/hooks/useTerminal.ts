import { useState } from 'react';
import { TerminalSession } from '../types';

export const useTerminal = () => {
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([
    { id: 'default', name: 'Terminal', output: ['\u001b[36m⚡ AURA TERMINAL ENGINE V5.0.0\u001b[0m', 'Ready for intelligent development...', ''] }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('default');
  
  const currentSession = terminalSessions.find(s => s.id === activeTerminalId) || terminalSessions[0];

  const appendTerminalOutput = (data: string | string[], sessionId?: string) => {
    const targetId = sessionId || activeTerminalId;
    const lines = Array.isArray(data) ? data : [data];
    
    // 1. Update React State for historical persistence
    setTerminalSessions(prev => prev.map(s => 
      s.id === targetId ? { ...s, output: [...s.output, ...lines] } : s
    ));

    // 2. Direct-Write EventBus for real-time high-throughput rendering
    window.dispatchEvent(new CustomEvent('terminal-write', {
      detail: { id: targetId, data: lines.join('\n') }
    }));

    // 3. --- ERROR LOGGING (tanpa Self-Healing dispatch untuk mencegah infinite loop) ---
    const errorPatterns = [
      /npm ERR!/i, /ReferenceError/i, /TypeError/i, 
      /SyntaxError/i, /command not found/i
    ];

    const hasError = lines.some(line => errorPatterns.some(pattern => pattern.test(line)));
    if (hasError) {
      const errorMsg = lines.find(line => errorPatterns.some(pattern => pattern.test(line))) || 'Unknown Error';
      console.warn('[AURA Terminal Error Detected]', errorMsg);
      // TIDAK dispatch terminal-error event — ini mencegah infinite loop AI auto-fix.
    }
  };

  const addTerminalSession = () => {
    const newId = `term-${Date.now()}`;
    const newSession: TerminalSession = {
      id: newId,
      name: `Terminal ${terminalSessions.length + 1}`,
      output: [`[AURA] New session started at ${new Date().toLocaleTimeString()}`]
    };
    setTerminalSessions(prev => [...prev, newSession]);
    setActiveTerminalId(newId);
  };

  const closeTerminalSession = (id: string) => {
    if (terminalSessions.length <= 1) return;
    setTerminalSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeTerminalId === id) {
        setActiveTerminalId(filtered[0].id);
      }
      return filtered;
    });
  };

  return {
    terminalSessions,
    setTerminalSessions,
    activeTerminalId,
    setActiveTerminalId,
    currentSession,
    appendTerminalOutput,
    addTerminalSession,
    closeTerminalSession
  };
};
