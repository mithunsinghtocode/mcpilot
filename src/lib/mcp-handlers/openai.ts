const OPENAI_API = "https://api.openai.com/v1";

export async function handleOpenAI(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY not configured. Get your API key from https://platform.openai.com/api-keys and set it as OPENAI_API_KEY environment variable."
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  switch (toolName) {
    case "chat_completion": {
      const messages = params.messages as Array<{ role: string; content: string }>;
      const model = (params.model as string) || "gpt-4o-mini";
      const temperature = (params.temperature as number) ?? 0.7;
      const maxTokens = (params.max_tokens as number) || 1000;
      
      if (!messages || !Array.isArray(messages)) throw new Error("Messages array is required");
      
      const response = await fetch(`${OPENAI_API}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${(error as { error?: { message?: string } }).error?.message || response.statusText}`);
      }
      
      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
        model: string;
      };
      
      return {
        model: data.model,
        content: data.choices[0]?.message.content,
        usage: data.usage,
      };
    }

    case "generate_image": {
      const prompt = params.prompt as string;
      const size = (params.size as string) || "1024x1024";
      const n = Math.min((params.n as number) || 1, 4);
      const model = (params.model as string) || "dall-e-3";
      
      if (!prompt) throw new Error("Prompt is required");
      
      const response = await fetch(`${OPENAI_API}/images/generations`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, prompt, size, n }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${(error as { error?: { message?: string } }).error?.message || response.statusText}`);
      }
      
      const data = await response.json() as { data: Array<{ url: string; revised_prompt?: string }> };
      
      return {
        prompt,
        model,
        images: data.data.map(img => ({
          url: img.url,
          revisedPrompt: img.revised_prompt,
        })),
      };
    }

    case "create_embeddings": {
      const input = params.input as string | string[];
      const model = (params.model as string) || "text-embedding-3-small";
      
      if (!input) throw new Error("Input is required");
      
      const response = await fetch(`${OPENAI_API}/embeddings`, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, input }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${(error as { error?: { message?: string } }).error?.message || response.statusText}`);
      }
      
      const data = await response.json() as {
        data: Array<{ embedding: number[]; index: number }>;
        usage: { total_tokens: number };
        model: string;
      };
      
      return {
        model: data.model,
        embeddings: data.data.map(d => ({
          index: d.index,
          dimensions: d.embedding.length,
          // Return first/last few values as preview
          preview: [...d.embedding.slice(0, 5), "...", ...d.embedding.slice(-5)],
        })),
        usage: data.usage,
      };
    }

    case "list_models": {
      const response = await fetch(`${OPENAI_API}/models`, { headers });
      
      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }
      
      const data = await response.json() as { data: Array<{ id: string; owned_by: string; created: number }> };
      
      return {
        models: data.data
          .filter(m => m.id.includes("gpt") || m.id.includes("dall-e") || m.id.includes("embed"))
          .map(m => ({
            id: m.id,
            owner: m.owned_by,
            created: new Date(m.created * 1000).toISOString(),
          })),
      };
    }

    default:
      throw new Error(`Unknown OpenAI tool: ${toolName}`);
  }
}
