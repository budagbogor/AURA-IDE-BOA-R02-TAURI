import { PUTER_MODELS } from '../utils/constants';

type PuterModel = {
  id: string;
  name: string;
  provider?: string;
  context?: number;
  max_tokens?: number;
  cost?: {
    currency?: string;
    tokens?: number;
    input?: number;
    output?: number;
  };
};

const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';

const loadPuterScript = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Puter.js hanya tersedia di runtime browser/desktop.');
  }

  if (window.puter?.ai) {
    return window.puter;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PUTER_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Puter.js')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PUTER_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Puter.js'));
    document.head.appendChild(script);
  });

  if (!window.puter?.ai) {
    throw new Error('Puter.js loaded, but AI client is unavailable.');
  }

  return window.puter;
};

export async function fetchPuterModels(): Promise<PuterModel[]> {
  try {
    const puter = await loadPuterScript();
    const models = await puter.ai!.listModels('openrouter');
    return (Array.isArray(models) ? models : [])
      .filter((model: any) => model?.id)
      .map((model: any) => ({
        id: model.id.startsWith('openrouter:') ? model.id : `openrouter:${model.id}`,
        name: model.name || model.id,
        provider: model.provider,
        context: model.context,
        max_tokens: model.max_tokens,
        cost: model.cost
      }))
      .sort((a: PuterModel, b: PuterModel) => {
        const inputA = typeof a.cost?.input === 'number' ? a.cost.input : Number.MAX_SAFE_INTEGER;
        const inputB = typeof b.cost?.input === 'number' ? b.cost.input : Number.MAX_SAFE_INTEGER;
        if (inputA !== inputB) return inputA - inputB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });
  } catch (error) {
    console.error('Failed to fetch Puter models:', error);
    return PUTER_MODELS;
  }
}

export async function generatePuterContent(
  model: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  testMode = false
) {
  const puter = await loadPuterScript();
  const normalizedModel = model.startsWith('openrouter:') ? model : `openrouter:${model}`;
  const prompt = messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
  const response = await puter.ai!.chat(prompt, testMode, { model: normalizedModel });

  if (typeof response === 'string') {
    return response;
  }

  if (response?.message?.content) {
    return response.message.content;
  }

  if (response?.text) {
    return response.text;
  }

  return String(response ?? '');
}
