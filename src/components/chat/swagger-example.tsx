"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Copy, Check, Play, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MCPTool } from "@/lib/mcp-servers";

interface SwaggerExampleProps {
  tool: MCPTool;
  serverSlug: string;
  onTryIt: (params: Record<string, unknown>) => void;
}

export function SwaggerExample({ tool, serverSlug, onTryIt }: SwaggerExampleProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [copiedRequest, setCopiedRequest] = React.useState(false);
  const [copiedResponse, setCopiedResponse] = React.useState(false);

  const exampleRequest = tool.exampleRequest || generateExampleRequest(tool);
  const exampleResponse = tool.exampleResponse || generateExampleResponse(tool, serverSlug);

  const copyToClipboard = async (text: string, type: "request" | "response") => {
    await navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    if (type === "request") {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="bg-green-500/10 text-green-600 border-green-500/30 font-mono text-xs"
          >
            POST
          </Badge>
          <span className="font-mono text-sm font-medium">{tool.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {tool.description.slice(0, 40)}...
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Description */}
          <div className="p-3 bg-secondary/30">
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>

          {/* Parameters */}
          {tool.inputSchema.properties && Object.keys(tool.inputSchema.properties).length > 0 && (
            <div className="p-3 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Parameters
              </h4>
              <div className="space-y-2">
                {Object.entries(tool.inputSchema.properties).map(([key, prop]) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                      {key}
                    </code>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {prop.type}
                    </Badge>
                    {tool.inputSchema.required?.includes(key) && (
                      <Badge variant="destructive" className="text-[10px] h-5">
                        required
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex-1">
                      {prop.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Request */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                Example Request
              </h4>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => copyToClipboard(exampleRequest, "request")}
                >
                  {copiedRequest ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => onTryIt(exampleRequest as Record<string, unknown>)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Try it
                </Button>
              </div>
            </div>
            <pre className="text-xs bg-zinc-900 text-zinc-100 rounded-md p-3 overflow-x-auto font-mono">
              <code>{JSON.stringify(exampleRequest, null, 2)}</code>
            </pre>
          </div>

          {/* Example Response */}
          <div className="p-3 border-t border-border bg-secondary/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                  200
                </Badge>
                Example Response
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => copyToClipboard(exampleResponse, "response")}
              >
                {copiedResponse ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <pre className="text-xs bg-zinc-900 text-zinc-100 rounded-md p-3 overflow-x-auto font-mono max-h-64 overflow-y-auto">
              <code>{JSON.stringify(exampleResponse, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate example request based on input schema
function generateExampleRequest(tool: MCPTool): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  if (!tool.inputSchema.properties) return params;
  
  for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
    switch (prop.type) {
      case "string":
        params[key] = getExampleString(key, prop.description);
        break;
      case "number":
        params[key] = getExampleNumber(key);
        break;
      case "boolean":
        params[key] = true;
        break;
      case "array":
        params[key] = getExampleArray(key);
        break;
      case "object":
        params[key] = getExampleObject(key);
        break;
    }
  }
  
  return params;
}

function getExampleString(key: string, description?: string): string {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes("path") || keyLower.includes("file")) return "/Users/demo/example.txt";
  if (keyLower.includes("url")) return "https://api.example.com/data";
  if (keyLower.includes("query") || keyLower.includes("search")) return "example search query";
  if (keyLower.includes("email")) return "user@example.com";
  if (keyLower.includes("name")) return "Example Name";
  if (keyLower.includes("id")) return "abc123";
  if (keyLower.includes("owner")) return "octocat";
  if (keyLower.includes("repo")) return "hello-world";
  if (keyLower.includes("branch")) return "main";
  if (keyLower.includes("message") || keyLower.includes("content") || keyLower.includes("text")) return "Hello, World!";
  if (keyLower.includes("channel")) return "#general";
  if (keyLower.includes("timezone")) return "America/New_York";
  if (keyLower.includes("sql") || keyLower.includes("query")) return "SELECT * FROM users LIMIT 10";
  if (keyLower.includes("selector")) return "button.submit";
  if (keyLower.includes("prompt")) return "Explain quantum computing in simple terms";
  if (keyLower.includes("key")) return "my-key";
  if (keyLower.includes("bucket")) return "my-bucket";
  if (keyLower.includes("table") || keyLower.includes("collection")) return "users";
  if (keyLower.includes("container") || keyLower.includes("image")) return "nginx:latest";
  
  return description?.includes("ID") ? "abc123" : "example_value";
}

function getExampleNumber(key: string): number {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes("limit") || keyLower.includes("count") || keyLower.includes("max")) return 10;
  if (keyLower.includes("page")) return 1;
  if (keyLower.includes("port")) return 8080;
  if (keyLower.includes("amount")) return 1000;
  if (keyLower.includes("lat")) return 37.7749;
  if (keyLower.includes("lng") || keyLower.includes("lon")) return -122.4194;
  if (keyLower.includes("radius")) return 1000;
  if (keyLower.includes("duration") || keyLower.includes("timeout")) return 5;
  if (keyLower.includes("temperature")) return 0.7;
  if (keyLower.includes("token")) return 1000;
  
  return 10;
}

function getExampleArray(key: string): unknown[] {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes("path")) return ["/file1.txt", "/file2.txt"];
  if (keyLower.includes("message")) return [{ role: "user", content: "Hello!" }];
  if (keyLower.includes("entit")) return [{ name: "Example", type: "item" }];
  if (keyLower.includes("file")) return [{ path: "file.txt", content: "content" }];
  if (keyLower.includes("document")) return [{ title: "Doc 1" }];
  if (keyLower.includes("label")) return ["bug", "enhancement"];
  
  return ["item1", "item2"];
}

function getExampleObject(key: string): Record<string, unknown> {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes("filter")) return { status: "active" };
  if (keyLower.includes("sort")) return { field: "created_at", order: "desc" };
  if (keyLower.includes("payload")) return { action: "test", data: {} };
  if (keyLower.includes("update")) return { $set: { status: "updated" } };
  if (keyLower.includes("properties") || keyLower.includes("fields")) return { title: "Updated Title" };
  if (keyLower.includes("edit")) return { oldText: "old", newText: "new" };
  
  return { key: "value" };
}

// Generate example response based on tool and server
function generateExampleResponse(tool: MCPTool, serverSlug: string): unknown {
  const toolName = tool.name.toLowerCase();
  
  // Server-specific responses
  const responses: Record<string, Record<string, unknown>> = {
    filesystem: {
      read_file: {
        content: "Hello, World!\n\nThis is the content of the file.\nLine 2\nLine 3",
        size: 58,
        lastModified: "2026-01-15T10:30:00Z",
        path: "/Users/demo/example.txt"
      },
      list_directory: {
        path: "/Users/demo",
        entries: [
          { name: "Documents", type: "directory", modified: "2026-01-14T09:00:00Z" },
          { name: "Downloads", type: "directory", modified: "2026-01-15T08:30:00Z" },
          { name: "readme.md", type: "file", size: 2048, modified: "2026-01-10T12:00:00Z" }
        ],
        count: 3
      },
      write_file: { success: true, bytesWritten: 13, path: "/Users/demo/new-file.txt" },
      get_file_info: { path: "/Users/demo/file.txt", size: 1024, isFile: true, created: "2026-01-01T00:00:00Z", modified: "2026-01-15T10:00:00Z" }
    },
    github: {
      search_repositories: {
        query: "react",
        totalCount: 1543,
        results: [
          { fullName: "facebook/react", description: "A declarative JavaScript library for building user interfaces", stars: 225000, language: "JavaScript" },
          { fullName: "facebook/react-native", description: "A framework for building native applications", stars: 117000, language: "JavaScript" }
        ]
      },
      get_file_contents: { path: "README.md", name: "README.md", content: "# React\n\nA JavaScript library for building user interfaces.", sha: "abc123" },
      list_commits: {
        commits: [
          { sha: "abc1234", message: "feat: add new feature", author: "developer", date: "2026-01-15T10:00:00Z" },
          { sha: "def5678", message: "fix: resolve bug", author: "developer", date: "2026-01-14T15:30:00Z" }
        ]
      },
      list_issues: {
        issues: [
          { number: 123, title: "Bug: Component rendering issue", state: "open", author: "user1", labels: ["bug"] },
          { number: 122, title: "Feature: Add dark mode", state: "open", author: "user2", labels: ["enhancement"] }
        ]
      }
    },
    openai: {
      chat_completion: {
        model: "gpt-4o-mini",
        content: "Quantum computing uses quantum mechanics principles like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can be both 0 and 1 simultaneously, enabling them to solve certain problems much faster.",
        usage: { prompt_tokens: 15, completion_tokens: 60, total_tokens: 75 }
      },
      generate_image: {
        prompt: "A futuristic city at sunset",
        images: [{ url: "https://example.com/image.png", revisedPrompt: "A futuristic city with flying cars at sunset" }]
      },
      list_models: {
        models: [
          { id: "gpt-4o", owner: "openai" },
          { id: "gpt-4o-mini", owner: "openai" },
          { id: "dall-e-3", owner: "openai" }
        ]
      }
    },
    slack: {
      list_channels: {
        channels: [
          { id: "C001", name: "general", isPrivate: false, members: 150 },
          { id: "C002", name: "engineering", isPrivate: false, members: 45 }
        ]
      },
      post_message: { success: true, channel: "#general", timestamp: "1705312800.000001" },
      get_channel_history: {
        messages: [
          { timestamp: "1705312800.000001", text: "Hello team!", user: "U001" },
          { timestamp: "1705312700.000001", text: "Good morning", user: "U002" }
        ]
      }
    },
    stripe: {
      list_customers: {
        customers: [
          { id: "cus_001", email: "alice@example.com", name: "Alice Johnson", created: "2026-01-01" },
          { id: "cus_002", email: "bob@example.com", name: "Bob Smith", created: "2026-01-05" }
        ]
      },
      create_customer: { id: "cus_new", email: "new@example.com", name: "New Customer", created: "2026-01-15T10:00:00Z" },
      create_payment_intent: { id: "pi_123", amount: 1000, currency: "usd", status: "requires_payment_method", clientSecret: "pi_123_secret_456" }
    },
    docker: {
      list_containers: {
        containers: [
          { id: "abc123", name: "nginx-server", image: "nginx:latest", status: "Up 2 hours", ports: "80:80" },
          { id: "def456", name: "postgres-db", image: "postgres:15", status: "Up 1 day", ports: "5432:5432" }
        ],
        count: 2
      },
      list_images: {
        images: [
          { repository: "nginx", tag: "latest", id: "sha256:abc", size: "142MB" },
          { repository: "postgres", tag: "15", id: "sha256:def", size: "379MB" }
        ]
      },
      container_logs: { container: "nginx-server", logs: ["Server started", "Listening on port 80"], lines: 2 }
    },
    sqlite: {
      read_query: {
        columns: ["id", "name", "email"],
        rows: [
          { id: 1, name: "Alice", email: "alice@example.com" },
          { id: 2, name: "Bob", email: "bob@example.com" }
        ],
        rowCount: 2,
        executionTime: "5ms"
      },
      list_tables: { tables: ["users", "orders", "products"], count: 3 }
    },
    time: {
      get_current_time: {
        timezone: "America/New_York",
        datetime: "2026-01-15T10:30:00-05:00",
        formatted: "Wednesday, January 15, 2026 at 10:30:00 AM EST",
        unix: 1768502200
      },
      convert_time: {
        original: { time: "2026-01-15T10:00:00", timezone: "America/Los_Angeles" },
        converted: { timezone: "Europe/London", formatted: "Wednesday, January 15, 2026 at 6:00:00 PM GMT" }
      }
    },
    fetch: {
      fetch: {
        url: "https://api.github.com/users/octocat",
        status: 200,
        statusText: "OK",
        content: { login: "octocat", id: 583231, name: "The Octocat", company: "@github" },
        totalLength: 1234
      }
    },
    memory: {
      create_entities: { created: [{ name: "John", type: "person" }], totalEntities: 5 },
      search_nodes: { results: [{ name: "John", type: "person", observations: ["Engineer"] }], count: 1 },
      read_graph: { entities: [{ name: "John", type: "person" }], relations: [{ from: "John", to: "TechCorp", type: "works_at" }] }
    },
    notion: {
      search_pages: {
        results: [
          { id: "page_001", title: "Meeting Notes", url: "https://notion.so/page_001" },
          { id: "page_002", title: "Project Plan", url: "https://notion.so/page_002" }
        ],
        count: 2
      },
      get_page: { id: "page_001", title: "Meeting Notes", content: "Discussion points...", url: "https://notion.so/page_001" }
    },
    aws: {
      s3_list_buckets: { buckets: [{ name: "my-bucket", creationDate: "2025-06-15" }] },
      s3_list_objects: { bucket: "my-bucket", objects: [{ key: "file.txt", size: 1024 }] },
      ec2_describe_instances: { instances: [{ instanceId: "i-123", state: "running", type: "t3.medium" }] }
    }
  };

  // Get server-specific response or generate generic one
  const serverResponses = responses[serverSlug];
  if (serverResponses && serverResponses[tool.name]) {
    return serverResponses[tool.name];
  }

  // Generic response based on tool name patterns
  if (toolName.includes("list") || toolName.includes("search") || toolName.includes("get")) {
    return {
      results: [{ id: "1", name: "Example Item" }],
      count: 1,
      executionTime: "15ms"
    };
  }
  
  if (toolName.includes("create") || toolName.includes("add") || toolName.includes("post") || toolName.includes("send")) {
    return {
      success: true,
      id: "new_" + Date.now(),
      created: new Date().toISOString()
    };
  }
  
  if (toolName.includes("update") || toolName.includes("edit")) {
    return {
      success: true,
      updated: true,
      modifiedAt: new Date().toISOString()
    };
  }
  
  if (toolName.includes("delete") || toolName.includes("remove")) {
    return {
      success: true,
      deleted: true
    };
  }

  return {
    success: true,
    result: "Operation completed",
    executionTime: "10ms"
  };
}
