import type { AttachedFile } from '@/types';
import type { AiActivityEntry } from '@/features/workspace/workspaceSupport';

export const isLikelyCodingPrompt = (prompt: string) =>
  /(buat|bikin|generate|create|refactor|fix|perbaiki|ubah|edit|implement|scaffold|bangun|coding|code|file|component|api|ui|ux)/i.test(prompt);

export const buildAttachmentPromptContext = (attachments: AttachedFile[]) => {
  if (!attachments.length) return '';

  const sections = attachments.map((file, index) => {
    if (file.type.startsWith('image/')) {
      return [
        `Attachment ${index + 1}: ${file.name}`,
        'Type: image',
        'Instruction: analisis gambar ini jika relevan dengan prompt.'
      ].join('\n');
    }

    if (file.content) {
      const trimmedContent = file.content.length > 12000
        ? `${file.content.slice(0, 12000)}\n...[truncated]`
        : file.content;

      return [
        `Attachment ${index + 1}: ${file.name}`,
        `Type: ${file.type || 'text/plain'}`,
        'Content:',
        trimmedContent
      ].join('\n');
    }

    return [
      `Attachment ${index + 1}: ${file.name}`,
      `Type: ${file.type || 'binary'}`,
      'Content: binary attachment attached; use filename/type as context.'
    ].join('\n');
  });

  return ['Attached Context Files:', ...sections].join('\n\n');
};

export const buildWorkspaceOutputContract = () => [
  'Workspace Output Contract:',
  '- Jika kamu mengubah kode, keluarkan satu section per file dengan format wajib `File: relative/path.ext` lalu fenced code block tepat di bawahnya.',
  '- Jangan gabungkan beberapa file dalam satu code block.',
  '- Jangan tulis prose di antara baris `File:` dan fenced code block file itu.',
  '- Selalu sertakan path file yang jelas, misalnya File: src/App.tsx atau path=src/App.tsx.',
  '- Jika membuat file baru, gunakan path file baru yang lengkap.',
  '- Jika file tampak frontend, prioritaskan target folder frontend yang disarankan.',
  '- Jika file tampak backend atau tauri, prioritaskan target folder backend/tauri yang disarankan.',
  '- Gunakan satu arsitektur project yang konsisten. Jangan buat campuran root src + frontend/ + backend/ + api/ sekaligus kecuali user secara eksplisit meminta monorepo atau multi-service.',
  '- Untuk web app biasa atau fullstack kecil, default-kan ke satu app utama di root workspace: frontend di src/, backend ringan di api/ atau src/server/, bukan frontend/ dan backend/ terpisah.',
  '- Jangan membuat package.json tambahan di frontend/ atau backend/ kecuali user secara eksplisit meminta struktur terpisah.',
  '- Jaga dependency tetap ramping. Tambahkan library hanya jika benar-benar diperlukan untuk routing, accessibility, data, atau maintainability yang jelas.',
  '- Jika menambah dependency, update package.json app utama yang relevan dan jangan duplikasi package manifest tanpa alasan kuat.',
  '- Untuk frontend professional, prioritaskan hasil yang matang lewat struktur, token, dan state UI lengkap, bukan lewat banyak dependency dekoratif.',
  '- Jika user meminta web, landing page, dashboard, atau app baru, jangan biarkan starter scaffold tetap aktif. Ganti file entry utama seperti src/App.tsx, src/main.tsx, page.tsx, atau index.html sesuai arsitektur project.',
  '- Fokus pada implementasi nyata yang bisa langsung diterapkan ke workspace.'
].join('\n');

