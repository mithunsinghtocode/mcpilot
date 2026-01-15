"use client";

import * as React from "react";
import { Command } from "cmdk";
import { 
  Search, 
  Server, 
  Zap, 
  HelpCircle, 
  Trash2,
  Database,
  Globe,
  Bot,
  FolderOpen,
  Cloud,
  Code2,
  BarChart3,
  MessageSquare,
  Lock,
  Wrench,
  Film
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MCP_SERVERS, MCP_CATEGORIES, MCPServer, getAllServers } from "@/lib/mcp-servers";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectServer: (server: MCPServer) => void;
  onCommand: (command: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  filesystem: <FolderOpen className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
  ai: <Bot className="w-4 h-4" />,
  productivity: <Zap className="w-4 h-4" />,
  development: <Code2 className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
  data: <BarChart3 className="w-4 h-4" />,
  communication: <MessageSquare className="w-4 h-4" />,
  security: <Lock className="w-4 h-4" />,
  devops: <Wrench className="w-4 h-4" />,
  media: <Film className="w-4 h-4" />,
};

export function CommandPalette({
  open,
  onOpenChange,
  onSelectServer,
  onCommand,
  query,
  onQueryChange,
}: CommandPaletteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredServers = React.useMemo(() => {
    if (!query || query === "/") return MCP_SERVERS.slice(0, 8);
    const searchTerm = query.startsWith("/") ? query.slice(1) : query;
    return MCP_SERVERS.filter(
      (server) =>
        server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        server.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [query]);

  const hotPicks = MCP_SERVERS.filter((s) => s.isHotPick);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
      onQueryChange("");
    }
  };

  if (!open) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50" onKeyDown={handleKeyDown}>
      <Command
        className="rounded-xl border border-border bg-popover shadow-2xl shadow-black/50 overflow-hidden"
        shouldFilter={false}
      >
        <div className="flex items-center border-b border-border px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search MCP servers or type a command..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>
        
        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No servers found. Try a different search.
          </Command.Empty>

          {/* Quick Commands */}
          {(!query || query === "/") && (
            <Command.Group heading="Commands" className="mb-2">
              <CommandItem
                icon={<Server className="w-4 h-4 text-cyan-400" />}
                label="/servers"
                description={`Browse all ${getAllServers().length} MCP servers`}
                onSelect={() => {
                  onCommand("/servers");
                  onOpenChange(false);
                  onQueryChange("");
                }}
              />
              <CommandItem
                icon={<Zap className="w-4 h-4 text-amber-400" />}
                label="/hot"
                description="Trending MCP servers"
                onSelect={() => {
                  onCommand("/hot");
                  onOpenChange(false);
                  onQueryChange("");
                }}
              />
              <CommandItem
                icon={<HelpCircle className="w-4 h-4 text-green-400" />}
                label="/help"
                description="Show help and commands"
                onSelect={() => {
                  onCommand("/help");
                  onOpenChange(false);
                  onQueryChange("");
                }}
              />
              <CommandItem
                icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                label="/clear"
                description="Clear chat history"
                onSelect={() => {
                  onCommand("/clear");
                  onOpenChange(false);
                  onQueryChange("");
                }}
              />
            </Command.Group>
          )}

          {/* Hot Picks */}
          {(!query || query === "/") && (
            <Command.Group heading="🔥 Hot Picks" className="mb-2">
              {hotPicks.map((server) => (
                <CommandItem
                  key={server.id}
                  icon={<span className="text-base">{server.icon}</span>}
                  label={`/${server.slug}`}
                  description={server.description}
                  badge={`${server.tools.length} tools`}
                  onSelect={() => {
                    onSelectServer(server);
                    onOpenChange(false);
                    onQueryChange("");
                  }}
                />
              ))}
            </Command.Group>
          )}

          {/* Search Results */}
          {query && query !== "/" && (
            <Command.Group heading={`MCP Servers (${filteredServers.length} results)`}>
              {filteredServers.map((server) => (
                <CommandItem
                  key={server.id}
                  icon={<span className="text-base">{server.icon}</span>}
                  label={`/${server.slug}`}
                  description={server.description}
                  badge={server.category}
                  onSelect={() => {
                    onSelectServer(server);
                    onOpenChange(false);
                    onQueryChange("");
                  }}
                />
              ))}
            </Command.Group>
          )}

          {/* Categories */}
          {(!query || query === "/") && (
            <Command.Group heading="Browse by Category">
              {MCP_CATEGORIES.slice(0, 6).map((cat) => {
                const count = MCP_SERVERS.filter((s) => s.category === cat.id).length;
                if (count === 0) return null;
                return (
                  <CommandItem
                    key={cat.id}
                    icon={categoryIcons[cat.id] || <Server className="w-4 h-4" />}
                    label={cat.name}
                    description={`${count} servers available`}
                    onSelect={() => onQueryChange(cat.id)}
                  />
                );
              })}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}

interface CommandItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
  onSelect: () => void;
}

function CommandItem({ icon, label, description, badge, onSelect }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer data-[selected=true]:bg-accent transition-colors group"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-data-[selected=true]:bg-primary/10">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </Command.Item>
  );
}
