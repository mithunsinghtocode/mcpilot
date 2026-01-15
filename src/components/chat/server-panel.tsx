"use client";

import * as React from "react";
import { 
  Play, 
  ChevronRight, 
  ExternalLink, 
  Copy, 
  Check,
  BookOpen,
  Zap,
  RotateCcw,
  Code2,
  FlaskConical,
  Rocket,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileJson
} from "lucide-react";
import { cn, formatJson } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MCPServer, MCPTool } from "@/lib/mcp-servers";
import { SwaggerExample } from "./swagger-example";

interface ServerPanelProps {
  server: MCPServer;
  onSelectTool: (tool: MCPTool) => void;
  onExecute: (tool: MCPTool, params: Record<string, unknown>, mode: "mock" | "real") => void;
  selectedTool: MCPTool | null;
}

export function ServerPanel({ 
  server, 
  onSelectTool, 
  onExecute,
  selectedTool 
}: ServerPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [params, setParams] = React.useState<Record<string, string>>({});
  const [jsonMode, setJsonMode] = React.useState(false);
  const [jsonInput, setJsonInput] = React.useState("{}");
  const [executionMode, setExecutionMode] = React.useState<"mock" | "real">("mock");

  // Reset params when tool changes
  React.useEffect(() => {
    setParams({});
    if (selectedTool?.exampleRequest) {
      setJsonInput(JSON.stringify(selectedTool.exampleRequest, null, 2));
    } else {
      setJsonInput("{}");
    }
  }, [selectedTool]);

  const copyCommand = async () => {
    if (server.command) {
      await navigator.clipboard.writeText(server.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    if (selectedTool) {
      let parsedParams: Record<string, unknown> = {};
      
      if (jsonMode) {
        try {
          parsedParams = JSON.parse(jsonInput);
        } catch {
          alert("Invalid JSON. Please check your input.");
          return;
        }
      } else {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            try {
              parsedParams[key] = JSON.parse(value);
            } catch {
              parsedParams[key] = value;
            }
          }
        });
      }
      
      onExecute(selectedTool, parsedParams, executionMode);
    }
  };

  const handleUseExample = () => {
    if (selectedTool?.exampleRequest) {
      const newParams: Record<string, string> = {};
      Object.entries(selectedTool.exampleRequest).forEach(([k, v]) => {
        newParams[k] = typeof v === "string" ? v : JSON.stringify(v);
      });
      setParams(newParams);
      setJsonInput(JSON.stringify(selectedTool.exampleRequest, null, 2));
    }
  };

  const handleReset = () => {
    setParams({});
    setJsonInput("{}");
  };

  const hasRequiredEnv = server.requiredEnv && server.requiredEnv.length > 0;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{server.icon}</span>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{server.name}</h2>
            <p className="text-sm text-muted-foreground">v{server.version} by {server.author}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{server.description}</p>
        
        {/* Mode Toggle */}
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Execution Mode
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={executionMode === "mock" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1 h-9",
                executionMode === "mock" && "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => setExecutionMode("mock")}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Mock
            </Button>
            <Button
              variant={executionMode === "real" ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1 h-9",
                executionMode === "real" && "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => setExecutionMode("real")}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Real
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {executionMode === "mock" 
              ? "🧪 Returns sample data without configuration. Great for testing!"
              : hasRequiredEnv 
                ? `⚡ Executes real operations. Requires: ${server.requiredEnv?.join(", ")}`
                : "⚡ Executes real operations on your system."
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {server.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="swagger" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="swagger">
            <FileJson className="w-3 h-3 mr-1" />
            API
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Zap className="w-3 h-3 mr-1" />
            Try It
          </TabsTrigger>
          <TabsTrigger value="guide">
            <BookOpen className="w-3 h-3 mr-1" />
            Setup
          </TabsTrigger>
        </TabsList>

        {/* Swagger-like API Documentation */}
        <TabsContent value="swagger" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {/* Header like Swagger */}
              <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{server.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{server.name} API</h3>
                    <p className="text-xs text-muted-foreground">v{server.version} • {server.tools.length} endpoints</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{server.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    executionMode === "mock" 
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "bg-green-500/10 text-green-600 border-green-500/30"
                  )}>
                    {executionMode === "mock" ? "🧪 Mock Mode" : "⚡ Real Mode"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {server.connectionType.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* API Endpoints */}
              <div className="space-y-2">
                {server.tools.map((tool) => (
                  <SwaggerExample
                    key={tool.name}
                    tool={tool}
                    serverSlug={server.slug}
                    onTryIt={(params) => {
                      onSelectTool(tool);
                      // Set the params and switch to tools tab
                      setParams(
                        Object.fromEntries(
                          Object.entries(params).map(([k, v]) => [
                            k,
                            typeof v === "string" ? v : JSON.stringify(v),
                          ])
                        )
                      );
                      setJsonInput(JSON.stringify(params, null, 2));
                    }}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Getting Started Guide */}
        <TabsContent value="guide" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Quick Start */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  Quick Start Guide
                </h3>
                
                {server.setupGuide?.steps ? (
                  <div className="space-y-3">
                    {server.setupGuide.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          {step.code && (
                            <div className="mt-2 relative group">
                              <pre className="text-xs bg-secondary rounded-md p-2 font-mono overflow-x-auto">
                                {step.code}
                              </pre>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyText(step.code!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="text-sm font-medium">Select Execution Mode</p>
                        <p className="text-xs text-muted-foreground">Choose Mock (no setup) or Real (may need config)</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="text-sm font-medium">Go to Tools Tab</p>
                        <p className="text-xs text-muted-foreground">Select a tool and fill in the parameters</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="text-sm font-medium">Execute</p>
                        <p className="text-xs text-muted-foreground">Click Execute to run and see results in chat</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Mode Explanations */}
              <div className="grid gap-3">
                <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Mock Mode</span>
                    <Badge variant="secondary" className="text-[10px]">No Setup</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {server.setupGuide?.mockModeNote || "Returns realistic sample data instantly. Perfect for testing integrations and UI development without any configuration."}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Real Mode</span>
                    {hasRequiredEnv && <Badge variant="secondary" className="text-[10px]">Config Required</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {server.setupGuide?.realModeNote || "Executes actual operations against the real service. Ensure proper credentials and permissions are configured."}
                  </p>
                </div>
              </div>

              {/* Environment Variables */}
              {hasRequiredEnv && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Required for Real Mode
                    </h3>
                    <div className="space-y-2">
                      {server.requiredEnv?.map((env) => (
                        <div key={env} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                          <code className="text-xs font-mono text-primary">{env}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => copyText(`export ${env}=your_value_here`)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Add these to your terminal or .env.local file, then restart the server.
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Resources</h3>
                <ul className="space-y-2">
                  {server.documentation && (
                    <li>
                      <a href={server.documentation} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Official Documentation
                      </a>
                    </li>
                  )}
                  <li>
                    <a href={server.repository} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a href="https://www.postman.com/explore/mcp-servers" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Postman MCP Collection
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {/* Mode indicator */}
              <div className={cn(
                "p-2 rounded-md text-xs flex items-center gap-2",
                executionMode === "mock" 
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-green-500/10 text-green-600 dark:text-green-400"
              )}>
                {executionMode === "mock" ? (
                  <>
                    <FlaskConical className="w-3 h-3" />
                    <span>Running in Mock mode - returns sample data</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3 h-3" />
                    <span>Running in Real mode - executes actual operations</span>
                  </>
                )}
              </div>

              {server.tools.map((tool) => (
                <Card
                  key={tool.name}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedTool?.name === tool.name && "border-primary bg-primary/5"
                  )}
                  onClick={() => onSelectTool(tool)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium font-mono">
                        {tool.name}
                      </CardTitle>
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        selectedTool?.name === tool.name && "rotate-90"
                      )} />
                    </div>
                    <CardDescription className="text-xs">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>

                  {selectedTool?.name === tool.name && (
                    <CardContent className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                      <Separator className="my-3" />
                      
                      {/* Mode toggle */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Parameters
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant={jsonMode ? "ghost" : "secondary"}
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setJsonMode(false)}
                          >
                            Form
                          </Button>
                          <Button
                            variant={jsonMode ? "secondary" : "ghost"}
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setJsonMode(true)}
                          >
                            <Code2 className="w-3 h-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </div>

                      {jsonMode ? (
                        /* JSON Mode */
                        <div>
                          <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full h-32 p-3 rounded-lg border border-input bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder='{ "key": "value" }'
                          />
                        </div>
                      ) : (
                        /* Form Mode */
                        <div className="space-y-3">
                          {tool.inputSchema.properties && 
                            Object.keys(tool.inputSchema.properties).length > 0 ? (
                            Object.entries(tool.inputSchema.properties).map(([key, prop]) => (
                              <div key={key}>
                                <label className="text-xs font-medium mb-1.5 flex items-center gap-2">
                                  <span className="font-mono">{key}</span>
                                  {tool.inputSchema.required?.includes(key) && (
                                    <span className="text-destructive">*</span>
                                  )}
                                  <span className="text-muted-foreground font-normal text-[10px]">
                                    {prop.type}
                                  </span>
                                </label>
                                {prop.type === "array" || prop.type === "object" ? (
                                  <textarea
                                    placeholder={prop.description}
                                    value={params[key] || ""}
                                    onChange={(e) =>
                                      setParams((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    placeholder={prop.description}
                                    value={params[key] || ""}
                                    onChange={(e) =>
                                      setParams((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                  />
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              This tool has no parameters
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {tool.exampleRequest && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={handleUseExample}
                          >
                            Use Example
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          onClick={handleReset}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      </div>

                      {/* Execute button */}
                      <Button
                        variant={executionMode === "mock" ? "default" : "glow"}
                        className={cn(
                          "w-full mt-4",
                          executionMode === "mock" && "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={handleExecute}
                      >
                        {executionMode === "mock" ? (
                          <FlaskConical className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Execute ({executionMode === "mock" ? "Mock" : "Real"})
                      </Button>

                      {/* Example preview */}
                      {tool.exampleRequest && (
                        <div className="mt-4">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Example Request
                          </p>
                          <pre className="text-[10px] bg-secondary/50 rounded-lg p-2 overflow-x-auto font-mono">
                            {formatJson(tool.exampleRequest)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

      </Tabs>
    </div>
  );
}