export const buildProfessionalUiContract = () => [
  'Professional UI Contract:',
  '- Gunakan satu bahasa visual yang tenang, professional, dan konsisten. Jangan membuat UI yang ramai atau terasa seperti template AI generik.',
  '- Mulai dari information hierarchy, CTA priority, navigation clarity, dan section rhythm sebelum dekorasi visual.',
  '- Pilih satu style direction yang jelas untuk solusi ini, misalnya minimal premium, editorial, soft bento, modern commerce, atau dashboard clean. Jangan campur banyak style sekaligus.',
  '- Pilih satu color palette yang koheren dengan 1 accent utama, surface yang jelas, dan text contrast yang sehat.',
  '- Pilih pasangan typography yang masuk akal untuk produk dan jaga scale heading/body/action tetap konsisten.',
  '- Definisikan token visual yang jelas: spacing, type scale, radii, border, surface, accent, dan focus ring.',
  '- Jaga kontras kuat, focus state jelas, dan struktur heading yang benar. Accessibility adalah syarat minimum, bukan polish tambahan.',
  '- Untuk halaman marketing atau landing page, buat narasi yang jelas: hero, trust signal, value, proof, detail, CTA close.',
  '- Hindari hero generik + kumpulan card acak. Setiap section harus punya fungsi yang jelas.',
  '- Jangan bergantung pada gambar placeholder rusak. Layout tetap harus terlihat bagus tanpa gambar.',
  '- Pastikan CSS atau styling layer rapi, terorganisir, dan tidak terasa seperti dump class acak tanpa ritme.',
  '- Utamakan layout yang implementable dan maintainable. Tambahkan dependency UI hanya jika benar-benar memberi nilai yang jelas.',
  '- Prefer quality bar ala shadcn blocks, React Spectrum accessibility, Open UI patterns, dan design-token discipline.',
  '- Jika prompt tidak menyebut style khusus, pilih desain yang lebih sederhana, tajam, dan product-grade daripada efek dekoratif.'
].join('\n');

export const buildUiStyleDecisionContract = () => [
  'UI Style Decision Contract:',
  '- Before writing UI code, silently decide the product archetype: commerce, SaaS dashboard, editorial, portfolio, docs, or utility app.',
  '- Pick exactly one style direction that fits the request, for example calm premium, modern commerce, editorial minimal, soft bento, or dense productivity UI.',
  '- Pick exactly one palette strategy with clear surface, text, border, muted, and accent roles. Do not mix unrelated accent colors.',
  '- Pick exactly one typography mood and keep it consistent across headings, body, metadata, and actions.',
  '- Decide layout density up front: airy, balanced, or compact. Apply it consistently across sections and component spacing.',
  '- Choose reusable section patterns first, then implement components from those patterns instead of improvising each block independently.',
  '- If the prompt is broad, prefer a simpler premium product UI over a flashy but weak layout.'
].join('\n');

export const buildUiDesignSystemGenerationContract = () => [
  'UI Design System Generation Contract:',
  '- Before writing UI code, internally generate a compact design-system recommendation for this request.',
  '- Decide and keep consistent: page pattern, section order, CTA placement, style direction, palette roles, typography pairing, spacing rhythm, radii, borders, elevation, focus treatment, and motion tone.',
  '- For landing pages, think in conversion-oriented sections such as hero, trust signal, value explanation, supporting proof, detail bands, and final CTA close.',
  '- For product UI, think in information architecture first: navigation, primary workspace, secondary controls, empty states, and error or loading states.',
  '- Surface the result in the code through consistent tokens and repeated composition patterns, not through a verbose prose explanation.',
  '- Prefer strong structure and calm density over visual effects.',
  '- If the brief is ambiguous, choose a premium, simple, and implementable product direction.'
].join('\n');

export const buildUiAntiPatternGate = () => [
  'UI Anti-Pattern Gate:',
  '- Avoid AI-generic layouts that look like a hero, three cards, and random gradient blocks without narrative purpose.',
  '- Avoid empty decorative space that weakens content density or forces the user to scroll without reward.',
  '- Avoid harsh neon accents, accidental purple bias, and mixed visual languages unless the brief truly calls for it.',
  '- Avoid giant border radii, exaggerated shadows, and glass effects unless they directly support the chosen style direction.',
  '- Avoid shipping a screen that looks broken when images, icons, or remote assets fail.',
  '- Avoid noisy headers, duplicate controls, and redundant informational panels in IDE-like UIs.'
].join('\n');

