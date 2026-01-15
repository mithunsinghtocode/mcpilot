// MCP Handler Registry
// Each handler implements real functionality for its respective MCP server

export { handleFilesystem } from "./filesystem";
export { handleFetch } from "./fetch";
export { handleTime } from "./time";
export { handleMemory } from "./memory";
export { handleGitHub } from "./github";
export { handleBraveSearch } from "./brave-search";
export { handlePuppeteer } from "./puppeteer";
export { handleSQLite } from "./sqlite";
export { handlePostgres } from "./postgres";
export { handleMongoDB } from "./mongodb";
export { handleRedis } from "./redis";
export { handleSlack } from "./slack";
export { handleDiscord } from "./discord";
export { handleOpenAI } from "./openai";
export { handleAnthropic } from "./anthropic";
export { handleAWS } from "./aws";
export { handleDocker } from "./docker";
export { handleStripe } from "./stripe";
export { handleNotion } from "./notion";
export { handleEverything } from "./everything";

export type MCPHandler = (
  toolName: string,
  params: Record<string, unknown>
) => Promise<unknown>;

// Environment variable requirements for each server
export const ENV_REQUIREMENTS: Record<string, string[]> = {
  github: ["GITHUB_TOKEN"],
  "brave-search": ["BRAVE_API_KEY"],
  slack: ["SLACK_BOT_TOKEN"],
  discord: ["DISCORD_BOT_TOKEN"],
  openai: ["OPENAI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
  aws: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
  stripe: ["STRIPE_SECRET_KEY"],
  notion: ["NOTION_API_KEY"],
  postgres: ["POSTGRES_URL"],
  mongodb: ["MONGODB_URL"],
  redis: ["REDIS_URL"],
  "google-maps": ["GOOGLE_MAPS_API_KEY"],
  "google-drive": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
};

export function checkEnvRequirements(serverId: string): { 
  valid: boolean; 
  missing: string[];
  available: Record<string, boolean>;
} {
  const required = ENV_REQUIREMENTS[serverId] || [];
  const missing: string[] = [];
  const available: Record<string, boolean> = {};
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
      available[key] = false;
    } else {
      available[key] = true;
    }
  }
  
  return { valid: missing.length === 0, missing, available };
}
