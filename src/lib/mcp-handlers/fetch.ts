export async function handleFetch(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  if (toolName !== "fetch") {
    throw new Error(`Unknown fetch tool: ${toolName}`);
  }

  const url = params.url as string;
  if (!url) throw new Error("URL is required");

  const maxLength = (params.maxLength as number) || 50000;
  const startIndex = (params.startIndex as number) || 0;
  const raw = params.raw as boolean;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MCPilot/1.0 (MCP Testing Tool)",
      Accept: "application/json, text/html, */*",
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let content: string;

  if (contentType.includes("application/json")) {
    const json = await response.json();
    content = JSON.stringify(json, null, 2);
  } else {
    content = await response.text();
  }

  const sliced = raw ? content : content.slice(startIndex, startIndex + maxLength);

  return {
    url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    contentType,
    content: sliced,
    totalLength: content.length,
    truncated: content.length > maxLength && !raw,
  };
}
