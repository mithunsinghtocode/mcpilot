"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Star, ExternalLink, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MCPServer, MCP_CATEGORIES, getAllServers, searchServers } from "@/lib/mcp-servers";

interface ServersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectServer: (server: MCPServer) => void;
}

export function ServersModal({ open, onOpenChange, onSelectServer }: ServersModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const allServers = getAllServers();
  
  const filteredServers = React.useMemo(() => {
    let servers = searchQuery ? searchServers(searchQuery) : allServers;
    if (selectedCategory) {
      servers = servers.filter(s => s.category === selectedCategory);
    }
    return servers;
  }, [searchQuery, selectedCategory, allServers]);

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

  const handleSelect = (server: MCPServer) => {
    onSelectServer(server);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl">Browse MCP Servers</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {allServers.length} servers available • Select one to connect and test
          </p>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search servers by name, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({allServers.length})
            </Button>
            {MCP_CATEGORIES.map((cat) => {
              const count = allServers.filter(s => s.category === cat.id).length;
              if (count === 0) return null;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name} ({count})
                </Button>
              );
            })}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 pt-4">
            {searchQuery || selectedCategory ? (
              // Flat list for search/filter results
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredServers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onClick={() => handleSelect(server)}
                  />
                ))}
                {filteredServers.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    No servers found matching your criteria
                  </div>
                )}
              </div>
            ) : (
              // Categorized list
              <div className="space-y-8">
                {MCP_CATEGORIES.map((category) => {
                  const servers = serversByCategory[category.id];
                  if (!servers || servers.length === 0) return null;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{category.icon}</span>
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {servers.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {servers.map((server) => (
                          <ServerCard
                            key={server.id}
                            server={server}
                            onClick={() => handleSelect(server)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface ServerCardProps {
  server: MCPServer;
  onClick: () => void;
}

function ServerCard({ server, onClick }: ServerCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border border-border bg-card",
        "hover:border-primary/50 hover:bg-accent/50 transition-all group"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{server.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium group-hover:text-primary transition-colors">
              {server.name}
            </h4>
            {server.isHotPick && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {server.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground">
              {server.tools.length} tools
            </span>
            <span className="text-[10px] text-muted-foreground">
              by {server.author}
            </span>
            {server.usageCount && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-500">
                <TrendingUp className="w-3 h-3" />
                {server.usageCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {server.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
