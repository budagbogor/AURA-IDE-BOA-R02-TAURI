import { useState, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAiChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Welcome to **Aura AI IDE**. I am your coding assistant. How can I help you today?' }
  ]);
  const [composerMessages, setComposerMessages] = useState<any[]>([
    { role: 'assistant', content: 'Assalamualaikum...' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; data: string; content?: string }[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('Super Claude');
  const [aiRules, setAiRules] = useState(() => localStorage.getItem('aura_ai_rules') || '');
  const [systemInstruction, setSystemInstruction] = useState(() => localStorage.getItem('aura_system_instruction') || 'You are Aura, a powerful AI assistant focused on high-quality code generation and problem-solving.');

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
    aiRules, setAiRules,
    systemInstruction, setSystemInstruction
  };
};
