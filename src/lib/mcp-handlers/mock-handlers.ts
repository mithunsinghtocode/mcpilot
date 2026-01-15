// Mock handlers that work without any configuration
// These provide realistic sample data for testing and demos

export async function handleMockFilesystem(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "read_file": {
      const path = params.path as string;
      return {
        content: `# Sample File Content\n\nThis is mock content for file: ${path}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Section 1\nUt enim ad minim veniam, quis nostrud exercitation.\n\n## Section 2\nDuis aute irure dolor in reprehenderit in voluptate.`,
        size: 456,
        lastModified: new Date().toISOString(),
        path,
        mode: "mock",
      };
    }
    case "list_directory": {
      const path = params.path as string;
      return {
        path,
        entries: [
          { name: "Documents", type: "directory", modified: "2026-01-10T10:00:00Z" },
          { name: "Downloads", type: "directory", modified: "2026-01-14T15:30:00Z" },
          { name: "readme.md", type: "file", size: 2048, modified: "2026-01-12T09:00:00Z" },
          { name: "config.json", type: "file", size: 512, modified: "2026-01-13T14:20:00Z" },
          { name: "script.ts", type: "file", size: 1024, modified: "2026-01-15T08:00:00Z" },
        ],
        count: 5,
        mode: "mock",
      };
    }
    case "write_file": {
      return {
        success: true,
        path: params.path,
        bytesWritten: (params.content as string)?.length || 0,
        timestamp: new Date().toISOString(),
        mode: "mock",
      };
    }
    case "get_file_info": {
      return {
        path: params.path,
        name: (params.path as string)?.split("/").pop() || "file.txt",
        size: 1234,
        isFile: true,
        isDirectory: false,
        created: "2026-01-01T00:00:00Z",
        modified: new Date().toISOString(),
        permissions: "644",
        mode: "mock",
      };
    }
    case "search_files": {
      return {
        path: params.path,
        pattern: params.pattern,
        matches: [
          `${params.path}/src/index.ts`,
          `${params.path}/src/utils.ts`,
          `${params.path}/tests/index.test.ts`,
        ],
        count: 3,
        mode: "mock",
      };
    }
    default:
      return { result: "Mock operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockFetch(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  const url = params.url as string;
  return {
    url,
    status: 200,
    statusText: "OK",
    headers: {
      "content-type": "application/json",
      "x-mock-response": "true",
    },
    content: JSON.stringify({
      message: "This is a mock API response",
      url,
      timestamp: new Date().toISOString(),
      data: {
        id: 1,
        name: "Sample Data",
        items: ["item1", "item2", "item3"],
      },
    }, null, 2),
    totalLength: 256,
    mode: "mock",
  };
}

export async function handleMockGitHub(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "search_repositories": {
      return {
        query: params.query,
        totalCount: 1543,
        results: [
          { fullName: "facebook/react", description: "A declarative, efficient, and flexible JavaScript library", stars: 225000, language: "JavaScript" },
          { fullName: "vuejs/vue", description: "Vue.js is a progressive JavaScript framework", stars: 207000, language: "TypeScript" },
          { fullName: "angular/angular", description: "Platform for building mobile and desktop web applications", stars: 95000, language: "TypeScript" },
        ],
        mode: "mock",
      };
    }
    case "get_file_contents": {
      return {
        path: params.path,
        name: (params.path as string)?.split("/").pop(),
        content: `# ${params.repo}\n\nThis is mock content for ${params.owner}/${params.repo}/${params.path}\n\n## Installation\n\`\`\`bash\nnpm install ${params.repo}\n\`\`\``,
        sha: "abc123def456",
        mode: "mock",
      };
    }
    case "list_commits": {
      return {
        repository: `${params.owner}/${params.repo}`,
        commits: [
          { sha: "abc1234", message: "feat: add new feature", author: "developer1", date: "2026-01-15T10:00:00Z" },
          { sha: "def5678", message: "fix: resolve bug in component", author: "developer2", date: "2026-01-14T15:30:00Z" },
          { sha: "ghi9012", message: "docs: update README", author: "developer1", date: "2026-01-13T09:00:00Z" },
        ],
        mode: "mock",
      };
    }
    case "list_issues": {
      return {
        repository: `${params.owner}/${params.repo}`,
        state: params.state || "open",
        issues: [
          { number: 123, title: "Bug: Component not rendering correctly", state: "open", author: "user1", labels: ["bug", "high-priority"] },
          { number: 122, title: "Feature request: Add dark mode", state: "open", author: "user2", labels: ["enhancement"] },
          { number: 121, title: "Documentation needs update", state: "open", author: "user3", labels: ["documentation"] },
        ],
        mode: "mock",
      };
    }
    case "get_user": {
      return {
        username: params.username,
        name: `${params.username} (Mock User)`,
        bio: "Software developer passionate about open source",
        publicRepos: 42,
        followers: 1500,
        following: 100,
        mode: "mock",
      };
    }
    case "get_repo": {
      return {
        fullName: `${params.owner}/${params.repo}`,
        description: "A sample repository for demonstration",
        stars: 1234,
        forks: 567,
        issues: 23,
        language: "TypeScript",
        defaultBranch: "main",
        mode: "mock",
      };
    }
    default:
      return { result: "Mock GitHub operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockSlack(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "list_channels": {
      return {
        channels: [
          { id: "C001", name: "general", isPrivate: false, members: 150 },
          { id: "C002", name: "engineering", isPrivate: false, members: 45 },
          { id: "C003", name: "design", isPrivate: false, members: 20 },
          { id: "C004", name: "random", isPrivate: false, members: 120 },
        ],
        mode: "mock",
      };
    }
    case "post_message": {
      return {
        success: true,
        channel: params.channel,
        timestamp: Date.now().toString(),
        message: params.text,
        mode: "mock",
      };
    }
    case "get_channel_history": {
      return {
        channel: params.channel,
        messages: [
          { timestamp: "1705312800.000001", text: "Hey team! 👋", user: "U001" },
          { timestamp: "1705312700.000001", text: "Good morning everyone", user: "U002" },
          { timestamp: "1705312600.000001", text: "Reminder: standup in 10 minutes", user: "U003" },
        ],
        mode: "mock",
      };
    }
    default:
      return { result: "Mock Slack operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockDiscord(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "send_message": {
      return {
        success: true,
        messageId: "mock_" + Date.now(),
        content: params.content,
        timestamp: new Date().toISOString(),
        mode: "mock",
      };
    }
    case "get_messages": {
      return {
        channelId: params.channel_id,
        messages: [
          { id: "1", content: "Hello Discord! 🎮", author: "gamer123", timestamp: new Date().toISOString() },
          { id: "2", content: "Anyone up for some games?", author: "player456", timestamp: new Date().toISOString() },
        ],
        mode: "mock",
      };
    }
    case "list_channels": {
      return {
        guildId: params.guild_id,
        channels: [
          { id: "ch1", name: "general", type: "text" },
          { id: "ch2", name: "voice-chat", type: "voice" },
          { id: "ch3", name: "announcements", type: "announcement" },
        ],
        mode: "mock",
      };
    }
    default:
      return { result: "Mock Discord operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockOpenAI(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay(500);
  
  switch (toolName) {
    case "chat_completion": {
      const messages = params.messages as Array<{ role: string; content: string }>;
      const lastMessage = messages?.[messages.length - 1]?.content || "";
      return {
        model: params.model || "gpt-4o-mini",
        content: `This is a mock response to: "${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}"\n\nIn production mode with a valid OPENAI_API_KEY, this would return a real AI-generated response. The mock mode is useful for testing your integration without consuming API credits.`,
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        mode: "mock",
      };
    }
    case "generate_image": {
      return {
        prompt: params.prompt,
        model: "dall-e-3",
        images: [
          { url: "https://placehold.co/1024x1024/2563eb/white?text=Mock+DALL-E+Image", revisedPrompt: params.prompt },
        ],
        mode: "mock",
        note: "In real mode with OPENAI_API_KEY, this would generate an actual image",
      };
    }
    case "list_models": {
      return {
        models: [
          { id: "gpt-4o", owner: "openai", created: "2024-01-01" },
          { id: "gpt-4o-mini", owner: "openai", created: "2024-06-01" },
          { id: "dall-e-3", owner: "openai", created: "2023-10-01" },
          { id: "text-embedding-3-small", owner: "openai", created: "2024-01-01" },
        ],
        mode: "mock",
      };
    }
    default:
      return { result: "Mock OpenAI operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockAnthropic(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay(500);
  
  if (toolName === "message") {
    const messages = params.messages as Array<{ role: string; content: string }>;
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    return {
      model: params.model || "claude-3-5-sonnet-20241022",
      content: `This is a mock Claude response to: "${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}"\n\nWith a valid ANTHROPIC_API_KEY in real mode, you would receive an actual response from Claude.`,
      stopReason: "end_turn",
      usage: { input_tokens: 45, output_tokens: 80 },
      mode: "mock",
    };
  }
  return { result: "Mock Anthropic operation completed", tool: toolName, params, mode: "mock" };
}

export async function handleMockBraveSearch(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  const query = params.query as string;
  return {
    query,
    results: [
      { title: `${query} - Wikipedia`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, description: `Learn about ${query} on Wikipedia.` },
      { title: `${query} Guide - Official Docs`, url: `https://docs.example.com/${encodeURIComponent(query)}`, description: `Official documentation and guides for ${query}.` },
      { title: `Getting Started with ${query}`, url: `https://tutorial.example.com/${encodeURIComponent(query)}`, description: `Step-by-step tutorial for beginners.` },
    ],
    count: 3,
    mode: "mock",
  };
}

export async function handleMockStripe(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "list_customers": {
      return {
        customers: [
          { id: "cus_mock001", email: "alice@example.com", name: "Alice Johnson", created: "2026-01-01" },
          { id: "cus_mock002", email: "bob@example.com", name: "Bob Smith", created: "2026-01-05" },
          { id: "cus_mock003", email: "carol@example.com", name: "Carol Williams", created: "2026-01-10" },
        ],
        count: 3,
        mode: "mock",
      };
    }
    case "create_customer": {
      return {
        id: "cus_mock_" + Date.now(),
        email: params.email,
        name: params.name,
        created: new Date().toISOString(),
        mode: "mock",
      };
    }
    case "create_payment_intent": {
      return {
        id: "pi_mock_" + Date.now(),
        amount: params.amount,
        currency: params.currency || "usd",
        status: "requires_payment_method",
        clientSecret: "mock_secret_" + Date.now(),
        mode: "mock",
      };
    }
    default:
      return { result: "Mock Stripe operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockNotion(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "search_pages": {
      return {
        query: params.query,
        results: [
          { id: "page_001", title: `Meeting Notes - ${params.query}`, url: "https://notion.so/page_001", created: "2026-01-10" },
          { id: "page_002", title: `Project: ${params.query}`, url: "https://notion.so/page_002", created: "2026-01-12" },
        ],
        count: 2,
        mode: "mock",
      };
    }
    case "get_page": {
      return {
        id: params.page_id,
        title: "Sample Page",
        content: "This is mock page content from Notion.",
        url: `https://notion.so/${params.page_id}`,
        created: "2026-01-01",
        lastEdited: new Date().toISOString(),
        mode: "mock",
      };
    }
    default:
      return { result: "Mock Notion operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockDocker(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "list_containers": {
      return {
        containers: [
          { id: "abc123", name: "nginx-server", image: "nginx:latest", status: "Up 2 hours", ports: "80:80" },
          { id: "def456", name: "postgres-db", image: "postgres:15", status: "Up 1 day", ports: "5432:5432" },
          { id: "ghi789", name: "redis-cache", image: "redis:7", status: "Up 3 hours", ports: "6379:6379" },
        ],
        count: 3,
        mode: "mock",
      };
    }
    case "list_images": {
      return {
        images: [
          { repository: "nginx", tag: "latest", id: "sha256:abc...", size: "142MB" },
          { repository: "postgres", tag: "15", id: "sha256:def...", size: "379MB" },
          { repository: "node", tag: "20-alpine", id: "sha256:ghi...", size: "126MB" },
        ],
        count: 3,
        mode: "mock",
      };
    }
    case "container_logs": {
      return {
        container: params.container,
        logs: [
          "2026-01-15 10:00:00 - Server started successfully",
          "2026-01-15 10:01:00 - Listening on port 80",
          "2026-01-15 10:02:00 - Connection established",
        ],
        lines: 3,
        mode: "mock",
      };
    }
    default:
      return { result: "Mock Docker operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockAWS(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "s3_list_buckets": {
      return {
        buckets: [
          { name: "my-app-assets", creationDate: "2025-06-15" },
          { name: "backup-data", creationDate: "2025-08-20" },
          { name: "logs-archive", creationDate: "2026-01-01" },
        ],
        mode: "mock",
      };
    }
    case "s3_list_objects": {
      return {
        bucket: params.bucket,
        objects: [
          { key: "images/logo.png", size: 25600, lastModified: "2026-01-10" },
          { key: "data/config.json", size: 1024, lastModified: "2026-01-14" },
          { key: "docs/readme.md", size: 2048, lastModified: "2026-01-15" },
        ],
        mode: "mock",
      };
    }
    case "ec2_describe_instances": {
      return {
        instances: [
          { instanceId: "i-mock001", state: "running", type: "t3.medium", publicIp: "54.xxx.xxx.xxx" },
          { instanceId: "i-mock002", state: "stopped", type: "t3.large", publicIp: null },
        ],
        mode: "mock",
      };
    }
    default:
      return { result: "Mock AWS operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockDatabase(
  toolName: string,
  params: Record<string, unknown>,
  dbType: string
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "query":
    case "read_query":
    case "find": {
      return {
        rows: [
          { id: 1, name: "Alice", email: "alice@example.com", created_at: "2026-01-01" },
          { id: 2, name: "Bob", email: "bob@example.com", created_at: "2026-01-05" },
          { id: 3, name: "Carol", email: "carol@example.com", created_at: "2026-01-10" },
        ],
        rowCount: 3,
        executionTime: "12ms",
        database: dbType,
        mode: "mock",
      };
    }
    case "list_tables":
    case "list_collections": {
      return {
        tables: ["users", "orders", "products", "sessions"],
        count: 4,
        database: dbType,
        mode: "mock",
      };
    }
    default:
      return { result: `Mock ${dbType} operation completed`, tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockTime(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const timezone = (params.timezone as string) || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  if (toolName === "get_current_time") {
    return {
      timezone,
      datetime: now.toISOString(),
      formatted: now.toLocaleString("en-US", { timeZone: timezone, dateStyle: "full", timeStyle: "long" }),
      unix: Math.floor(now.getTime() / 1000),
      mode: "mock",
    };
  }
  
  if (toolName === "convert_time") {
    return {
      original: { time: params.time, timezone: params.from_timezone },
      converted: { timezone: params.to_timezone, formatted: now.toLocaleString("en-US", { timeZone: params.to_timezone as string }) },
      mode: "mock",
    };
  }
  
  return { result: "Mock time operation completed", tool: toolName, params, mode: "mock" };
}

export async function handleMockMemory(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "create_entities": {
      return {
        created: params.entities,
        totalEntities: 5,
        mode: "mock",
      };
    }
    case "search_nodes": {
      return {
        query: params.query,
        results: [
          { name: "Sample Entity", type: "person", observations: ["Developer", "Works remotely"] },
        ],
        count: 1,
        mode: "mock",
      };
    }
    case "read_graph": {
      return {
        entities: [
          { name: "John", type: "person", observations: ["Engineer"] },
          { name: "TechCorp", type: "company", observations: ["Software company"] },
        ],
        relations: [
          { from: "John", to: "TechCorp", type: "works_at" },
        ],
        mode: "mock",
      };
    }
    default:
      return { result: "Mock memory operation completed", tool: toolName, params, mode: "mock" };
  }
}

export async function handleMockEverything(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  switch (toolName) {
    case "echo": {
      return {
        echoed: params.message,
        length: (params.message as string)?.length || 0,
        reversed: (params.message as string)?.split("").reverse().join(""),
        mode: "mock",
      };
    }
    case "add": {
      const a = params.a as number;
      const b = params.b as number;
      return {
        a, b,
        sum: a + b,
        product: a * b,
        mode: "mock",
      };
    }
    default:
      return { result: "Mock operation completed", tool: toolName, params, mode: "mock" };
  }
}

// Generic mock handler for servers without specific implementations
export async function handleGenericMock(
  serverSlug: string,
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  await simulateDelay();
  
  return {
    server: serverSlug,
    tool: toolName,
    params,
    result: "Mock operation completed successfully",
    message: `This is a mock response for ${serverSlug}/${toolName}. Enable 'Real' mode and configure the required environment variables to execute actual operations.`,
    timestamp: new Date().toISOString(),
    mode: "mock",
  };
}

function simulateDelay(ms = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 100));
}
