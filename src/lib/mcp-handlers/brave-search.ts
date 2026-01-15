const BRAVE_API = "https://api.search.brave.com/res/v1";

export async function handleBraveSearch(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "BRAVE_API_KEY not configured. Get your API key from https://brave.com/search/api/ and set it as BRAVE_API_KEY environment variable."
    );
  }

  const headers = {
    Accept: "application/json",
    "X-Subscription-Token": apiKey,
  };

  switch (toolName) {
    case "brave_web_search": {
      const query = params.query as string;
      const count = Math.min((params.count as number) || 10, 20);
      
      if (!query) throw new Error("Query is required");
      
      const response = await fetch(
        `${BRAVE_API}/web/search?q=${encodeURIComponent(query)}&count=${count}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Brave Search API Error: ${response.statusText}`);
      }
      
      const data = await response.json() as {
        web?: { results: Array<{ title: string; url: string; description: string; age?: string }> };
      };
      
      return {
        query,
        results: data.web?.results.map(r => ({
          title: r.title,
          url: r.url,
          description: r.description,
          age: r.age,
        })) || [],
        count: data.web?.results.length || 0,
      };
    }

    case "brave_local_search": {
      const query = params.query as string;
      const count = Math.min((params.count as number) || 5, 20);
      
      if (!query) throw new Error("Query is required");
      
      const response = await fetch(
        `${BRAVE_API}/web/search?q=${encodeURIComponent(query)}&search_lang=en&result_filter=locations&count=${count}`,
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`Brave Search API Error: ${response.statusText}`);
      }
      
      const data = await response.json() as {
        locations?: { results: Array<{ title: string; url: string; address?: { streetAddress?: string; city?: string }; rating?: { value: number } }> };
      };
      
      return {
        query,
        results: data.locations?.results.map(r => ({
          name: r.title,
          url: r.url,
          address: r.address?.streetAddress,
          city: r.address?.city,
          rating: r.rating?.value,
        })) || [],
        count: data.locations?.results.length || 0,
      };
    }

    default:
      throw new Error(`Unknown Brave Search tool: ${toolName}`);
  }
}
