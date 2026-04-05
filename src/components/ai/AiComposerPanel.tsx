import { FileText, Image as ImageIcon, LoaderCircle, Paperclip, Send, Settings2, Sparkles, Square, X } from 'lucide-react';
import type { AiProvider, AttachedFile, ChatMessage } from '@/types';

type TaskPreset = {
  id: string;
  label: string;
  description: string;
  executionChecklist?: string[];
};

type SkillInfo = {
  description?: string;
  workflow?: string[];
};

type ModelOption = {
  id: string;
  name: string;
};

type ProviderOption = {
  id: string;
  name: string;
};

type ProcessingEntry = {
  title: string;
  summary: string;
  files: string[];
  steps?: Array<{
    label: string;
    detail: string;
    status: 'planning' | 'working' | 'done' | 'error';
  }>;
};

type Props = {
  width: number;
  provider: AiProvider;
  providerOptions: ProviderOption[];
  activeModel: string;
  modelOptions: ModelOption[];
  taskPreset: TaskPreset;
  taskPresetOptions: TaskPreset[];
  selectedSkill: string;
  activeSkill: SkillInfo | null | undefined;
  testingStatus: string | undefined;
  testError?: string;
  domainFocus: string[];
  preferredTargets: string[];
  chatMessages: ChatMessage[];
  chatInput: string;
  attachedFiles: AttachedFile[];
  isAiLoading: boolean;
  processingEntry: ProcessingEntry | null;
  onOpenSettings: () => void;
  onClearChat: () => void;
  onClosePanel: () => void;
  onChangeTaskPreset: (presetId: string) => void;
  onChangeChatInput: (value: string) => void;
  onSendPrompt: () => void | Promise<void>;
  onStopPrompt: () => void;
  onRemoveAttachment: (index: number) => void;
  onOpenAttach: () => void;
  onTextareaKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export function AiComposerPanel({
  width,
  provider,
  providerOptions,
  activeModel,
  modelOptions,
  taskPreset,
  taskPresetOptions,
  selectedSkill,
  activeSkill,
  testingStatus,
  domainFocus,
  preferredTargets,
  chatMessages,
  chatInput,
  attachedFiles,
  isAiLoading,
  processingEntry,
  onOpenSettings,
  onClosePanel,
  onChangeTaskPreset,
  onChangeChatInput,
  onSendPrompt,
  onStopPrompt,
  onRemoveAttachment,
  onOpenAttach,
  onTextareaKeyDown
}: Props) {
  const providerName = providerOptions.find((item) => item.id === provider)?.name || provider;
  const modelName = modelOptions.find((item) => item.id === activeModel)?.name || activeModel;
  const compactWorkflow = activeSkill?.workflow?.slice(0, 2) || [];
  const visibleProcessingSteps = processingEntry?.steps?.filter((step) => step.status === 'planning' || step.status === 'working').slice(-3) || [];
  const processingTitle = processingEntry?.title || 'AURA sedang bekerja';
  const processingSummary = processingEntry?.summary || 'Menganalisis prompt, menyusun perubahan, dan menulis file ke workspace.';

  return (
    <aside
      className="aura-ai-panel shrink-0 min-h-0 border-l border-white/5 bg-[#141414] flex flex-col"
      style={{ width }}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
          <Sparkles size={13} className="text-blue-400" />
          AI Composer
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-[#b8b8b8] hover:bg-white/10 hover:text-white"
            title="AI settings"
          >
            <Settings2 size={13} />
          </button>
          <button
            onClick={onClosePanel}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-[#b8b8b8] hover:bg-white/10 hover:text-white"
            title="Close AI panel"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/5 px-3 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#d7dbe2]">
              <span className="font-semibold text-white">{providerName}</span>
              <span className="text-[#59606d]">/</span>
              <span className="max-w-[180px] truncate text-[#c2c8d2]">{modelName}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-[#808895]">
              <label className="sr-only" htmlFor="aura-task-preset-select">Task mode</label>
              <select
                id="aura-task-preset-select"
                value={taskPreset.id}
                onChange={(event) => onChangeTaskPreset(event.target.value)}
                className="rounded-md border border-white/10 bg-[#181818] px-2 py-1 text-[10px] font-medium text-[#d7dbe2] outline-none focus:border-blue-500/40"
                title="AI task mode"
              >
                {taskPresetOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <span className="truncate text-[#727b88]">{selectedSkill}</span>
            </div>
          </div>
          <div className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${
            testingStatus === 'success'
              ? 'bg-emerald-500/10 text-emerald-200'
              : testingStatus === 'error'
                ? 'bg-red-500/10 text-red-200'
                : testingStatus === 'loading'
                  ? 'bg-amber-500/10 text-amber-200'
                  : 'bg-white/5 text-[#98a0ad]'
          }`}>
            {testingStatus || 'idle'}
          </div>
        </div>

        <details className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-2.5 py-2">
          <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7f8795]">
            Context Ringkas
          </summary>
          <div className="mt-2 space-y-2 text-[11px] text-[#a8b0bc]">
            {domainFocus.length > 0 ? (
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6f7785]">Domain</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {domainFocus.map((domain) => (
                    <span key={domain} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-100">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {preferredTargets.length > 0 ? (
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6f7785]">Targets</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {preferredTargets.slice(0, 5).map((target) => (
                    <span key={target} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-100">
                      {target}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {compactWorkflow.length > 0 ? (
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6f7785]">Workflow</div>
                <div className="mt-1 space-y-1">
                  {compactWorkflow.map((item) => (
                    <div key={item} className="leading-5 text-[#96a0ad]">{item}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </details>

        {isAiLoading ? (
          <div className="mt-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.07] px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-blue-100">
              <LoaderCircle size={13} className="animate-spin text-blue-300" />
              <span className="font-semibold">{processingTitle}</span>
              <div className="ml-auto flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300" />
              </div>
            </div>
            <div className="mt-1.5 text-[10px] leading-5 text-[#c9d7f2]">
              {processingSummary}
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-blue-400/80" />
            </div>
            {visibleProcessingSteps.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {visibleProcessingSteps.map((step) => (
                  <div key={step.label} className="rounded-md border border-white/6 bg-black/10 px-2 py-1.5">
                    <div className="text-[10px] font-medium text-white">{step.label}</div>
                    <div className="text-[10px] leading-4 text-[#aebcda]">{step.detail}</div>
                  </div>
                ))}
              </div>
            ) : processingEntry?.files?.length ? (
              <div className="mt-2 text-[10px] leading-5 text-[#aebcda]">
                Menyiapkan {processingEntry.files.slice(0, 3).join(', ')}
                {processingEntry.files.length > 3 ? ` +${processingEntry.files.length - 3} file lain` : ''}
              </div>
            ) : (
              <div className="mt-2 text-[10px] leading-5 text-[#aebcda]">
                AURA sedang memikirkan perubahan terbaik untuk workspace ini.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {chatMessages.length === 0 ? (
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 text-[11px] leading-5 text-[#9098a5]">
            Tulis instruksi kerja di sini.
            <div className="mt-1 text-[#727b88]">Planning tetap di chat kanan, hasil coding tampil di panel tengah.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2.5 text-[12px] leading-5 ${
                  message.role === 'user'
                    ? 'ml-8 border border-blue-500/20 bg-blue-500/10 text-blue-100'
                    : 'mr-8 border border-white/10 bg-white/5 text-[#d4d4d4]'
                }`}
              >
                <div className="mb-1 text-[10px] font-medium text-[#8a8a8a]">
                  {message.role === 'user' ? 'You' : `AURA - ${provider}`}
                </div>
                <div>{message.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-[#121212] px-3 py-2.5">
        {attachedFiles.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-[#d7dbe2]"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon size={12} className="shrink-0 text-blue-300" />
                ) : (
                  <FileText size={12} className="shrink-0 text-emerald-300" />
                )}
                <span className="max-w-[180px] truncate">{file.name}</span>
                <button
                  onClick={() => onRemoveAttachment(index)}
                  className="rounded-md p-0.5 text-[#8d95a3] hover:bg-white/10 hover:text-white"
                  title="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <textarea
          value={chatInput}
          onChange={(event) => onChangeChatInput(event.target.value)}
          onKeyDown={onTextareaKeyDown}
          placeholder="Tulis prompt AI di sini..."
          className="min-h-[88px] w-full resize-none rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2.5 text-[12px] text-white outline-none transition-colors placeholder:text-[#666] focus:border-blue-500/40"
        />
        {isAiLoading ? (
          <div className="mt-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-3 py-2 text-[10px] text-[#cfe0ff]">
            <div className="flex items-center gap-2">
              <LoaderCircle size={12} className="animate-spin text-blue-300" />
              <span className="font-medium">AURA sedang memproses prompt dan menyiapkan perubahan.</span>
            </div>
          </div>
        ) : null}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <select
            value={taskPreset.id}
            onChange={(event) => onChangeTaskPreset(event.target.value)}
            className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-[#8b93a0] outline-none focus:border-blue-500/40"
            title="AI task mode"
          >
            {taskPresetOptions.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAttach}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.08]"
              title="Attach image or file"
            >
              <Paperclip size={14} />
              Attach
            </button>
            {isAiLoading ? (
              <button
                onClick={onStopPrompt}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-100 hover:bg-red-500/15"
                title="Stop AI request"
              >
                <Square size={14} />
                Stop
              </button>
            ) : (
              <button
                onClick={() => void onSendPrompt()}
                disabled={!chatInput.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-500 disabled:opacity-40"
              >
                <Send size={14} />
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
