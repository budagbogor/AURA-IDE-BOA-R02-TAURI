import { invoke } from '@tauri-apps/api/core';

export interface BytezModel {
  id: string;
  name: string;
  task?: string;
  priceLabel?: string;
}

const isTauriDesktop =
  typeof window !== 'undefined' &&
  (!!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI__);

async function requestBytezJson(url: string, init: {
  method?: 'GET' | 'POST';
  apiKey: string;
  body?: Record<string, unknown>;
  googleKey?: string;
}) {
  const extraHeaders = init.googleKey?.trim()
    ? { 'provider-key': init.googleKey.trim() }
    : undefined;

  if (isTauriDesktop) {
    const body = await invoke<string>('proxy_http_request', {
      request: {
        url,
        method: init.method || 'GET',
        authorization: `Key ${init.apiKey}`,
        contentType: init.body ? 'application/json' : undefined,
        body: init.body ? JSON.stringify(init.body) : undefined,
        headers: extraHeaders
      }
    });
    return JSON.parse(body);
  }

  const response = await fetch(url, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Key ${init.apiKey}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(extraHeaders || {})
    },
    ...(init.body ? { body: JSON.stringify(init.body) } : {})
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bytez API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

export const BYTEZ_MODELS: BytezModel[] = [
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (Bytez)' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash (Bytez)' },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B (Bytez)' },
  { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 (Bytez)' }
];

export async function fetchBytezModels(apiKey: string): Promise<BytezModel[]> {
  if (!apiKey) {
    return BYTEZ_MODELS;
  }

  const data = await requestBytezJson('https://api.bytez.com/models/v2/list/models?task=chat', {
    apiKey
  });
  const output = Array.isArray(data?.output) ? data.output : [];

  return output
    .filter((item: any) => item?.modelId)
    .map((item: any) => ({
      id: item.modelId,
      name: item.modelId,
      task: item.task,
      priceLabel: item.meterPrice || item.meter || ''
    }))
    .sort((a: BytezModel, b: BytezModel) => {
      const priceA = parseFloat((a.priceLabel || '').replace(/[^\d.]/g, ''));
      const priceB = parseFloat((b.priceLabel || '').replace(/[^\d.]/g, ''));
      const safeA = Number.isFinite(priceA) ? priceA : Number.MAX_SAFE_INTEGER;
      const safeB = Number.isFinite(priceB) ? priceB : Number.MAX_SAFE_INTEGER;
      if (safeA !== safeB) return safeA - safeB;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

export async function generateBytezContent(
  model: string,
  prompt: string,
  bytezKey: string,
  googleKey: string,
  attachments: any[] = [],
  chatHistory: { role: string; content: string }[] = []
) {
  if (!bytezKey) {
    throw new Error('Bytez API Key is required.');
  }

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  const messages: any[] = [
    ...formattedHistory,
    { role: 'user', content: prompt }
  ];

  const imageAttachments = attachments.filter((file) => file.type?.startsWith('image/'));
  if (imageAttachments.length > 0) {
    console.info('[AURA] Bytez visual review masih fallback ke text-only. Attachment gambar tidak ikut dikirim.');
  }

  const data = await requestBytezJson(`https://api.bytez.com/models/v2/${model}`, {
    method: 'POST',
    apiKey: bytezKey,
    googleKey,
    body: {
      messages,
      stream: false,
      params: {
        temperature: 0.7,
        max_length: 16384
      }
    }
  });

  if (data.error) {
    throw new Error(`Bytez API Error: ${data.error}`);
  }

  return data.output || 'No output returned from Bytez.';
}
