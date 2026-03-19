/**
 * SumoPod AI Service
 * Compatible with OpenAI API format
 */

export const SUMOPOD_MODELS = [
  { id: 'gemini/gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini/gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini/gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'deepseek-v3', name: 'DeepSeek V3' },
  { id: 'atoma_mixtral-8x7b', name: 'Mixtral 8x7b (Atoma)' },
];

export async function generateSumopodContent(
  apiKey: string,
  model: string,
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  options: { temperature?: number, max_tokens?: number } = {}
) {
  const response = await fetch('https://ai.sumopod.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `SumoPod API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
