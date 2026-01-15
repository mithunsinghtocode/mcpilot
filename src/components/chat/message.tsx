"use client";

import * as React from "react";
import { Bot, User, Terminal, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn, formatJson, highlightJson } from "@/lib/utils";
import { Message } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: Message;
}

// Helper to safely get content as string
function getMessageContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (typeof content === "number") return String(content);
  if (content === null || content === undefined) return "";
  return JSON.stringify(content);
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(true);
  
  // Extract content as string with explicit typing
  const messageContent = getMessageContent(message.content);

  // Render text content with explicit return type
  const renderTextContent = (): React.ReactNode => {
    if (message.role === "user") {
      return <p className="text-sm">{messageContent}</p>;
    }
    return (
      <div className="prose prose-sm prose-invert max-w-none">
        {renderMarkdown(messageContent)}
      </div>
    );
  };

  const copyContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-lg font-bold mt-3 mb-2 text-foreground">
              {line.slice(2)}
            </h1>
          );
        }

        // Bold and inline code
        let processedLine: React.ReactNode = line;
        
        // Process inline code
        const codeRegex = /`([^`]+)`/g;
        const parts = line.split(codeRegex);
        if (parts.length > 1) {
          processedLine = parts.map((part, j) =>
            j % 2 === 1 ? (
              <code
                key={j}
                className="px-1.5 py-0.5 rounded bg-secondary text-primary font-mono text-xs"
              >
                {part}
              </code>
            ) : (
              <span key={j}>{part.replace(/\*\*([^*]+)\*\*/g, (_, text) => text)}</span>
            )
          );
        }

        // Process bold
        const boldRegex = /\*\*([^*]+)\*\*/g;
        if (typeof processedLine === "string" && boldRegex.test(processedLine)) {
          const boldParts = processedLine.split(boldRegex);
          processedLine = boldParts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          );
        }

        // List items
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 list-disc text-muted-foreground">
              {typeof processedLine === "string" ? processedLine.slice(2) : processedLine}
            </li>
          );
        }

        // Table
        if (line.startsWith("|")) {
          const cells = line.split("|").filter(Boolean).map((c) => c.trim());
          if (cells.every((c) => /^-+$/.test(c))) return null;
          return (
            <div key={i} className="flex gap-4 text-sm py-1 border-b border-border/50 last:border-0">
              {cells.map((cell, j) => (
                <span
                  key={j}
                  className={cn(
                    "flex-1",
                    j === 0 ? "font-mono text-primary" : "text-muted-foreground"
                  )}
                >
                  {cell.replace(/`([^`]+)`/g, "$1")}
                </span>
              ))}
            </div>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <div key={i} className="h-2" />;
        }

        return (
          <p key={i} className="text-muted-foreground text-sm leading-relaxed">
            {processedLine}
          </p>
        );
      });
  };

  return (
    <div
      className={cn(
        "group animate-fade-in",
        message.role === "user" ? "flex justify-end" : ""
      )}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[85%]",
          message.role === "user" ? "flex-row-reverse" : ""
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : message.role === "system"
              ? "bg-gradient-to-br from-green-500 to-cyan-500 text-white"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {message.role === "user" ? (
            <User className="w-4 h-4" />
          ) : message.role === "system" ? (
            <Terminal className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            "rounded-xl px-4 py-3",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border"
          )}
        >
          {/* Server badge */}
          {message.server && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{message.server.icon}</span>
              <Badge variant="secondary">{message.server.name}</Badge>
              {message.tool && (
                <Badge variant="outline">{message.tool.name}</Badge>
              )}
            </div>
          )}

          {/* Text content */}
          {renderTextContent() as React.ReactNode}

          {/* Request/Response blocks */}
          {message.request != null && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
              >
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Request
              </button>
              {expanded && (
                <div className="relative">
                  <pre className="text-xs bg-secondary/50 rounded-lg p-3 overflow-x-auto font-mono">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlightJson(formatJson(message.request)),
                      }}
                    />
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyContent(formatJson(message.request))}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {message.response != null && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Response</span>
                <Badge variant={message.isError ? "destructive" : "success"} className="text-[10px]">
                  {message.isError ? "Error" : "Success"}
                </Badge>
              </div>
              <div className="relative">
                <pre className="text-xs bg-secondary/50 rounded-lg p-3 overflow-x-auto font-mono max-h-[300px] overflow-y-auto">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightJson(
                        typeof message.response === "string"
                          ? message.response
                          : formatJson(message.response)
                      ),
                    }}
                  />
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    copyContent(
                      typeof message.response === "string"
                        ? message.response
                        : formatJson(message.response)
                    )
                  }
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {message.isLoading && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
              </div>
              <span className="text-xs text-muted-foreground">Executing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
