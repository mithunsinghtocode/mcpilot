import { create } from "zustand";
import { MCPServer, MCPTool, getAllServers } from "./mcp-servers";
import { generateId } from "./utils";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  server?: MCPServer;
  tool?: MCPTool;
  request?: Record<string, unknown>;
  response?: unknown;
  isLoading?: boolean;
  isError?: boolean;
}

interface ChatState {
  messages: Message[];
  activeServer: MCPServer | null;
  activeTool: MCPTool | null;
  isCommandMode: boolean;
  commandQuery: string;
  
  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setActiveServer: (server: MCPServer | null) => void;
  setActiveTool: (tool: MCPTool | null) => void;
  setCommandMode: (active: boolean) => void;
  setCommandQuery: (query: string) => void;
  clearMessages: () => void;
}

const serverCount = getAllServers().length;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: "welcome",
      role: "system",
      content: `Welcome to **MCPilot** ✨ — Your AI Protocol Testing Co-pilot

Test and explore **${serverCount}** MCP servers with an interactive Swagger-like interface.

**Quick Start:**
- Type \`/\` to browse servers and commands
- Use \`/filesystem\` to connect to the Filesystem MCP
- Use \`/servers\` to browse all available servers

**Execute Tools:**
Once connected, type tool commands like:
\`\`\`
read_file { "path": "/path/to/file" }
\`\`\`
Or use the interactive panel on the right.`,
      timestamp: new Date(),
    },
  ],
  activeServer: null,
  activeTool: null,
  isCommandMode: false,
  commandQuery: "",

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: generateId(), timestamp: new Date() },
      ],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setActiveServer: (server) => set({ activeServer: server }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setCommandMode: (active) => set({ isCommandMode: active }),
  
  setCommandQuery: (query) => set({ commandQuery: query }),
  
  clearMessages: () =>
    set({
      messages: [
        {
          id: generateId(),
          role: "system",
          content: `Chat cleared. Type \`/\` to browse ${serverCount} MCP servers.`,
          timestamp: new Date(),
        },
      ],
      activeServer: null,
      activeTool: null,
    }),
}));
