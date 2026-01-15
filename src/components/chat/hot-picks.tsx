"use client";

import * as React from "react";
import { Flame, ArrowRight, TrendingUp, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MCPServer, getHotPicks, MCP_CATEGORIES, getAllServers } from "@/lib/mcp-servers";

interface HotPicksProps {
  onSelectServer: (server: MCPServer) => void;
  onViewAll?: () => void;
}

export function HotPicks({ onSelectServer, onViewAll }: HotPicksProps) {
  const hotPicks = getHotPicks();
  const totalServers = getAllServers().length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="font-semibold">Hot Picks</h2>
        <span className="text-xs text-muted-foreground">Trending MCP servers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hotPicks.map((server, index) => (
          <HotPickCard
            key={server.id}
            server={server}
            index={index}
            onClick={() => onSelectServer(server)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {totalServers} servers available
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={onViewAll}
        >
          <Server className="w-3 h-3 mr-1" />
          View all servers <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface HotPickCardProps {
  server: MCPServer;
  index: number;
  onClick: () => void;
}

function HotPickCard({ server, index, onClick }: HotPickCardProps) {
  const category = MCP_CATEGORIES.find((c) => c.id === server.category);
  const gradients = [
    "from-green-500/20 to-cyan-500/20 hover:from-green-500/30 hover:to-cyan-500/30",
    "from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30",
    "from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30",
    "from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30",
  ];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border p-4 text-left transition-all hover:border-primary/50",
        "bg-gradient-to-br",
        gradients[index % gradients.length]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Rank badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="text-[10px]">
          #{index + 1}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">{server.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
            {server.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {server.description}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          <span className="text-xs">{category?.icon}</span>
          <span className="text-[10px] text-muted-foreground">{category?.name}</span>
        </div>
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px]">{server.usageCount?.toLocaleString()} uses</span>
        </div>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {server.tools.length} tools
        </Badge>
      </div>

      {/* Hover arrow */}
      <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
    </button>
  );
}
