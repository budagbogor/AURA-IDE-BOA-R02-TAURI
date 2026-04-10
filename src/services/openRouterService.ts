import { invoke } from '@tauri-apps/api/core';

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length?: number;
  prompt_price?: number;
  completion_price?: number;
}

const isTauriDesktop =
  typeof window !== 'undefined' &&
  (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);

const OPENROUTER_BASE_HEADERS = {
  'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://aura.local',
  'X-Title': 'Aura AI IDE'
};

async function requestOpenRouterJson(url: string, init: {
  method?: 'GET' | 'POST';
  apiKey?: string;
  body?: Record<string, unknown>;
}) {
  if (isTauriDesktop) {
    const body = await invoke<string>('proxy_http_request', {
      request: {
        url,
        method: init.method || 'GET',
        authorization: init.apiKey ? `Bearer ${init.apiKey}` : undefined,
        contentType: init.body ? 'application/json' : undefined,
        body: init.body ? JSON.stringify(init.body) : undefined,
        headers: OPENROUTER_BASE_HEADERS
      }
    });
    return JSON.parse(body);
  }

  const response = await fetch(url, {
    method: init.method || 'GET',
    headers: {
      ...OPENROUTER_BASE_HEADERS,
      ...(init.apiKey ? { Authorization: `Bearer ${init.apiKey}` } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(init.body ? { body: JSON.stringify(init.body) } : {})
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenRouter API error ${response.status}`);
  }

  return response.json();
}

export const FREE_MODELS: OpenRouterModel[] = [
  { id: 'auto-free', name: 'Smart Auto-Select (Free)' },
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)' },
  { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro Exp (Free)' }
];

export async function fetchFreeModels(): Promise<OpenRouterModel[]> {
  try {
    const data = await requestOpenRouterJson('https://openrouter.ai/api/v1/models', {});

    const freeModels = (data.data || [])
      .filter((m: any) => m?.pricing?.prompt === '0' && m?.pricing?.completion === '0')
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        context_length: m.context_length
      }))
      .sort((a: any, b: any) => (b.context_length || 0) - (a.context_length || 0));

    return freeModels.length > 0 ? freeModels : FREE_MODELS.slice(1);
  } catch (error) {
    console.error('Error fetching free OpenRouter models:', error);
    return FREE_MODELS.slice(1);
  }
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const data = await requestOpenRouterJson('https://openrouter.ai/api/v1/models', {});

    return (data.data || [])
      .filter((model: any) => Array.isArray(model?.architecture?.output_modalities)
        ? model.architecture.output_modalities.includes('text')
        : true)
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        context_length: model.context_length,
        prompt_price: Number(model?.pricing?.prompt || 0),
        completion_price: Number(model?.pricing?.completion || 0)
      }))
      .sort((a: OpenRouterModel, b: OpenRouterModel) => {
        const totalA = (a.prompt_price || 0) + (a.completion_price || 0);
        const totalB = (b.prompt_price || 0) + (b.completion_price || 0);
        if (totalA !== totalB) return totalA - totalB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
  } catch (error) {
    console.error('Error fetching OpenRouter model catalog:', error);
    return FREE_MODELS.map((model) => ({
      ...model,
      prompt_price: model.id.endsWith(':free') || model.id === 'auto-free' ? 0 : undefined,
      completion_price: model.id.endsWith(':free') || model.id === 'auto-free' ? 0 : undefined
    }));
  }
}

export async function generateOpenRouterContent(
  model: string,
  prompt: string,
  apiKey: string,
  attachments: any[] = [],
  chatHistory: { role: string; content: string }[] = []
) {
  let modelsToTry = [model];

  if (model === 'auto-free') {
    try {
      const models = await fetchFreeModels();
      modelsToTry = models.map((m: any) => m.id);
    } catch {
      modelsToTry = FREE_MODELS.slice(1).map((m) => m.id);
    }
  }

  const contentParts: any[] = [{ type: 'text', text: prompt }];
  attachments.forEach((file) => {
    if (file.type.startsWith('image/')) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: file.data
        }
      });
    }
  });

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    try {
      const data = await requestOpenRouterJson('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        apiKey,
        body: {
          model: currentModel,
          messages: [
            ...formattedHistory,
            { role: 'user', content: contentParts }
          ]
        }
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error(`Empty response from model ${currentModel}`);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      console.warn(`[OpenRouter Auto-Switch] Model ${currentModel} failed: ${error.message}.`);
      lastError = error instanceof Error ? error : new Error(String(error));
      if (model !== 'auto-free') break;
    }
  }

  throw new Error(lastError?.message || 'All fallback models failed. Please try again later.');
}
