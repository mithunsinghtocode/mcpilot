"use client";

import * as React from "react";
import { Menu, PanelRightOpen, PanelRightClose, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useChatStore } from "@/lib/store";
import { MCPServer, MCPTool, getServerBySlug, getAllServers } from "@/lib/mcp-servers";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessage } from "@/components/chat/message";
import { ChatInput } from "@/components/chat/chat-input";
import { ServerPanel } from "@/components/chat/server-panel";
import { HotPicks } from "@/components/chat/hot-picks";
import { ServersModal } from "@/components/chat/servers-modal";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [serverPanelOpen, setServerPanelOpen] = React.useState(true);
  const [serversModalOpen, setServersModalOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const {
    messages,
    activeServer,
    activeTool,
    setActiveServer,
    setActiveTool,
    addMessage,
    updateMessage,
    clearMessages,
  } = useChatStore();

  // Auto scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectServer = (server: MCPServer) => {
    setActiveServer(server);
    setActiveTool(null);
    setServerPanelOpen(true);
    setServersModalOpen(false);
    
    addMessage({
      role: "assistant",
      content: `Connected to **${server.name}** ${server.icon}

${server.description}

---

### 🚀 Quick Start

**📋 API Panel (right side) →**
- **API Tab**: Browse all ${server.tools.length} endpoints with request/response examples
- **Try It Tab**: Fill parameters and execute interactively
- **Setup Tab**: Configuration guide

**💬 Or use chat commands:**
\`\`\`
${server.tools[0]?.name} ${server.tools[0]?.exampleRequest ? JSON.stringify(server.tools[0].exampleRequest) : '{ }'}
\`\`\`

**Available Tools:** ${server.tools.slice(0, 5).map((t) => `\`${t.name}\``).join(", ")}${server.tools.length > 5 ? ` + ${server.tools.length - 5} more` : ""}`,
      server,
    });
  };

  const handleSelectTool = (tool: MCPTool) => {
    setActiveTool(tool);
    setServerPanelOpen(true);
    
    const hasParams = tool.inputSchema.properties && Object.keys(tool.inputSchema.properties).length > 0;
    
    addMessage({
      role: "assistant",
      content: `### ${tool.name}

${tool.description}

${hasParams ? `**Parameters:**
${Object.entries(tool.inputSchema.properties!)
  .map(([key, prop]) => `| \`${key}\` | ${prop.type} | ${tool.inputSchema.required?.includes(key) ? "✓" : ""} | ${prop.description} |`)
  .join("\n")}` : "✅ This tool has no parameters - ready to execute!"}

---

**Execute via chat:**
\`\`\`
${tool.name} ${tool.exampleRequest ? JSON.stringify(tool.exampleRequest) : '{}'}
\`\`\`

**Or use the Try It panel →** (already selected)`,
      server: activeServer!,
      tool,
    });
  };

  const handleExecute = async (tool: MCPTool, params: Record<string, unknown>, mode: "mock" | "real" = "mock") => {
    if (!activeServer) return;

    const modeLabel = mode === "mock" ? "🧪 Mock" : "⚡ Real";
    const modeEmoji = mode === "mock" ? "🧪" : "⚡";

    addMessage({
      role: "user",
      content: `Execute \`${tool.name}\` (${modeLabel})`,
    });

    // Add loading message
    addMessage({
      role: "assistant",
      content: `${modeEmoji} Executing \`${tool.name}\` in ${mode} mode...`,
      server: activeServer,
      tool,
      request: params,
      isLoading: true,
    });

    try {
      // Call the API
      const response = await fetch("/api/mcp/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverSlug: activeServer.slug,
          toolName: tool.name,
          params,
          mode,
        }),
      });

      const data = await response.json();
      
      // Find and update the loading message
      const messages = useChatStore.getState().messages;
      const loadingMsg = messages.find((m) => m.isLoading);
      
      if (loadingMsg) {
        if (data.error) {
          updateMessage(loadingMsg.id, {
            content: `❌ Error executing \`${tool.name}\` (${mode} mode)`,
            response: { 
              error: data.error, 
              tip: data.tip,
              missingEnv: data.missingEnv,
              mode 
            },
            isLoading: false,
            isError: true,
          });
        } else {
          const successEmoji = mode === "mock" ? "🧪" : "✅";
          updateMessage(loadingMsg.id, {
            content: `${successEmoji} Executed \`${tool.name}\` successfully! (${mode === "mock" ? "Mock Data" : "Real Data"})`,
            response: { ...data.result, _mode: mode, _executionTime: data.executionTime },
            isLoading: false,
            isError: false,
          });
        }
      }
    } catch (error) {
      const messages = useChatStore.getState().messages;
      const loadingMsg = messages.find((m) => m.isLoading);
      
      if (loadingMsg) {
        updateMessage(loadingMsg.id, {
          content: `❌ Failed to execute \`${tool.name}\``,
          response: { error: error instanceof Error ? error.message : "Unknown error" },
          isLoading: false,
          isError: true,
        });
      }
    }
  };

  // Parse tool command from input (e.g., "read_file /path/to/file")
  const parseToolCommand = (input: string): { tool: MCPTool; params: Record<string, unknown> } | null => {
    if (!activeServer) return null;

    // Try to match tool name at the beginning
    for (const tool of activeServer.tools) {
      if (input.toLowerCase().startsWith(tool.name.toLowerCase())) {
        const rest = input.slice(tool.name.length).trim();
        const params: Record<string, unknown> = {};
        
        // Try to parse as JSON
        if (rest.startsWith("{")) {
          try {
            const parsed = JSON.parse(rest);
            return { tool, params: parsed };
          } catch {
            // Not valid JSON, continue
          }
        }

        // Try to extract path or simple parameter
        if (rest) {
          // Remove quotes if present
          let value = rest.replace(/^["']|["']$/g, "");
          
          // Get the first required parameter
          const firstRequired = tool.inputSchema.required?.[0];
          const firstProp = Object.keys(tool.inputSchema.properties || {})[0];
          const paramKey = firstRequired || firstProp;
          
          if (paramKey) {
            params[paramKey] = value;
            return { tool, params };
          }
        }

        // Tool with no params
        if (Object.keys(tool.inputSchema.properties || {}).length === 0) {
          return { tool, params: {} };
        }
      }
    }

    return null;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const input = inputValue.trim();
    setInputValue("");

    // Handle commands
    if (input.startsWith("/")) {
      handleCommand(input);
      return;
    }

    // Try to parse as tool command if server is active
    if (activeServer) {
      const toolCommand = parseToolCommand(input);
      if (toolCommand) {
        // Add user message
        addMessage({
          role: "user",
          content: input,
        });
        
        // Execute the tool
        handleExecute(toolCommand.tool, toolCommand.params);
        return;
      }
    }

    // Regular message
    addMessage({
      role: "user",
      content: input,
    });

    if (activeServer) {
      // Check if input might be referencing a tool
      const matchedTool = activeServer.tools.find(t => 
        input.toLowerCase().includes(t.name.toLowerCase())
      );

      if (matchedTool) {
        setActiveTool(matchedTool);
        setServerPanelOpen(true); // Open the panel automatically
        addMessage({
          role: "assistant",
          content: `Ready to execute **${matchedTool.name}** 🚀

**Option 1:** Type the full command:
\`\`\`json
${matchedTool.name} ${matchedTool.exampleRequest ? JSON.stringify(matchedTool.exampleRequest, null, 2) : '{ }'}
\`\`\`

**Option 2:** Use the **API panel** on the right →
1. The tool is already selected in the "Try It" tab
2. Fill in the parameters
3. Click **Execute**

💡 Check the **API tab** for example requests and responses!`,
          server: activeServer,
          tool: matchedTool,
        });
      } else {
        setServerPanelOpen(true); // Open the panel automatically
        addMessage({
          role: "assistant",
          content: `Connected to **${activeServer.name}** ${activeServer.icon}

**How to execute tools:**

1️⃣ **Chat command:**
\`tool_name { "param": "value" }\`

2️⃣ **API Panel (right side) →**
- Click **API** tab to see all endpoints with examples
- Click **Try It** tab to execute interactively

**Available tools:** ${activeServer.tools.map((t) => `\`${t.name}\``).join(", ")}`,
          server: activeServer,
        });
      }
    } else {
      addMessage({
        role: "assistant",
        content: `To test MCP servers, first connect to one:

**Quick Connect:**
- \`/filesystem\` — File operations
- \`/github\` — GitHub API
- \`/postgres\` — PostgreSQL queries
- \`/fetch\` — HTTP requests

Or type \`/servers\` to browse all ${getAllServers().length} available servers.`,
      });
    }
  };

  const handleCommand = (input: string) => {
    const cmd = input.toLowerCase().trim();
    
    // Add user message first
    addMessage({
      role: "user",
      content: input,
    });

    if (cmd === "/help") {
      addMessage({
        role: "system",
        content: `**Available Commands:**

| Command | Description |
|---------|-------------|
| \`/servers\` | Browse all ${getAllServers().length} MCP servers |
| \`/[server-name]\` | Connect to a server (e.g., \`/filesystem\`) |
| \`/hot\` | Show trending servers |
| \`/clear\` | Clear chat history |
| \`/help\` | Show this help |

**Tool Execution:**
Once connected to a server, execute tools using:
\`\`\`
tool_name { "param": "value" }
\`\`\`

Or use the interactive panel on the right.

**Supported Servers (with real execution):**
- \`/filesystem\` — Read, write, list files (✅ real data)
- \`/fetch\` — HTTP requests (✅ real data)`,
      });
      return;
    }

    if (cmd === "/clear") {
      clearMessages();
      setActiveServer(null);
      setActiveTool(null);
      return;
    }

    if (cmd === "/servers") {
      setServersModalOpen(true);
      addMessage({
        role: "system",
        content: `Opening server browser... Browse all ${getAllServers().length} available MCP servers.`,
      });
      return;
    }

    if (cmd === "/hot") {
      // Message added, HotPicks will be displayed
      addMessage({
        role: "system",
        content: `**🔥 Hot Picks** — Most popular MCP servers`,
      });
      return;
    }

    // Server command (e.g., /filesystem)
    const serverSlug = cmd.slice(1);
    const server = getServerBySlug(serverSlug);
    
    if (server) {
      handleSelectServer(server);
      return;
    }

    // Unknown command
    addMessage({
      role: "system",
      content: `Unknown command: \`${input}\`

Type \`/help\` to see available commands, or \`/servers\` to browse available MCP servers.`,
    });
  };

  const handleCommandFromPalette = (command: string) => {
    setInputValue("");
    handleCommand(command);
  };

  const handleClearActive = () => {
    setActiveServer(null);
    setActiveTool(null);
    addMessage({
      role: "system",
      content: "Disconnected from server. Type `/` to browse available MCP servers.",
    });
  };

  const showHotPicks = messages.some(
    (m) =>
      (m.content.includes("/hot") && m.role === "user") ||
      m.id === "welcome"
  ) && !activeServer;

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectServer={handleSelectServer}
          activeServer={activeServer}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 border-b border-border flex items-center gap-2 px-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              {activeServer ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeServer.icon}</span>
                  <span className="font-medium">{activeServer.name}</span>
                  {activeTool && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-sm text-muted-foreground">
                        {activeTool.name}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">MCPilot</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServersModalOpen(true)}
                    className="ml-2"
                  >
                    <Server className="w-4 h-4 mr-1" />
                    Browse Servers
                  </Button>
                </div>
              )}
            </div>

            {activeServer && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setServerPanelOpen(!serverPanelOpen)}
              >
                {serverPanelOpen ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </Button>
            )}
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto p-4 space-y-4">
                  {/* Messages */}
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {/* Hot Picks inline */}
                  {showHotPicks && (
                    <div className="my-6">
                      <HotPicks 
                        onSelectServer={handleSelectServer} 
                        onViewAll={() => setServersModalOpen(true)}
                      />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="max-w-3xl mx-auto">
                  <ChatInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSend}
                    onSelectServer={handleSelectServer}
                    onCommand={handleCommandFromPalette}
                    activeServer={activeServer}
                    activeTool={activeTool}
                    onClearActive={handleClearActive}
                  />
                </div>
              </div>
            </div>

            {/* Server Panel */}
            {activeServer && serverPanelOpen && (
              <div className="w-96 flex-shrink-0 hidden lg:block">
                <ServerPanel
                  server={activeServer}
                  selectedTool={activeTool}
                  onSelectTool={handleSelectTool}
                  onExecute={handleExecute}
                />
              </div>
            )}
          </div>
        </main>

        {/* Servers Modal */}
        <ServersModal
          open={serversModalOpen}
          onOpenChange={setServersModalOpen}
          onSelectServer={handleSelectServer}
        />
      </div>
    </TooltipProvider>
  );
}