export const buildUiCriticalQualityGate = () => [
  'UI Critical Quality Gate:',
  '- Ensure primary interactive targets are comfortably clickable and mobile-safe, roughly 44x44 minimum hit area.',
  '- Keep body text readable on mobile and avoid tiny typography that looks elegant but fails in real use.',
  '- Keep body line-height in a comfortable range and avoid long unreadable paragraphs without width control.',
  '- Reserve space for async or missing content so the layout does not collapse or jump awkwardly.',
  '- Add explicit loading, empty, error, and disabled states for important UI blocks and buttons.',
  '- Prefer SVG/icon systems or real assets over emoji-like decoration.',
  '- Respect reduced-motion expectations and keep transitions restrained, usually short transform/opacity transitions.',
  '- Keep z-index, elevation, and overlay behavior simple and intentional instead of stacking arbitrary values.',
  '- If images or illustrations fail, the screen must still look complete and intentional.'
].join('\n');

export const buildTailwindUiContract = () => [
  'Tailwind UI Implementation Contract:',
  '- Untuk pekerjaan frontend/UI di AURA, default-kan styling ke Tailwind CSS v4 kecuali user secara eksplisit meminta CSS biasa, SCSS, atau library styling lain.',
  '- Gunakan utility class secara disiplin dengan struktur yang terbaca. Jangan membuat class soup acak tanpa grouping yang jelas.',
  '- Gunakan token warna, spacing, radius, shadow, dan typography secara konsisten melalui kombinasi utility yang stabil.',
  '- Jika ada pola yang berulang, ekstrak ke komponen atau helper class yang masuk akal daripada mengulang blok utility yang kacau.',
  '- Jangan mencampur Tailwind dengan file CSS besar yang redundant kecuali benar-benar dibutuhkan untuk base layer atau animation khusus.',
  '- Pastikan layout tetap bagus di mobile, tablet, dan desktop menggunakan breakpoint yang sengaja dipilih, bukan sekadar ditumpuk.'
].join('\n');

export const buildAiPromptEnvelope = ({
  developerContext,
  projectRulesContext,
  domains,
  preferredTargets,
  executionPlan,
  attachmentContext,
  prompt
}: {
  developerContext: string;
  projectRulesContext?: string;
  domains: string[];
  preferredTargets: string[];
  executionPlan: string[];
  attachmentContext: string;
  prompt: string;
}) => {
  const domainContext = `Active Work Domains: ${domains.join(', ')}`;
  const targetContext = preferredTargets.length > 0
    ? `Preferred Workspace Targets:\n${preferredTargets.map((target) => `- ${target}`).join('\n')}`
    : 'Preferred Workspace Targets:\n- workspace root';
  const planContext = `Suggested Execution Plan:\n${executionPlan.map((step, index) => `${index + 1}. ${step}`).join('\n')}`;

  return [
    developerContext,
    projectRulesContext || '',
    domainContext,
    targetContext,
    planContext,
    domains.includes('frontend') || domains.includes('design-system') ? buildProfessionalUiContract() : '',
    domains.includes('frontend') || domains.includes('design-system') ? buildUiStyleDecisionContract() : '',
    domains.includes('frontend') || domains.includes('design-system') ? buildUiDesignSystemGenerationContract() : '',
    domains.includes('frontend') || domains.includes('design-system') ? buildUiAntiPatternGate() : '',
    domains.includes('frontend') || domains.includes('design-system') ? buildUiCriticalQualityGate() : '',
    domains.includes('frontend') || domains.includes('design-system') ? buildTailwindUiContract() : '',
    buildWorkspaceOutputContract(),
    attachmentContext,
    `User Request:\n${prompt}`
  ].filter(Boolean).join('\n\n');
};

