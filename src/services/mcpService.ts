import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { Command, Child } from "@tauri-apps/plugin-shell";

export interface MCPConfig {
  serverUrl: string; // Used for SSE URL or STDIO Command
  name: string;
  type: 'sse' | 'stdio';
  env?: Record<string, string>;
}

export class TauriStdioTransport implements Transport {
  private child?: Child;
  private commandStr: string;
  private env?: Record<string, string>;
  private buffer: string = '';

  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onlog?: (log: string) => void;

  constructor(commandStr: string, env?: Record<string, string>) {
    this.commandStr = commandStr;
    this.env = env;
  }

  async start(): Promise<void> {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    let cmdName = isWindows ? 'cmd' : 'sh';
    
    // --- UNIVERSAL NPX RESOLUTION (v1.6.0) ---
    let finalCommand = this.commandStr;
    if (isWindows && this.commandStr.startsWith('npx')) {
      try {
        const checkCmd = Command.create('cmd', ['/c', 'where', 'npx']);
        const out = await checkCmd.execute();
        if (out.code === 0 && out.stdout) {
           const lines = out.stdout.split('\r\n').filter(l => l.trim());
           // PREFER .cmd or .exe on Windows
           const preferred = lines.find(l => l.toLowerCase().endsWith('.cmd') || l.toLowerCase().endsWith('.exe')) || lines[0];
           const fullPath = preferred.trim();
           finalCommand = `"${fullPath}" ${this.commandStr.substring(3).trim()}`;
           this.onlog?.(`[MCP INFO] Resolved npx to: ${fullPath}`);
        }
      } catch (e) {}
    }

    const command = Command.create(cmdName, [isWindows ? '/c' : '-c', finalCommand], { env: this.env });
    
    command.on('close', () => {
      this.onlog?.(`[Process Closed]`);
      this.onclose?.()
    });
    command.on('error', err => {
      this.onlog?.(`[Process Error] ${err}`);
      this.onerror?.(new Error(err))
    });

    command.stdout.on('data', line => {
      this.buffer += line;
      let newlines = this.buffer.split('\n');
      this.buffer = newlines.pop() || '';
      for (const completeLine of newlines) {
        const trimmed = completeLine.trim();
        if (!trimmed) continue;
        try {
          const message = JSON.parse(trimmed) as JSONRPCMessage;
          this.onmessage?.(message);
        } catch (e) {
          console.warn("[MCP Transport Parse Error]", e, trimmed);
        }
      }
    });

    command.stderr.on('data', line => {
      console.log(`[MCP ${this.commandStr}] STDERR:`, line);
      this.onlog?.(line);
    });

    this.child = await command.spawn();
    this.onlog?.(`[Process Spawned] PID: ${this.child.pid}`);
  }

  async close(): Promise<void> {
    if (this.child) {
      await this.child.kill();
    }
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (!this.child) throw new Error("Transport not started");
    const jsonStr = JSON.stringify(message) + '\n';
    await this.child.write(jsonStr);
  }
}

export class MCPManager {
  private clients: Map<string, { client: Client, tools: any[], logs: string[] }> = new Map();

  async connect(config: MCPConfig) {
    let transport: Transport;
    const sessionLogs: string[] = [];
    
    if (config.type === 'stdio') {
      const isTauri = !!(window as any).__TAURI_INTERNALS__;
      if (!isTauri) {
        throw new Error("Local Command (stdio) MCP servers are only supported in the Desktop App version of Aura IDE. Please open the IDE via the native Windows app (or run 'npm run tauri dev'), or choose an SSE (Remote URL) server instead.");
      }
      const stdioTransport = new TauriStdioTransport(config.serverUrl, config.env);
      stdioTransport.onlog = (log) => {
        sessionLogs.push(log);
        // keep only last 1000 lines
        if (sessionLogs.length > 1000) sessionLogs.shift();
      };
      transport = stdioTransport;
    } else {
      transport = new SSEClientTransport(new URL(config.serverUrl));
    }

    const client = new Client(
      { name: "AuraIDE-Client", version: "1.0.0" },
      { capabilities: {} }
    );

    await client.connect(transport);
    
    // Auto-fetch tools after connecting
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];
    
    this.clients.set(config.name, { client, tools, logs: sessionLogs });
    return tools;
  }

  getTools(clientName: string) {
    const session = this.clients.get(clientName);
    return session ? session.tools : [];
  }

  getLogs(clientName: string): string[] {
    const session = this.clients.get(clientName);
    return session ? session.logs : [];
  }

  async callTool(clientName: string, toolName: string, args: any) {
    const session = this.clients.get(clientName);
    if (!session?.client) throw new Error("Client not found");
    return await session.client.callTool({ name: toolName, arguments: args });
  }
}

export const mcpManager = new MCPManager();
