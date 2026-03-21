import { useState, useCallback } from 'react';
import { ChatMessage, FileItem } from '../types';

export function useAI(appendTerminalOutput: (msg: string | string[]) => void, files: FileItem[]) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter'| 'bytez' | 'sumopod'>('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash');
  const [sumopodModel, setSumopodModel] = useState('sumopod-flash');
  
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('aura_gemini_key') || '');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(localStorage.getItem('aura_openrouter_key') || '');
  const [bytezApiKey, setBytezApiKey] = useState(localStorage.getItem('aura_bytez_key') || '');
  const [sumopodApiKey, setSumopodApiKey] = useState(localStorage.getItem('aura_sumopod_key') || '');

  const [systemInstruction, setSystemInstruction] = useState(localStorage.getItem('aura_system_instruction') || '');
  const [aiRules, setAiRules] = useState(localStorage.getItem('aura_ai_rules') || '');
  const [selectedSkill, setSelectedSkill] = useState('Default');
  const [context7Mode, setContext7Mode] = useState(true);

  // Context7 Logic
  const buildContext7Prompt = useCallback((activeFileContent?: string, activeFileName?: string) => {
    let contextStr = "==== CONTEXT7 MODE ACTIVE ====\n\n";
    
    contextStr += "WORKSPACE FILES OVERVIEW:\n";
    if (files.length === 0) {
      contextStr += "(No files open in workspace)\n\n";
    } else {
      files.forEach(f => {
        contextStr += `- ${f.name} (Lang: ${f.language})\n`;
      });
      contextStr += `Total files in context: ${files.length}\n\n`;
      
      // Optionally include content of ALL open files if Context7 is truly deep
      // We will truncate to avoid exceeding token limits if too many files.
      contextStr += "FULL FILE CONTENTS:\n";
      files.forEach((f, idx) => {
        if (idx < 10) { // Limit deep context to 10 files to avoid massive token usage
          contextStr += `\n--- File: ${f.name} ---\n`;
          contextStr += f.content.substring(0, 5000); // 5000 chars per file limit
          if (f.content.length > 5000) contextStr += '\n... (truncated)';
          contextStr += `\n--- End File: ${f.name} ---\n`;
        }
      });
    }

    if (activeFileContent && activeFileName) {
      contextStr += `\nCURRENTLY ACTIVE FILE (${activeFileName}):\n`;
      contextStr += "```" + (activeFileName.split('.').pop() || '') + "\n";
      contextStr += activeFileContent;
      contextStr += "\n```\n";
    }

    return contextStr;
  }, [files]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    appendTerminalOutput('[AI] Chat history cleared.');
  }, [appendTerminalOutput]);

  return {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isAiLoading,
    setIsAiLoading,
    aiProvider,
    setAiProvider,
    selectedModel,
    setSelectedModel,
    openRouterModel,
    setOpenRouterModel,
    sumopodModel,
    setSumopodModel,
    geminiApiKey,
    setGeminiApiKey,
    openRouterApiKey,
    setOpenRouterApiKey,
    bytezApiKey,
    setBytezApiKey,
    sumopodApiKey,
    setSumopodApiKey,
    systemInstruction,
    setSystemInstruction,
    aiRules,
    setAiRules,
    selectedSkill,
    setSelectedSkill,
    context7Mode,
    setContext7Mode,
    buildContext7Prompt,
    clearChat
  };
}
