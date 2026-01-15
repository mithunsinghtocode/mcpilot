import { NextRequest, NextResponse } from "next/server";
import { MCP_SERVERS } from "@/lib/mcp-servers";
import {
  handleFilesystem,
  handleFetch,
  handleTime,
  handleMemory,
  handleGitHub,
  handleBraveSearch,
  handlePuppeteer,
  handleSQLite,
  handlePostgres,
  handleMongoDB,
  handleRedis,
  handleSlack,
  handleDiscord,
  handleOpenAI,
  handleAnthropic,
  handleAWS,
  handleDocker,
  handleStripe,
  handleNotion,
  handleEverything,
  checkEnvRequirements,
} from "@/lib/mcp-handlers";

import {
  handleMockFilesystem,
  handleMockFetch,
  handleMockGitHub,
  handleMockSlack,
  handleMockDiscord,
  handleMockOpenAI,
  handleMockAnthropic,
  handleMockBraveSearch,
  handleMockStripe,
  handleMockNotion,
  handleMockDocker,
  handleMockAWS,
  handleMockDatabase,
  handleMockTime,
  handleMockMemory,
  handleMockEverything,
  handleGenericMock,
} from "@/lib/mcp-handlers/mock-handlers";

// Map server slugs to their real handlers
const realHandlers: Record<string, (tool: string, params: Record<string, unknown>) => Promise<unknown>> = {
  filesystem: handleFilesystem,
  fetch: handleFetch,
  time: handleTime,
  memory: handleMemory,
  github: handleGitHub,
  "brave-search": handleBraveSearch,
  puppeteer: handlePuppeteer,
  sqlite: handleSQLite,
  postgres: handlePostgres,
  mongodb: handleMongoDB,
  redis: handleRedis,
  slack: handleSlack,
  discord: handleDiscord,
  openai: handleOpenAI,
  anthropic: handleAnthropic,
  aws: handleAWS,
  docker: handleDocker,
  stripe: handleStripe,
  notion: handleNotion,
  everything: handleEverything,
};

// Map server slugs to their mock handlers
const mockHandlers: Record<string, (tool: string, params: Record<string, unknown>) => Promise<unknown>> = {
  filesystem: handleMockFilesystem,
  fetch: handleMockFetch,
  time: handleMockTime,
  memory: handleMockMemory,
  github: handleMockGitHub,
  "brave-search": handleMockBraveSearch,
  slack: handleMockSlack,
  discord: handleMockDiscord,
  openai: handleMockOpenAI,
  anthropic: handleMockAnthropic,
  stripe: handleMockStripe,
  notion: handleMockNotion,
  docker: handleMockDocker,
  aws: handleMockAWS,
  sqlite: (tool, params) => handleMockDatabase(tool, params, "SQLite"),
  postgres: (tool, params) => handleMockDatabase(tool, params, "PostgreSQL"),
  mongodb: (tool, params) => handleMockDatabase(tool, params, "MongoDB"),
  redis: (tool, params) => handleMockDatabase(tool, params, "Redis"),
  everything: handleMockEverything,
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { serverSlug, toolName, params, mode = "mock" } = body;

    // Validate request
    if (!serverSlug) {
      return NextResponse.json(
        { error: "Server slug is required" },
        { status: 400 }
      );
    }

    if (!toolName) {
      return NextResponse.json(
        { error: "Tool name is required" },
        { status: 400 }
      );
    }

    // Find the server
    const server = MCP_SERVERS.find((s) => s.slug === serverSlug);
    if (!server) {
      return NextResponse.json(
        { error: `Server "${serverSlug}" not found` },
        { status: 404 }
      );
    }

    // Find the tool
    const tool = server.tools.find((t) => t.name === toolName);
    if (!tool) {
      return NextResponse.json(
        { error: `Tool "${toolName}" not found on server "${serverSlug}"` },
        { status: 404 }
      );
    }

    // MOCK MODE
    if (mode === "mock") {
      const mockHandler = mockHandlers[serverSlug];
      
      try {
        const result = mockHandler 
          ? await mockHandler(toolName, params || {})
          : await handleGenericMock(serverSlug, toolName, params || {});
        
        const executionTime = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          server: server.name,
          tool: toolName,
          result,
          executionTime: `${executionTime}ms`,
          mode: "mock",
          hint: "This is mock data. Switch to 'Real' mode for actual responses (may require configuration).",
        });
      } catch (mockError) {
        return NextResponse.json({
          error: (mockError as Error).message,
          server: serverSlug,
          tool: toolName,
          mode: "mock",
        }, { status: 500 });
      }
    }

    // REAL MODE
    // Check environment requirements
    const envCheck = checkEnvRequirements(serverSlug);
    
    if (!envCheck.valid) {
      return NextResponse.json({
        error: "Missing required configuration",
        missingEnv: envCheck.missing,
        server: serverSlug,
        tool: toolName,
        type: "configuration_required",
        suggestion: `Set the following environment variables to use Real mode: ${envCheck.missing.join(", ")}`,
        tip: "You can also use Mock mode to test without configuration.",
      }, { status: 400 });
    }

    // Check if we have a real handler for this server
    const realHandler = realHandlers[serverSlug];
    
    if (!realHandler) {
      return NextResponse.json({
        notice: `Real handler for "${server.name}" not yet implemented`,
        server: serverSlug,
        tool: toolName,
        params,
        suggestion: "Use Mock mode to test this server, or check documentation for setup instructions.",
        documentation: server.documentation,
      });
    }

    // Execute the real handler
    try {
      const result = await realHandler(toolName, params || {});
      const executionTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        server: server.name,
        tool: toolName,
        result,
        executionTime: `${executionTime}ms`,
        mode: "real",
      });
    } catch (handlerError) {
      const executionTime = Date.now() - startTime;
      const errorMessage = (handlerError as Error).message;
      
      // Check if it's a missing env error
      if (errorMessage.includes("not configured")) {
        return NextResponse.json({
          error: errorMessage,
          server: serverSlug,
          tool: toolName,
          type: "configuration_required",
          missingEnv: envCheck.missing,
          executionTime: `${executionTime}ms`,
          tip: "Switch to Mock mode to test without configuration.",
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: errorMessage,
        server: serverSlug,
        tool: toolName,
        params,
        executionTime: `${executionTime}ms`,
        mode: "real",
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
