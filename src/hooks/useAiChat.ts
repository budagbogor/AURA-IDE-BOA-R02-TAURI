import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAiChat = () => {
  const chatMessages = useAppStore(state => state.chatMessages);
  const setChatMessages = useAppStore(state => state.setChatMessages);
  const [composerMessages, setComposerMessages] = useState<any[]>([
    { role: 'assistant', content: 'Assalamualaikum...' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; data: string; content?: string }[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('Aura Orchestrator');
  const [activeAgentId, setActiveAgentId] = useState('pm');
  const [aiRules, setAiRules] = useState(() => localStorage.getItem('aura_ai_rules') || '');
  const [systemInstruction, setSystemInstruction] = useState(() => localStorage.getItem('aura_system_instruction') || 'You are Aura, the Lead Orchestrator of the AURA Collective. Coordinate between specialized agents and ensure high-quality, verified results.');

  useEffect(() => {
    localStorage.setItem('aura_ai_rules', aiRules);
  }, [aiRules]);

  useEffect(() => {
    localStorage.setItem('aura_system_instruction', systemInstruction);
  }, [systemInstruction]);

  return {
    chatMessages, setChatMessages,
    composerMessages, setComposerMessages,
    chatInput, setChatInput,
    isAiLoading, setIsAiLoading,
    attachedFiles, setAttachedFiles,
    selectedSkill, setSelectedSkill,
    activeAgentId, setActiveAgentId,
    aiRules, setAiRules,
    systemInstruction, setSystemInstruction
  };
};