export const buildPlanningActivitySteps = (
  domains: string[],
  executionPlan: string[],
  preferredTargets: string[]
): AiActivityEntry['steps'] => ([
  {
    label: 'Planning',
    detail: `Menganalisis prompt, task preset, skill aktif, dan domain kerja: ${domains.join(', ')}.`,
    status: 'working'
  },
  {
    label: 'Execution Plan',
    detail: executionPlan.join(' '),
    status: 'planning'
  },
  {
    label: 'Generating',
    detail: 'Menunggu model mulai menyusun solusi.',
    status: 'planning'
  },
  {
    label: 'Workspace Draft',
    detail: `Draft file akan muncul di panel tengah. Target folder utama: ${preferredTargets.join(', ') || 'workspace root'}.`,
    status: 'planning'
  }
]);

export const buildGeneratingActivitySteps = ({
  domains,
  preferredTargets,
  executionPlan,
  provider,
  model
}: {
  domains: string[];
  preferredTargets: string[];
  executionPlan: string[];
  provider: string;
  model: string;
}): AiActivityEntry['steps'] => ([
  {
    label: 'Planning',
    detail: `Prompt sudah dipahami. Domain aktif: ${domains.join(', ')}. Target: ${preferredTargets.join(', ') || 'workspace root'}.`,
    status: 'done'
  },
  {
    label: 'Execution Plan',
    detail: executionPlan.join(' '),
    status: 'done'
  },
  {
    label: 'Generating',
    detail: `Menggunakan ${provider} • ${model} untuk menghasilkan perubahan.`,
    status: 'working'
  },
  {
    label: 'Workspace Draft',
    detail: 'Menunggu respons model untuk diubah menjadi draft file.',
    status: 'planning'
  }
]);

export const buildNoDraftActivitySteps = (): AiActivityEntry['steps'] => ([
  {
    label: 'Planning',
    detail: 'Analisis tugas selesai.',
    status: 'done'
  },
  {
    label: 'Generating',
    detail: 'Model selesai menjawab tanpa menghasilkan file baru.',
    status: 'done'
  },
  {
    label: 'Workspace Draft',
    detail: 'Tidak ada draft file yang perlu diterapkan.',
    status: 'done'
  }
]);

export const buildFailureActivitySteps = (message: string): AiActivityEntry['steps'] => ([
  {
    label: 'Planning',
    detail: 'Prompt sudah diproses, tetapi request berakhir gagal.',
    status: 'done'
  },
  {
    label: 'Generating',
    detail: message,
    status: 'error'
  },
  {
    label: 'Workspace Draft',
    detail: 'Tidak ada file yang dibuat karena request gagal.',
    status: 'error'
  }
]);

export const buildDraftReadyActivitySteps = ({
  domains,
  preferredTargets,
  responseText,
  generatedCount,
  inferExecutionPlan
}: {
  domains: string[];
  preferredTargets: string[];
  responseText: string;
  generatedCount: number;
  inferExecutionPlan: (domains: string[], preferredTargets: string[], prompt: string) => string[];
}): AiActivityEntry['steps'] => ([
  {
    label: 'Planning',
    detail: 'AURA sudah menentukan arah implementasi berdasarkan prompt dan preset task.',
    status: 'done'
  },
  {
    label: 'Execution Plan',
    detail: inferExecutionPlan(domains, preferredTargets, responseText).join(' '),
    status: 'done'
  },
  {
    label: 'Generating',
    detail: 'Model selesai menghasilkan respons coding dan struktur file.',
    status: 'done'
  },
  {
    label: 'Workspace Draft',
    detail: `${generatedCount} file draft siap direview di panel tengah. Target utama: ${preferredTargets.join(', ') || 'workspace root'}.`,
    status: 'done'
  }
]);

export const buildAssistantChatContent = (generatedDraftCount: number, responseText: string) =>
  generatedDraftCount > 0
    ? `[AURA] Rencana coding selesai. Saya sudah menyiapkan ${generatedDraftCount} file. Tab file dibuka di panel tengah dan struktur folder diperbarui di explorer kiri.`
    : (responseText || 'Model tidak mengembalikan teks.');

