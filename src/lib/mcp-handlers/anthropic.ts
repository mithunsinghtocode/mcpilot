const ANTHROPIC_API = "https://api.anthropic.com/v1";

export async function handleAnthropic(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not configured. Get your API key from https://console.anthropic.com/ and set it as ANTHROPIC_API_KEY environment variable."
    );
  }

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  switch (toolName) {
    case "message": {
      const messages = params.messages as Array<{ role: string; content: string }>;
      const model = (params.model as string) || "claude-3-5-sonnet-20241022";
      const maxTokens = (params.max_tokens as number) || 1024;
      const system = params.system as string;
      
      if (!messages || !Array.isArray(messages)) throw new Error("Messages array is required");
      
      const body: Record<string, unknown> = {
        model,
        messages,
        max_tokens: maxTokens,
      };
      
      if (system) {
        body.system = system;
      }
      
      const response = await fetch(`${ANTHROPIC_API}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API Error: ${(error as { error?: { message?: string } }).error?.message || response.statusText}`);
      }
      
      const data = await response.json() as {
        content: Array<{ type: string; text: string }>;
        model: string;
        usage: { input_tokens: number; output_tokens: number };
        stop_reason: string;
      };
      
      return {
        model: data.model,
        content: data.content[0]?.text,
        stopReason: data.stop_reason,
        usage: data.usage,
      };
    }

    default:
      throw new Error(`Unknown Anthropic tool: ${toolName}`);
  }
}
