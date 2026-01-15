const DISCORD_API = "https://discord.com/api/v10";

export async function handleDiscord(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    throw new Error(
      "DISCORD_BOT_TOKEN not configured. Create a Discord bot at https://discord.com/developers/applications and set the token as DISCORD_BOT_TOKEN environment variable."
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  };

  switch (toolName) {
    case "send_message": {
      const channelId = params.channel_id as string;
      const content = params.content as string;
      
      if (!channelId) throw new Error("channel_id is required");
      if (!content) throw new Error("Content is required");
      
      const response = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Discord API Error: ${(error as { message?: string }).message || response.statusText}`);
      }
      
      const data = await response.json() as { id: string; content: string; timestamp: string };
      
      return {
        success: true,
        messageId: data.id,
        content: data.content,
        timestamp: data.timestamp,
      };
    }

    case "get_messages": {
      const channelId = params.channel_id as string;
      const limit = Math.min((params.limit as number) || 50, 100);
      
      if (!channelId) throw new Error("channel_id is required");
      
      const response = await fetch(
        `${DISCORD_API}/channels/${channelId}/messages?limit=${limit}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Discord API Error: ${response.statusText}`);
      }
      
      const messages = await response.json() as Array<{
        id: string;
        content: string;
        author: { username: string };
        timestamp: string;
      }>;
      
      return {
        channelId,
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          author: msg.author.username,
          timestamp: msg.timestamp,
        })),
      };
    }

    case "list_channels": {
      const guildId = params.guild_id as string;
      
      if (!guildId) throw new Error("guild_id is required");
      
      const response = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers });
      
      if (!response.ok) {
        throw new Error(`Discord API Error: ${response.statusText}`);
      }
      
      const channels = await response.json() as Array<{
        id: string;
        name: string;
        type: number;
      }>;
      
      const typeNames: Record<number, string> = {
        0: "text",
        2: "voice",
        4: "category",
        5: "announcement",
        13: "stage",
        15: "forum",
      };
      
      return {
        guildId,
        channels: channels.map(ch => ({
          id: ch.id,
          name: ch.name,
          type: typeNames[ch.type] || "unknown",
        })),
      };
    }

    default:
      throw new Error(`Unknown Discord tool: ${toolName}`);
  }
}
