type SumopodCatalogItem = {
  id: string;
  name: string;
  provider?: string;
  inputPrice?: number;
  outputPrice?: number;
  context?: number;
};

type FetchAuthenticatedPageFn = (command: string, args?: Record<string, unknown>) => Promise<string>;

const parseNumber = (value: string) => {
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const prettifyProvider = (value: string) => {
  if (!value) return '';
  return value;
};

export const parseSumopodModelsFromHtml = (html: string): SumopodCatalogItem[] => {
  const rowPattern = /<tr class="hover:bg-gray-50">.*?<div class="text-sm font-medium text-gray-900">(?<id>[^<]+)<\/div>.*?<span class="inline-flex[^"]*">(?<provider>[^<]+)<\/span>.*?<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">(?<context>[^<]+)<\/td>.*?<div class="font-medium">\$(?<input>[^<]+)<\/div>.*?<div class="font-medium">\$(?<output>[^<]+)<\/div>/gs;
  const matches = html.matchAll(rowPattern);
  const items: SumopodCatalogItem[] = [];

  for (const match of matches) {
    const id = match.groups?.id?.trim();
    if (!id) continue;

    const provider = prettifyProvider(match.groups?.provider?.trim() || '');
    const context = parseNumber(match.groups?.context || '0');
    const inputPrice = parseNumber(match.groups?.input || '0');
    const outputPrice = parseNumber(match.groups?.output || '0');
    const labelPrice = inputPrice === 0 && outputPrice === 0
      ? '(Free)'
      : `($${inputPrice.toFixed(inputPrice < 1 ? 2 : 2)})`;

    items.push({
      id,
      name: `${id.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} ${labelPrice}`.replace(/\s+/g, ' ').trim(),
      provider,
      inputPrice,
      outputPrice,
      context
    });
  }

  const unique = new Map<string, SumopodCatalogItem>();
  items.forEach((item) => {
    unique.set(item.id, item);
  });

  return Array.from(unique.values()).sort((a, b) => {
    const inputDiff = (a.inputPrice || 0) - (b.inputPrice || 0);
    if (inputDiff !== 0) return inputDiff;
    const outputDiff = (a.outputPrice || 0) - (b.outputPrice || 0);
    if (outputDiff !== 0) return outputDiff;
    return a.id.localeCompare(b.id, undefined, { sensitivity: 'base' });
  });
};

export const fetchSumopodModelsFromUrl = async (
  invoke: FetchAuthenticatedPageFn,
  url: string,
  cookie?: string,
  authorization?: string
) => {
  const html = await invoke('fetch_authenticated_page', {
    url,
    cookie,
    authorization,
    userAgent: 'AURA-AI-IDE/15.3.39'
  });

  return parseSumopodModelsFromHtml(html);
};
