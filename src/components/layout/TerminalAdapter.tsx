import React, { useEffect, useMemo, useRef } from 'react';

interface TerminalAdapterProps {
  id: string;
  output: string[];
  isRunning: boolean;
  currentCommand?: string;
}

const urlRegex = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::\]|[^\s]+)/ig;
const ansiRegex = /\u001b\[[0-9;]*m/g;

const renderLine = (line: string, keyPrefix: string) => {
  const cleanLine = line.replace(ansiRegex, '');
  const matches = Array.from(cleanLine.matchAll(urlRegex));
  if (matches.length === 0) {
    return <span key={`${keyPrefix}-text`}>{cleanLine || ' '}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const url = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push(
        <span key={`${keyPrefix}-chunk-${index}`}>
          {cleanLine.slice(lastIndex, start)}
        </span>
      );
    }

    const normalizedUrl = url.replace('127.0.0.1', 'localhost').replace('0.0.0.0', 'localhost').replace('[::]', 'localhost');
    parts.push(
      <a
        key={`${keyPrefix}-url-${index}`}
        href={normalizedUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
      >
        {url}
      </a>
    );

    lastIndex = start + url.length;
  });

  if (lastIndex < cleanLine.length) {
    parts.push(
      <span key={`${keyPrefix}-tail`}>
        {cleanLine.slice(lastIndex)}
      </span>
    );
  }

  return parts;
};

export const TerminalAdapter: React.FC<TerminalAdapterProps> = ({
  output,
  isRunning,
  currentCommand
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      endRef.current?.scrollIntoView({ block: 'end' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [output, isRunning]);

  const lines = useMemo(() => (output.length > 0 ? output : ['[AURA] Terminal siap.']), [output]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 w-full overflow-auto bg-[#0b0b0b] px-3 py-2.5 font-mono text-[11px] leading-5 text-[#d4d4d4]"
    >
      {isRunning ? (
        <div className="sticky top-0 z-10 mb-2 flex items-center gap-2 rounded-md border border-emerald-500/15 bg-[#0b0b0b]/95 px-2 py-1 text-[10px] text-emerald-200 backdrop-blur">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          <span className="font-medium">Process running</span>
          {currentCommand ? <span className="truncate text-[#b9d9c4]">{currentCommand}</span> : null}
        </div>
      ) : null}
      {lines.map((line, index) => (
        <div key={`line-${index}`} className="whitespace-pre-wrap break-words border-l border-transparent pl-1.5">
          {renderLine(line, `line-${index}`)}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
