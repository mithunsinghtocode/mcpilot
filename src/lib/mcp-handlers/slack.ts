const SLACK_API = "https://slack.com/api";

export async function handleSlack(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const token = process.env.SLACK_BOT_TOKEN;
  
  if (!token) {
    throw new Error(
      "SLACK_BOT_TOKEN not configured. Create a Slack app at https://api.slack.com/apps and set the bot token as SLACK_BOT_TOKEN environment variable."
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function slackFetch(method: string, body?: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${SLACK_API}/${method}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json() as { ok: boolean; error?: string };
    
    if (!data.ok) {
      throw new Error(`Slack API Error: ${data.error}`);
    }
    
    return data;
  }

  switch (toolName) {
    case "list_channels": {
      const limit = Math.min((params.limit as number) || 100, 1000);
      const cursor = params.cursor as string;
      
      const body: Record<string, unknown> = { limit };
      if (cursor) body.cursor = cursor;
      
      const data = await slackFetch("conversations.list", body) as {
        channels: Array<{ id: string; name: string; is_private: boolean; num_members: number }>;
        response_metadata?: { next_cursor?: string };
      };
      
      return {
        channels: data.channels.map(ch => ({
          id: ch.id,
          name: ch.name,
          isPrivate: ch.is_private,
          members: ch.num_members,
        })),
        nextCursor: data.response_metadata?.next_cursor,
      };
    }

    case "post_message": {
      const channel = params.channel as string;
      const text = params.text as string;
      
      if (!channel) throw new Error("Channel is required");
      if (!text) throw new Error("Text is required");
      
      const data = await slackFetch("chat.postMessage", { channel, text }) as {
        ts: string;
        channel: string;
      };
      
      return {
        success: true,
        channel: data.channel,
        timestamp: data.ts,
        message: text,
      };
    }

    case "reply_to_thread": {
      const channel = params.channel as string;
      const threadTs = params.thread_ts as string;
      const text = params.text as string;
      
      if (!channel) throw new Error("Channel is required");
      if (!threadTs) throw new Error("thread_ts is required");
      if (!text) throw new Error("Text is required");
      
      const data = await slackFetch("chat.postMessage", {
        channel,
        text,
        thread_ts: threadTs,
      }) as { ts: string };
      
      return {
        success: true,
        timestamp: data.ts,
        threadTs,
      };
    }

    case "get_channel_history": {
      const channel = params.channel as string;
      const limit = Math.min((params.limit as number) || 20, 100);
      
      if (!channel) throw new Error("Channel is required");
      
      const data = await slackFetch("conversations.history", { channel, limit }) as {
        messages: Array<{ ts: string; text: string; user: string; type: string }>;
      };
      
      return {
        channel,
        messages: data.messages.map(msg => ({
          timestamp: msg.ts,
          text: msg.text,
          user: msg.user,
          type: msg.type,
        })),
      };
    }

    case "get_users": {
      const limit = Math.min((params.limit as number) || 100, 1000);
      
      const data = await slackFetch("users.list", { limit }) as {
        members: Array<{ id: string; name: string; real_name: string; is_bot: boolean }>;
      };
      
      return {
        users: data.members.map(u => ({
          id: u.id,
          username: u.name,
          realName: u.real_name,
          isBot: u.is_bot,
        })),
      };
    }

    case "add_reaction": {
      const channel = params.channel as string;
      const timestamp = params.timestamp as string;
      const name = params.name as string;
      
      if (!channel) throw new Error("Channel is required");
      if (!timestamp) throw new Error("Timestamp is required");
      if (!name) throw new Error("Emoji name is required");
      
      await slackFetch("reactions.add", { channel, timestamp, name });
      
      return {
        success: true,
        emoji: name,
        channel,
        timestamp,
      };
    }

    default:
      throw new Error(`Unknown Slack tool: ${toolName}`);
  }
}
