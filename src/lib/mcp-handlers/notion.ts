// Notion handler
// Requires NOTION_API_KEY

const NOTION_API = "https://api.notion.com/v1";

export async function handleNotion(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.NOTION_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEY not configured. Get your integration token from https://www.notion.so/my-integrations and set it as NOTION_API_KEY environment variable."
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  switch (toolName) {
    case "search_pages": {
      const query = params.query as string;
      
      const response = await fetch(`${NOTION_API}/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: query || "",
          filter: { property: "object", value: "page" },
          page_size: 20,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Notion API Error: ${(error as { message?: string }).message || response.statusText}`);
      }
      
      const data = await response.json() as {
        results: Array<{
          id: string;
          properties: { title?: { title?: Array<{ plain_text: string }> } };
          url: string;
          created_time: string;
        }>;
      };
      
      return {
        query,
        results: data.results.map(page => ({
          id: page.id,
          title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
          url: page.url,
          created: page.created_time,
        })),
        count: data.results.length,
      };
    }

    case "get_page": {
      const pageId = params.page_id as string;
      if (!pageId) throw new Error("page_id is required");
      
      const response = await fetch(`${NOTION_API}/pages/${pageId}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Notion API Error: ${response.statusText}`);
      }
      
      const page = await response.json() as {
        id: string;
        properties: Record<string, unknown>;
        url: string;
        created_time: string;
        last_edited_time: string;
      };
      
      return {
        id: page.id,
        properties: page.properties,
        url: page.url,
        created: page.created_time,
        lastEdited: page.last_edited_time,
      };
    }

    case "query_database": {
      const databaseId = params.database_id as string;
      const filter = params.filter as Record<string, unknown>;
      const sorts = params.sorts as unknown[];
      
      if (!databaseId) throw new Error("database_id is required");
      
      const body: Record<string, unknown> = { page_size: 20 };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      
      const response = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error(`Notion API Error: ${response.statusText}`);
      }
      
      const data = await response.json() as {
        results: Array<{ id: string; properties: Record<string, unknown> }>;
        has_more: boolean;
      };
      
      return {
        databaseId,
        results: data.results.map(row => ({
          id: row.id,
          properties: row.properties,
        })),
        hasMore: data.has_more,
        count: data.results.length,
      };
    }

    case "create_page": {
      const parentId = params.parent_id as string;
      const title = params.title as string;
      const content = params.content as string;
      
      if (!parentId) throw new Error("parent_id is required");
      if (!title) throw new Error("Title is required");
      
      const body: Record<string, unknown> = {
        parent: { page_id: parentId },
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
      };
      
      if (content) {
        body.children = [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content } }],
            },
          },
        ];
      }
      
      const response = await fetch(`${NOTION_API}/pages`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Notion API Error: ${(error as { message?: string }).message || response.statusText}`);
      }
      
      const page = await response.json() as { id: string; url: string };
      
      return {
        id: page.id,
        url: page.url,
        title,
        created: true,
      };
    }

    default:
      throw new Error(`Unknown Notion tool: ${toolName}`);
  }
}