export const shouldRunUiReviewLoop = (domains: string[], taskPreset: string) =>
  domains.includes('frontend') ||
  domains.includes('design-system') ||
  taskPreset === 'frontend-ui' ||
  taskPreset === 'fullstack';

export const buildUiReviewLoopPrompt = ({
  userPrompt,
  domains,
  preferredTargets,
  projectRulesContext = '',
  checklist,
  generatedFiles,
  reviewMode = 'source',
  previewSnapshotContext = ''
}: {
  userPrompt: string;
  domains: string[];
  preferredTargets: string[];
  projectRulesContext?: string;
  checklist: string[];
  generatedFiles: Array<{ relativePath: string; content: string }>;
  reviewMode?: 'source' | 'preview';
  previewSnapshotContext?: string;
}) => {
  const fileSections = generatedFiles.map((file) => [
    `File: ${file.relativePath}`,
    '```',
    file.content,
    '```'
  ].join('\n')).join('\n\n');

  return [
    reviewMode === 'preview' ? 'Preview Review Loop:' : 'UI Review Loop:',
    reviewMode === 'preview'
      ? 'Review the current runtime/frontend output critically as a senior design engineer using both preview snapshot data and source files.'
      : 'Review the generated frontend/UI output critically as a senior design engineer.',
    'Your job is to improve weak hierarchy, poor contrast, generic composition, broken spacing rhythm, weak typography, missing responsive behavior, weak CTA clarity, and bad fallback states.',
    'Only return files that actually need refinement.',
    'If no UI improvement is needed, respond exactly with: NO_UI_CHANGES_NEEDED',
    '',
    `Original user request:\n${userPrompt}`,
    '',
    `Active domains: ${domains.join(', ')}`,
    `Preferred targets:\n${preferredTargets.map((item) => `- ${item}`).join('\n') || '- workspace root'}`,
    '',
    projectRulesContext,
    '',
    buildProfessionalUiContract(),
    buildUiStyleDecisionContract(),
    buildUiCriticalQualityGate(),
    buildTailwindUiContract(),
    '',
    'UI quality checklist:',
    ...checklist.map((item) => `- ${item}`),
    '',
    reviewMode === 'preview' ? 'Preview snapshot:' : '',
    reviewMode === 'preview' ? previewSnapshotContext : '',
    '',
    buildWorkspaceOutputContract(),
    '',
    reviewMode === 'preview' ? 'Current workspace files relevant to preview:' : 'Current generated files:',
    fileSections
  ].filter(Boolean).join('\n');
};

export const buildStarterReplacementPrompt = ({
  userPrompt,
  preferredTargets,
  projectRulesContext = '',
  generatedFiles,
  previewSnapshotContext
}: {
  userPrompt: string;
  preferredTargets: string[];
  projectRulesContext?: string;
  generatedFiles: Array<{ relativePath: string; content: string }>;
  previewSnapshotContext: string;
}) => {
  const fileSections = generatedFiles.map((file) => [
    `File: ${file.relativePath}`,
    '```',
    file.content,
    '```'
  ].join('\n')).join('\n\n');

  return [
    'Starter Replacement Recovery:',
    'The preview still shows the default AURA starter scaffold. This means the main app entrypoint was not replaced successfully.',
    'Your job is to replace the starter with a real application implementation that matches the user request.',
    'You must update the true entry files, not only add supporting components.',
    'If the project is a normal Vite React app, ensure src/App.tsx and any required supporting files are updated so the preview no longer shows starter content.',
    '',
    `Original user request:\n${userPrompt}`,
    '',
    `Preferred targets:\n${preferredTargets.map((item) => `- ${item}`).join('\n') || '- workspace root'}`,
    '',
    projectRulesContext,
    '',
    'Preview evidence:',
    previewSnapshotContext,
    '',
    buildProfessionalUiContract(),
    buildUiStyleDecisionContract(),
    buildUiCriticalQualityGate(),
    buildTailwindUiContract(),
    buildWorkspaceOutputContract(),
    '',
    'Current generated files:',
    fileSections
  ].filter(Boolean).join('\n');
};
