"use client";

import * as React from "react";
import {
  Server,
  Zap,
  Search,
  Star,
  ChevronDown,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MCPServer, MCP_SERVERS, MCP_CATEGORIES, getHotPicks } from "@/lib/mcp-servers";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServer: (server: MCPServer) => void;
  activeServer: MCPServer | null;
}

export function Sidebar({ isOpen, onClose, onSelectServer, activeServer }: SidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  const hotPicks = getHotPicks();

  const filteredServers = React.useMemo(() => {
    if (!searchQuery) return MCP_SERVERS;
    const query = searchQuery.toLowerCase();
    return MCP_SERVERS.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const serversByCategory = React.useMemo(() => {
    const grouped: Record<string, MCPServer[]> = {};
    filteredServers.forEach((server) => {
      if (!grouped[server.category]) {
        grouped[server.category] = [];
      }
      grouped[server.category].push(server);
    });
    return grouped;
  }, [filteredServers]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">MCPilot</h1>
                <p className="text-[10px] text-muted-foreground">Protocol Testing Co-pilot</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-sidebar-accent border-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Hot Picks */}
            {!searchQuery && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hot Picks
                  </span>
                </div>
                <div className="space-y-1 mb-6">
                  {hotPicks.map((server) => (
                    <ServerItem
                      key={server.id}
                      server={server}
                      isActive={activeServer?.id === server.id}
                      onClick={() => onSelectServer(server)}
                    />
                  ))}
                </div>
                <Separator className="my-4" />
              </>
            )}

            {/* Categories */}
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {searchQuery ? "Search Results" : "All Servers"}
              </span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {filteredServers.length}
              </Badge>
            </div>

            {searchQuery ? (
              // Flat list for search results
              <div className="space-y-1">
                {filteredServers.map((server) => (
                  <ServerItem
                    key={server.id}
                    server={server}
                    isActive={activeServer?.id === server.id}
                    onClick={() => onSelectServer(server)}
                    showCategory
                  />
                ))}
                {filteredServers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No servers found
                  </p>
                )}
              </div>
            ) : (
              // Categorized list
              <div className="space-y-2">
                {MCP_CATEGORIES.map((category) => {
                  const servers = serversByCategory[category.id] || [];
                  if (servers.length === 0) return null;

                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : category.id)
                        }
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
                      >
                        <span>{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px]"
                        >
                          {servers.length}
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-1 ml-2 space-y-1">
                          {servers.map((server) => (
                            <ServerItem
                              key={server.id}
                              server={server}
                              isActive={activeServer?.id === server.id}
                              onClick={() => onSelectServer(server)}
                              compact
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground text-center">
            {MCP_SERVERS.length} MCP servers available
          </p>
        </div>
      </aside>
    </>
  );
}

interface ServerItemProps {
  server: MCPServer;
  isActive: boolean;
  onClick: () => void;
  showCategory?: boolean;
  compact?: boolean;
}

function ServerItem({ server, isActive, onClick, showCategory, compact }: ServerItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-left",
        isActive
          ? "bg-sidebar-primary/10 text-sidebar-primary"
          : "hover:bg-sidebar-accent text-sidebar-foreground"
      )}
    >
      <span className={compact ? "text-sm" : "text-base"}>{server.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", compact ? "text-xs" : "text-sm")}>
          {server.name}
        </p>
        {!compact && (
          <p className="text-[10px] text-muted-foreground truncate">
            {showCategory
              ? MCP_CATEGORIES.find((c) => c.id === server.category)?.name
              : `${server.tools.length} tools`}
          </p>
        )}
      </div>
      {server.isHotPick && !compact && (
        <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
      )}
    </button>
  );
}
