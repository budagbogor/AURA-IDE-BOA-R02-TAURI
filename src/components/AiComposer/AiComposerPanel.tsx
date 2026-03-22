import React, { useState, useRef, useEffect } from 'react';
import { generateComposerStream, parseComposerResponse } from '../../services/ai/composerService';
import { CodeBlockPreview } from './CodeBlockPreview';
import { FileItem } from '../../types';
import { Send, Bot, User, RefreshCw, Cpu, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import Markdown from 'react-markdown';

interface AiComposerPanelProps {
  provider: string;
  apiKey: string;
  model: string;
  files: FileItem[];
  activeFileId: string;
  onApplyCode: (filePath: string, content: string) => void;
  appendTerminalOutput?: (msg: string) => void;
  projectTree?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  parsedFiles?: { path: string; action: 'create_or_modify' | 'delete'; content: string }[];
}

export const AiComposerPanel: React.FC<AiComposerPanelProps> = ({
  provider,
  apiKey,
  model,
  files,
  activeFileId,
  onApplyCode,
  appendTerminalOutput,
  projectTree,
  messages,
  setMessages
}) => {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Auto');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: '⚠️ API Key belum diatur. Silakan atur di Settings terlebih dahulu.' }]);
      setInput('');
      return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (appendTerminalOutput) appendTerminalOutput(`[AI] Menyusun rencana untuk: ${userMessage.substring(0, 30)}...`);
      
      const stream = generateComposerStream(provider, apiKey, model, userMessage, files, category, activeFileId, projectTree);
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      let lastUpdateTime = Date.now();
      for await (const chunk of stream) {
        fullResponse += chunk;
        const now = Date.now();
        if (now - lastUpdateTime > 50) {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = fullResponse;
            return newMessages;
          });
          lastUpdateTime = now;

          // Real-time zero click apply
          const blockRegex = /\`\`\`(?:file|delete):([^\n]+)\n([\s\S]*?)(?:\`\`\`|$)/g;
          let match;
          while ((match = blockRegex.exec(fullResponse)) !== null) {
            onApplyCode(match[1].trim(), match[2]);
          }
        }
      }

      // Final render to print everything gracefully
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = fullResponse;
        return newMessages;
      });

      // Final Apply Code
      const finalRegex = /\`\`\`(?:file|delete):([^\n]+)\n([\s\S]*?)(?:\`\`\`|$)/g;
      let finalMatch;
      let fileCount = 0;
      while ((finalMatch = finalRegex.exec(fullResponse)) !== null) {
        onApplyCode(finalMatch[1].trim(), finalMatch[2]);
        fileCount++;
      }

      if (fileCount > 0 && appendTerminalOutput) {
        appendTerminalOutput(`[AI ZERO-CLICK] Otomatis membuat/mengedit ${fileCount} file di Editor.`);
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Terjadi error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className="flex items-center gap-2 opacity-50 px-2">
              {msg.role === 'user' ? (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">You</span>
                  <div className="w-5 h-5 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400"><User size={12} /></div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400"><Bot size={12} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-purple-400 italic">Composer</span>
                </>
              )}
            </div>
            
            <div className={cn(
              "w-[95%] p-3 rounded-2xl text-[13px] leading-relaxed shadow-lg max-w-full",
              msg.role === 'user' 
                ? "bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none self-end" 
                : "bg-[#252526] border border-white/10 text-gray-200 rounded-tl-none"
            )}>
              <div className="prose prose-invert prose-sm max-w-none">
                <Markdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(file|delete):([^\n]+)/.exec(className || '');
                      if (!inline && match) {
                        return (
                          <div className="my-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
                            <span className="flex items-center gap-2 font-mono break-all">
                              <span className="opacity-50 text-blue-300">File:</span> 
                              <b>{match[2].trim()}</b>
                            </span>
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider text-[9px] animate-pulse whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                              Sedang Di Tulis...
                            </span>
                          </div>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {msg.content}
                </Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 animate-pulse p-2">
            <Loader2 className="animate-spin text-purple-400" size={16} />
            <span className="text-xs text-purple-400">Thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-[#252526] border-t border-white/5">
         <div className="relative bg-[#1e1e1e] border border-white/10 rounded-2xl focus-within:border-blue-500/50 transition-all p-2 shadow-inner">
            <textarea 
              placeholder="Ask Composer to create or edit files... (Shift+Enter for newline)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent border-none outline-none text-[13px] text-white p-2 min-h-[60px] max-h-[200px] resize-none"
            />
            <div className="flex items-center justify-between mt-1 px-1">
              <div className="flex items-center gap-3">
                <div className="text-[10px] text-gray-500">
                  <span className="text-blue-400 font-bold">{files.length}</span> files in context
                </div>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#2a2a2a] text-[10px] text-gray-300 border border-white/10 rounded px-1.5 py-1 outline-none hover:border-blue-500/50 transition-colors cursor-pointer"
                  title="Pilih Kategori / Skill Scaffold"
                >
                  <option value="Auto">Auto (Default)</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="Frontend">Frontend Code</option>
                  <option value="Backend">Backend API</option>
                </select>
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all shadow-lg",
                  input.trim() && !isLoading ? "bg-blue-600 text-white hover:bg-blue-500 scale-105" : "bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed"
                )}
              >
                <Send size={16} />
              </button>
            </div>
         </div>
         <div className="mt-2 text-center">
            <span className="text-[9px] text-gray-600">Powered by Agentic Models ({model})</span>
         </div>
      </div>
    </div>
  );
};
