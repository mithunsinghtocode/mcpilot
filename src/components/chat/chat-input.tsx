"use client";

import * as React from "react";
import { Send, Slash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MCPServer, MCPTool } from "@/lib/mcp-servers";
import { CommandPalette } from "./command-palette";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSelectServer: (server: MCPServer) => void;
  onCommand: (command: string) => void;
  activeServer: MCPServer | null;
  activeTool: MCPTool | null;
  onClearActive: () => void;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onSelectServer,
  onCommand,
  activeServer,
  activeTool,
  onClearActive,
  disabled,
}: ChatInputProps) {
  const [showPalette, setShowPalette] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
        setShowPalette(false);
      }
    }
    if (e.key === "Escape") {
      setShowPalette(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show command palette when typing "/" at the start
    if (newValue === "/" || (newValue.startsWith("/") && !newValue.includes(" "))) {
      setShowPalette(true);
    } else if (!newValue.startsWith("/")) {
      setShowPalette(false);
    }
  };

  const handleSlashClick = () => {
    if (!showPalette) {
      onChange("/");
      setShowPalette(true);
      inputRef.current?.focus();
    } else {
      setShowPalette(false);
      onChange("");
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle server selection from palette
  const handleSelectServer = (server: MCPServer) => {
    onSelectServer(server);
    setShowPalette(false);
    onChange("");
  };

  // Handle command from palette
  const handlePaletteCommand = (command: string) => {
    onCommand(command);
    setShowPalette(false);
    onChange("");
  };

  return (
    <div className="relative">
      <CommandPalette
        open={showPalette}
        onOpenChange={setShowPalette}
        onSelectServer={handleSelectServer}
        onCommand={handlePaletteCommand}
        query={value}
        onQueryChange={onChange}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {/* Active context bar */}
        {activeServer && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
            <span className="text-sm">{activeServer.icon}</span>
            <Badge variant="secondary">{activeServer.name}</Badge>
            {activeTool && (
              <>
                <span className="text-muted-foreground">/</span>
                <Badge variant="outline">{activeTool.name}</Badge>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={onClearActive}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2 p-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 flex-shrink-0 transition-colors",
              showPalette && "bg-primary text-primary-foreground"
            )}
            onClick={handleSlashClick}
          >
            <Slash className="w-4 h-4" />
          </Button>
          
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              activeServer
                ? activeTool
                  ? `Execute ${activeTool.name} with { "param": "value" }...`
                  : `Type a tool command or select from the panel...`
                : "Type / to browse MCP servers..."
            }
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground min-h-[36px] max-h-[200px] py-2"
            rows={1}
            disabled={disabled}
          />

          <Button
            variant="glow"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => {
              onSend();
              setShowPalette(false);
            }}
            disabled={!value.trim() || disabled}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Helper text */}
        <div className="px-4 pb-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-secondary">/</kbd>
            Commands
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-secondary">Enter</kbd>
            Send
          </span>
          {activeServer && (
            <span className="flex items-center gap-1 text-primary">
              {activeServer.tools.length} tools available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
