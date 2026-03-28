import { useState, useRef } from 'react';
import { generateComposerStream, parseComposerResponse, parseMcpToolCalls } from '../services/ai/composerService';
import { mcpManager } from '../services/mcpService';

export const useAutonomousAI = (
  provider: string,
  apiKey: string,
  model: string,
  files: any[],
  category: string,
  activeFileId: string,
  projectTree: string,
  mcpTools: any[],
  ollamaUrl: string,
  setMessages: (updater: (prev: any[]) => any[]) => void,
  appendTerminalOutput: (msg: string) => void,
  onApplyCode: (path: string, content: string, action?: "create_or_modify" | "delete") => Promise<void>,
  onSuccess: (stats: { fileCount: number; commands: string[]; }) => void
) => {
  const [isLooping, setIsLooping] = useState(false);
  const watchTimerRef = useRef<any>(null);

  const runAutonomousLoop = async (userPrompt: string) => {
    setIsLooping(true);
    let loopCount = 0;
    const MAX_LOOPS = 5;
    let currentPrompt = userPrompt;
    let fullResponse = '';

    try {
      while (loopCount < MAX_LOOPS) {
        loopCount++;
        const stream = generateComposerStream(
          provider, apiKey, model, currentPrompt, files, category, 
          activeFileId, projectTree, mcpTools, ollamaUrl
        );

        fullResponse = '';
        // Start streaming to the UI
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'assistant', content: fullResponse };
            return newMsgs;
          });
        }

        // --- STEP 2: PARSE FOR TOOL CALLS ---
        const toolCalls = parseMcpToolCalls(fullResponse);
        if (toolCalls.length === 0) break; // No tools needed, loop ends.

        // --- STEP 3: EXECUTE TOOLS (Zero-Click) ---
        for (const call of toolCalls) {
          appendTerminalOutput(`[MCP] AURA Memanggil Tool: ${call.clientName}/${call.toolName}...`);
          
          // UI Feedback: Small status update
          setMessages(prev => [...prev, { role: 'assistant', content: `🛠️ *Menjalankan tool: ${call.clientName}/${call.toolName}...*` }]);

          try {
            const result = await mcpManager.callTool(call.clientName, call.toolName, call.args);
            const resultStr = JSON.stringify(result, null, 2);
            
            // FEEDBACK TO AI: Add as context for next iteration
            currentPrompt = `OBSERVATION from tool '${call.toolName}':\n${resultStr}\n\nSilakan lanjutkan pekerjaan Anda berdasarkan data di atas.`;
            
            appendTerminalOutput(`[MCP] Tool ${call.toolName} sukses dieksekusi.`);
          } catch (e: any) {
            currentPrompt = `ERROR executing tool '${call.toolName}': ${e.message}\nSilakan cari solusi lain atau beritahu user.`;
            setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error Tool: ${e.message}` }]);
            appendTerminalOutput(`[MCP ERROR] Tool ${call.toolName} gagal: ${e.message}`);
          }
        }
      }

      // --- FINAL STEP: APPLY CODE CHANGES ---
      const filesToApply = parseComposerResponse(fullResponse);
      if (filesToApply.length > 0) {
        for (const file of filesToApply) {
          await onApplyCode(file.path, file.content, file.action as 'create_or_modify' | 'delete');
        }
        
        // Return summary stats to the IDE
        onSuccess({
          fileCount: filesToApply.length,
          commands: [], // Future: extract commands if any
        });
      }
    } catch (err: any) {
      console.error("Autonomous Loop Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Terjadi kesalahan pada loop otonom: ${err.message}` }]);
    } finally {
      setIsLooping(false);
    }
  };

  return { runAutonomousLoop, isLooping };
};
