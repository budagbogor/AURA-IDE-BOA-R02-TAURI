import type { FileItem } from '@/types';
import { getRelativeFilePath, normalizePath } from '@/features/workspace/workspaceSupport';

type ProjectRule = {
  relativePath: string;
  title: string;
  description?: string;
  alwaysApply: boolean;
  patterns: string[];
  content: string;
  source: 'agents' | 'cursor' | 'trae' | 'aura' | 'claude';
};

const RULE_LIMIT = 4;
const RULE_BODY_LIMIT = 1800;

const parseFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { metadata: {} as Record<string, string>, body: content };

  const metadata: Record<string, string> = {};
  match[1].split('\n').forEach((line) => {
    const separator = line.indexOf(':');
    if (separator === -1) return;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) metadata[key] = value;
  });

  return { metadata, body: content.slice(match[0].length) };
};

const wildcardToRegex = (pattern: string) =>
  new RegExp(`^${pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*')}$`, 'i');

const matchesPattern = (relativePath: string, patterns: string[]) =>
  patterns.some((pattern) => wildcardToRegex(normalizePath(pattern)).test(normalizePath(relativePath)));

const inferRuleSource = (relativePath: string): ProjectRule['source'] => {
  const lower = normalizePath(relativePath).toLowerCase();
  if (lower === 'agents.md') return 'agents';
  if (lower === '.cursorrules' || lower.startsWith('.cursor/rules/')) return 'cursor';
  if (lower.startsWith('.claude/agents/')) return 'claude';
  if (lower.startsWith('.aura/rules/')) return 'aura';
  return 'trae';
};

const collectProjectRules = (files: FileItem[], rootPath?: string | null) => {
  const rules: ProjectRule[] = [];

  files.forEach((file) => {
    const relativePath = getRelativeFilePath(file.path || file.id, rootPath);
    const normalized = normalizePath(relativePath);
    const lower = normalized.toLowerCase();
    const isRuleFile =
      lower === 'agents.md' ||
      lower === '.cursorrules' ||
      lower.startsWith('.cursor/rules/') ||
      lower.startsWith('.aura/rules/') ||
      lower.startsWith('.rules/') ||
      lower.startsWith('.claude/agents/');

    if (!isRuleFile || !file.content?.trim()) return;

    const { metadata, body } = parseFrontmatter(file.content);
    const patterns = (metadata.globs || metadata.glob || metadata.pattern || metadata.match || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    rules.push({
      relativePath: normalized,
      title: metadata.title || metadata.name || normalized.split('/').pop() || normalized,
      description: metadata.description || metadata.desc || '',
      alwaysApply: /^(true|1|yes)$/i.test(metadata.alwaysApply || metadata.always_apply || ''),
      patterns,
      content: body.trim(),
      source: inferRuleSource(normalized)
    });
  });

  return rules;
};

const scoreRule = (rule: ProjectRule, keywordBlob: string, activeRelativePath: string) => {
  let score = 0;
  if (rule.alwaysApply) score += 100;
  if (rule.relativePath.toLowerCase() === 'agents.md') score += 90;
  if (activeRelativePath && rule.patterns.length && matchesPattern(activeRelativePath, rule.patterns)) score += 70;
  if (rule.description && keywordBlob.includes(rule.description.toLowerCase())) score += 18;
  if (rule.title && keywordBlob.includes(rule.title.toLowerCase())) score += 12;

  const sourceBonus: Record<ProjectRule['source'], number> = {
    agents: 20,
    aura: 18,
    cursor: 16,
    trae: 12,
    claude: 10
  };
  score += sourceBonus[rule.source];
  return score;
};

export const buildProjectRulesContext = ({
  files,
  rootPath,
  activeFilePath,
  prompt,
  domains
}: {
  files: FileItem[];
  rootPath?: string | null;
  activeFilePath?: string | null;
  prompt: string;
  domains: string[];
}) => {
  const rules = collectProjectRules(files, rootPath);
  if (!rules.length) return '';

  const activeRelativePath = activeFilePath ? getRelativeFilePath(activeFilePath, rootPath) : '';
  const keywordBlob = `${prompt}\n${domains.join(' ')}\n${activeRelativePath}`.toLowerCase();

  const selected = [...rules]
    .map((rule) => ({ rule, score: scoreRule(rule, keywordBlob, activeRelativePath) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RULE_LIMIT)
    .map((entry) => entry.rule);

  if (!selected.length) return '';

  return [
    'Project Rules Context:',
    ...selected.map((rule, index) => [
      `Rule ${index + 1}: ${rule.title}`,
      `Source: ${rule.relativePath}`,
      rule.description ? `Description: ${rule.description}` : '',
      'Instruction:',
      rule.content.length > RULE_BODY_LIMIT ? `${rule.content.slice(0, RULE_BODY_LIMIT)}\n...[truncated]` : rule.content
    ].filter(Boolean).join('\n'))
  ].join('\n\n');
};
