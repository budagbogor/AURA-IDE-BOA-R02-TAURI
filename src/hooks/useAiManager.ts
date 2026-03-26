import { useState, useEffect } from 'react';
import { 
  BYTEZ_MODELS, 
  SUMOPOD_MODELS, 
  FREE_MODELS 
} from '../utils/constants';
import { getGeminiAI } from '../services/geminiService';
import { generateOpenRouterContent, fetchFreeModels } from '../services/openRouterService';
import { generateBytezContent } from '../services/bytezService';
import { generateSumopodContent } from '../services/sumopodService';

export const useAiManager = (appendTerminalOutput: (data: string | string[]) => void) => {
  const [testingStatus, setTestingStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [testError, setTestError] = useState<Record<string, string>>({});
  
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter' | 'bytez' | 'sumopod' | 'ollama'>(() => (localStorage.getItem('aiProvider') as any) || 'gemini');
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('aura_ollama_url') || 'http://localhost:11434');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('aura_gemini_key') || '');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(() => localStorage.getItem('aura_openrouter_key') || '');
  const [bytezApiKey, setBytezApiKey] = useState(() => localStorage.getItem('aura_bytez_key') || '');
  const [sumopodApiKey, setSumopodApiKey] = useState(() => localStorage.getItem('sumopodApiKey') || '');
  
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [openRouterModel, setOpenRouterModel] = useState('auto-free');
  const [bytezModel, setBytezModel] = useState(() => localStorage.getItem('bytezModel') || BYTEZ_MODELS[0].id);
  const [sumopodModel, setSumopodModel] = useState(() => localStorage.getItem('sumopodModel') || SUMOPOD_MODELS[0].id);
  
  const [dynamicFreeModels, setDynamicFreeModels] = useState<any[]>(FREE_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_gemini_key', geminiApiKey);
    localStorage.setItem('aura_openrouter_key', openRouterApiKey);
    localStorage.setItem('aura_bytez_key', bytezApiKey);
    localStorage.setItem('bytezModel', bytezModel);
    localStorage.setItem('sumopodApiKey', sumopodApiKey);
    localStorage.setItem('sumopodModel', sumopodModel);
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('aura_ollama_url', ollamaUrl);
  }, [geminiApiKey, openRouterApiKey, bytezApiKey, bytezModel, sumopodApiKey, sumopodModel, aiProvider, ollamaUrl]);

  const refreshModels = async () => {
    if (aiProvider === 'openrouter') {
      setIsFetchingModels(true);
      try {
        const models = await fetchFreeModels();
        if (models.length > 0) setDynamicFreeModels(models);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      } finally {
        setIsFetchingModels(false);
      }
    }
  };

  const testAiConnection = async (
    provider: 'gemini' | 'openrouter' | 'bytez' | 'sumopod'
  ) => {
    setTestingStatus((prev: any) => ({ ...prev, [provider]: 'loading' }));
    try {
      if (provider === 'gemini') {
        const apiKey = geminiApiKey || '';
        if (!apiKey) throw new Error('API Key kosong');
        const ai = getGeminiAI(apiKey);
        await ai.models.generateContent({
          model: selectedModel,
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }]
        });
      } else if (provider === 'openrouter') {
        const apiKey = openRouterApiKey || '';
        if (!apiKey) throw new Error('API Key kosong');
        await generateOpenRouterContent(openRouterModel, 'ping', apiKey);
      } else if (provider === 'bytez') {
        const apiKey = bytezApiKey || '';
        if (!apiKey) throw new Error('API Key kosong');
        await generateBytezContent(bytezModel, 'ping', apiKey, geminiApiKey);
      } else if (provider === 'sumopod') {
        const apiKey = sumopodApiKey || '';
        if (!apiKey) throw new Error('API Key kosong');
        await generateSumopodContent(apiKey, sumopodModel, [{ role: 'user', content: 'ping' }]);
      } else if (provider === 'ollama') {
        const res = await fetch(`${ollamaUrl}/api/tags`);
        if (!res.ok) throw new Error('Gagal terhubung ke Ollama. Pastikan Ollama aktif di ' + ollamaUrl);
      }
      setTestingStatus((prev: any) => ({ ...prev, [provider]: 'success' }));
      appendTerminalOutput(`[AI] Koneksi ${provider.toUpperCase()} berhasil!`);
    } catch (err: any) {
      setTestingStatus((prev: any) => ({ ...prev, [provider]: 'error' }));
      setTestError((prev: any) => ({ ...prev, [provider]: err.message }));
      appendTerminalOutput(`[AI ERROR] ${provider.toUpperCase()}: ${err.message}`);
    }
  };

  return {
    aiProvider, setAiProvider,
    geminiApiKey, setGeminiApiKey,
    openRouterApiKey, setOpenRouterApiKey,
    bytezApiKey, setBytezApiKey,
    sumopodApiKey, setSumopodApiKey,
    selectedModel, setSelectedModel,
    openRouterModel, setOpenRouterModel,
    bytezModel, setBytezModel,
    sumopodModel, setSumopodModel,
    dynamicFreeModels,
    setDynamicFreeModels,
    isFetchingModels,
    setIsFetchingModels,
    refreshModels,
    testAiConnection,
    testingStatus,
    setTestingStatus,
    testError,
    setTestError,
    ollamaUrl,
    setOllamaUrl
  };
};
