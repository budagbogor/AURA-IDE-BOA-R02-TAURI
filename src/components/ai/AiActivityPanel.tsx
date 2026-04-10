import { getAiActivityTone, type AiActivityEntry } from '@/features/workspace/workspaceSupport';

type Props = {
  entries: AiActivityEntry[];
  isAiLoading: boolean;
  resolveFileId: (filePath: string) => string | null;
  onOpenFile: (fileId: string) => void;
  onRunSuggestedCommand: (activityId: string, command: string) => void;
};

export function AiActivityPanel({
  entries,
  isAiLoading,
  resolveFileId,
  onOpenFile,
  onRunSuggestedCommand
}: Props) {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] px-5 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">AI Coding Activity</div>
          <div className="mt-1 text-[11px] text-[#8d95a3]">
            Planning dan keputusan tetap di chat kanan. Implementasi file dan progres kerja tampil di sini.
          </div>
        </div>
        {isAiLoading && (
          <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
            Working
          </div>
        )}
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-white/8 bg-[#151515] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white">{entry.title}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#7f8795]">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${getAiActivityTone(entry.status)}`}>
                {entry.status || 'planning'}
              </div>
            </div>
            <div className="mt-2 text-[12px] leading-6 text-[#aeb5c1]">{entry.summary}</div>
            {entry.domains && entry.domains.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.domains.map((domain) => (
                  <span
                    key={`${entry.id}-${domain}`}
                    className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-100"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            )}
            {entry.steps && entry.steps.length > 0 && (
              <div className="mt-3 space-y-2 rounded-xl border border-white/6 bg-black/20 p-3">
                {entry.steps.map((step) => (
                  <div key={`${entry.id}-${step.label}`} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      step.status === 'done'
                        ? 'bg-emerald-400'
                        : step.status === 'working'
                          ? 'bg-amber-400'
                          : step.status === 'error'
                            ? 'bg-red-400'
                            : 'bg-blue-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-white">{step.label}</div>
                      <div className="mt-0.5 text-[11px] leading-5 text-[#8d95a3]">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {entry.files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.files.map((filePath) => {
                  const fileId = resolveFileId(filePath);
                  return (
                    <button
                      key={`${entry.id}-${filePath}`}
                      onClick={() => fileId && onOpenFile(fileId)}
                      className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-100 hover:bg-blue-500/15"
                    >
                      {filePath}
                    </button>
                  );
                })}
              </div>
            )}
            {entry.suggestedCommands && entry.suggestedCommands.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/6 bg-black/20 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f8795]">
                  Suggested Verification
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.suggestedCommands.map((item) => (
                    <button
                      key={`${entry.id}-${item.command}`}
                      onClick={() => onRunSuggestedCommand(entry.id, item.command)}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-100 hover:bg-emerald-500/15"
                      title={item.reason}
                    >
                      {item.label}: {item.command}
                    </button>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  {entry.suggestedCommands.map((item) => (
                    <div key={`${entry.id}-${item.command}-reason`} className="text-[10px] leading-5 text-[#8d95a3]">
                      <span className="font-semibold text-white">{item.label}</span>: {item.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
