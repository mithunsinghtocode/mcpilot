export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
      enum?: string[];
      default?: unknown;
    }>;
    required?: string[];
  };
  exampleRequest?: Record<string, unknown>;
  exampleResponse?: unknown;
}

export interface MCPServer {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  author: string;
  version: string;
  repository: string;
  connectionType: "stdio" | "sse" | "http";
  command?: string;
  icon: string;
  tags: string[];
  tools: MCPTool[];
  isHotPick?: boolean;
  usageCount?: number;
  documentation?: string;
  exampleCommands?: Array<{
    command: string;
    description: string;
  }>;
  requiredEnv?: string[];
  setupGuide?: {
    steps: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
    mockModeNote?: string;
    realModeNote?: string;
  };
}

export const MCP_CATEGORIES = [
  { id: "filesystem", name: "File System", icon: "📁" },
  { id: "database", name: "Database", icon: "🗄️" },
  { id: "web", name: "Web & APIs", icon: "🌐" },
  { id: "ai", name: "AI & ML", icon: "🤖" },
  { id: "productivity", name: "Productivity", icon: "⚡" },
  { id: "development", name: "Development", icon: "💻" },
  { id: "cloud", name: "Cloud Services", icon: "☁️" },
  { id: "data", name: "Data Processing", icon: "📊" },
  { id: "communication", name: "Communication", icon: "💬" },
  { id: "security", name: "Security", icon: "🔒" },
  { id: "devops", name: "DevOps", icon: "🔧" },
  { id: "media", name: "Media", icon: "🎬" },
] as const;

export const MCP_SERVERS: MCPServer[] = [
  // === OFFICIAL ANTHROPIC SERVERS ===
  {
    id: "filesystem",
    name: "Filesystem",
    slug: "filesystem",
    description: "Secure file operations with configurable access controls. Read, write, and manage files and directories.",
    category: "filesystem",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/directory",
    icon: "📁",
    tags: ["files", "directories", "read", "write", "official"],
    isHotPick: true,
    usageCount: 15420,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    exampleCommands: [
      { command: 'read_file {"path": "/Users/demo/test.txt"}', description: "Read a text file" },
      { command: 'list_directory {"path": "/Users/demo"}', description: "List files in a directory" },
      { command: 'write_file {"path": "/tmp/hello.txt", "content": "Hello World!"}', description: "Write to a file" },
      { command: 'get_file_info {"path": "/Users/demo/document.pdf"}', description: "Get file metadata" },
      { command: 'search_files {"path": "/Users/demo", "pattern": "*.ts"}', description: "Search for TypeScript files" },
    ],
    setupGuide: {
      steps: [
        { title: "No Setup Required", description: "The Filesystem MCP server works out of the box with no configuration needed." },
        { title: "Select Mode", description: "Choose between Mock mode (simulated data) or Real mode (actual file operations)." },
        { title: "Try an Example", description: "Click on an example command from the Examples tab, or type your own file path." },
        { title: "Execute", description: "Click Execute to run the operation and see the results." },
      ],
      mockModeNote: "Mock mode returns simulated file data without accessing your actual filesystem.",
      realModeNote: "Real mode performs actual file operations. Be careful when writing or deleting files.",
    },
    tools: [
      {
        name: "read_file",
        description: "Read the complete contents of a file from the filesystem",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file to read" },
          },
          required: ["path"],
        },
        exampleRequest: { path: "/Users/demo/example.txt" },
        exampleResponse: {
          content: "# Welcome\n\nThis is the content of the file.\n\n- Item 1\n- Item 2\n- Item 3",
          size: 78,
          lastModified: "2026-01-15T10:30:00Z",
          path: "/Users/demo/example.txt"
        },
      },
      {
        name: "read_multiple_files",
        description: "Read contents of multiple files simultaneously",
        inputSchema: {
          type: "object",
          properties: {
            paths: { type: "array", description: "Array of file paths to read" },
          },
          required: ["paths"],
        },
        exampleRequest: { paths: ["/file1.txt", "/file2.txt"] },
      },
      {
        name: "write_file",
        description: "Write content to a file, creating it if it doesn't exist",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path where to write the file" },
            content: { type: "string", description: "Content to write to the file" },
          },
          required: ["path", "content"],
        },
        exampleRequest: { path: "/Users/demo/new-file.txt", content: "New content here" },
        exampleResponse: { success: true, bytesWritten: 16 },
      },
      {
        name: "edit_file",
        description: "Make selective edits to a file using advanced pattern matching",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file" },
            edits: { type: "array", description: "Array of edit operations" },
            dryRun: { type: "boolean", description: "Preview changes without applying" },
          },
          required: ["path", "edits"],
        },
      },
      {
        name: "create_directory",
        description: "Create a new directory or ensure it exists",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path for the new directory" },
          },
          required: ["path"],
        },
      },
      {
        name: "list_directory",
        description: "List all files and directories in a given path",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the directory to list" },
          },
          required: ["path"],
        },
        exampleRequest: { path: "/Users/demo" },
        exampleResponse: {
          path: "/Users/demo",
          entries: [
            { name: "Documents", type: "directory", modified: "2026-01-14T09:00:00Z" },
            { name: "Downloads", type: "directory", modified: "2026-01-15T08:30:00Z" },
            { name: "readme.md", type: "file", size: 2048, modified: "2026-01-10T12:00:00Z" },
            { name: "config.json", type: "file", size: 512, modified: "2026-01-13T14:00:00Z" }
          ],
          count: 4
        },
      },
      {
        name: "move_file",
        description: "Move or rename files and directories",
        inputSchema: {
          type: "object",
          properties: {
            source: { type: "string", description: "Source path" },
            destination: { type: "string", description: "Destination path" },
          },
          required: ["source", "destination"],
        },
      },
      {
        name: "search_files",
        description: "Search for files matching a pattern",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Starting directory" },
            pattern: { type: "string", description: "Search pattern (glob)" },
          },
          required: ["path", "pattern"],
        },
      },
      {
        name: "get_file_info",
        description: "Get detailed metadata about a file",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to the file" },
          },
          required: ["path"],
        },
      },
      {
        name: "list_allowed_directories",
        description: "List all directories the server is allowed to access",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    slug: "github",
    description: "Interact with GitHub repositories, issues, pull requests, and more through the GitHub API.",
    category: "development",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-github",
    icon: "🐙",
    tags: ["github", "git", "repositories", "issues", "official"],
    isHotPick: true,
    usageCount: 12350,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    requiredEnv: ["GITHUB_TOKEN"],
    exampleCommands: [
      { command: 'search_repositories {"query": "react framework stars:>1000"}', description: "Search popular React repos" },
      { command: 'get_file_contents {"owner": "facebook", "repo": "react", "path": "README.md"}', description: "Read React README" },
      { command: 'list_issues {"owner": "vercel", "repo": "next.js", "state": "open"}', description: "List open Next.js issues" },
      { command: 'list_commits {"owner": "microsoft", "repo": "vscode"}', description: "Get VS Code commits" },
      { command: 'get_user {"username": "torvalds"}', description: "Get user profile" },
      { command: 'get_repo {"owner": "nodejs", "repo": "node"}', description: "Get Node.js repo info" },
    ],
    setupGuide: {
      steps: [
        { title: "Create GitHub Token", description: "Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token" },
        { title: "Select Scopes", description: "For read operations: select 'public_repo'. For write operations: select 'repo' (full access)" },
        { title: "Set Environment Variable", description: "Add the token to your environment", code: "export GITHUB_TOKEN=ghp_your_token_here" },
        { title: "Or use .env file", description: "Create .env.local in your project root", code: "GITHUB_TOKEN=ghp_your_token_here" },
      ],
      mockModeNote: "Mock mode returns sample repository data. Great for testing without using API limits.",
      realModeNote: "Public repo reads work without a token. Private repos and write operations require authentication.",
    },
    tools: [
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            page: { type: "number", description: "Page number", default: 1 },
            perPage: { type: "number", description: "Results per page", default: 30 },
          },
          required: ["query"],
        },
        exampleRequest: { query: "react framework", page: 1 },
        exampleResponse: {
          query: "react framework",
          totalCount: 15432,
          page: 1,
          perPage: 30,
          results: [
            { fullName: "facebook/react", description: "A declarative JavaScript library for building user interfaces", stars: 225000, url: "https://github.com/facebook/react", language: "JavaScript" },
            { fullName: "facebook/react-native", description: "A framework for building native apps using React", stars: 117000, url: "https://github.com/facebook/react-native", language: "JavaScript" }
          ]
        },
      },
      {
        name: "get_file_contents",
        description: "Get contents of a file from a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            path: { type: "string", description: "Path to file" },
            branch: { type: "string", description: "Branch name", default: "main" },
          },
          required: ["owner", "repo", "path"],
        },
        exampleRequest: { owner: "facebook", repo: "react", path: "README.md" },
      },
      {
        name: "create_or_update_file",
        description: "Create or update a file in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            path: { type: "string", description: "Path to file" },
            content: { type: "string", description: "File content" },
            message: { type: "string", description: "Commit message" },
            branch: { type: "string", description: "Branch name" },
          },
          required: ["owner", "repo", "path", "content", "message"],
        },
      },
      {
        name: "push_files",
        description: "Push multiple files in a single commit",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            branch: { type: "string", description: "Branch name" },
            files: { type: "array", description: "Array of files to push" },
            message: { type: "string", description: "Commit message" },
          },
          required: ["owner", "repo", "branch", "files", "message"],
        },
      },
      {
        name: "create_issue",
        description: "Create a new issue in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            title: { type: "string", description: "Issue title" },
            body: { type: "string", description: "Issue body" },
            labels: { type: "array", description: "Labels to add" },
          },
          required: ["owner", "repo", "title"],
        },
        exampleRequest: { owner: "myorg", repo: "myrepo", title: "Bug report", body: "Found a bug..." },
      },
      {
        name: "create_pull_request",
        description: "Create a new pull request",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            title: { type: "string", description: "PR title" },
            body: { type: "string", description: "PR description" },
            head: { type: "string", description: "Head branch" },
            base: { type: "string", description: "Base branch" },
          },
          required: ["owner", "repo", "title", "head", "base"],
        },
      },
      {
        name: "fork_repository",
        description: "Fork a repository to your account",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "create_branch",
        description: "Create a new branch",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            branch: { type: "string", description: "New branch name" },
            from_branch: { type: "string", description: "Source branch" },
          },
          required: ["owner", "repo", "branch"],
        },
      },
      {
        name: "list_commits",
        description: "List commits in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            sha: { type: "string", description: "Branch or commit SHA" },
            page: { type: "number", description: "Page number" },
          },
          required: ["owner", "repo"],
        },
      },
      {
        name: "list_issues",
        description: "List issues in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            state: { type: "string", description: "Issue state (open, closed, all)" },
          },
          required: ["owner", "repo"],
        },
      },
    ],
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    slug: "postgres",
    description: "Connect to PostgreSQL databases with read-only access for secure data exploration and querying.",
    category: "database",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb",
    icon: "🐘",
    tags: ["postgresql", "database", "sql", "queries", "official"],
    isHotPick: true,
    usageCount: 9840,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    requiredEnv: ["POSTGRES_URL"],
    exampleCommands: [
      { command: 'query {"sql": "SELECT * FROM users LIMIT 10"}', description: "Query users table" },
      { command: 'query {"sql": "SELECT COUNT(*) FROM orders WHERE status = \'pending\'"}', description: "Count pending orders" },
      { command: 'list_tables {}', description: "List all database tables" },
      { command: 'describe_table {"table_name": "products"}', description: "Get products table schema" },
    ],
    tools: [
      {
        name: "query",
        description: "Execute a read-only SQL query",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string", description: "SQL query to execute" },
          },
          required: ["sql"],
        },
        exampleRequest: { sql: "SELECT * FROM users LIMIT 10" },
        exampleResponse: [{ id: 1, name: "John", email: "john@example.com" }],
      },
      {
        name: "list_tables",
        description: "List all tables in the connected database",
        inputSchema: {
          type: "object",
          properties: {},
        },
        exampleRequest: {},
        exampleResponse: ["users", "orders", "products"],
      },
      {
        name: "describe_table",
        description: "Get schema information for a table",
        inputSchema: {
          type: "object",
          properties: {
            table_name: { type: "string", description: "Name of the table" },
          },
          required: ["table_name"],
        },
      },
    ],
  },
  {
    id: "brave-search",
    name: "Brave Search",
    slug: "brave-search",
    description: "Web and local search using Brave's Search API for privacy-focused search results.",
    category: "web",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-brave-search",
    icon: "🦁",
    tags: ["search", "web", "brave", "privacy", "official"],
    isHotPick: true,
    usageCount: 8720,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    requiredEnv: ["BRAVE_API_KEY"],
    exampleCommands: [
      { command: 'brave_web_search {"query": "latest AI news 2026"}', description: "Search for AI news" },
      { command: 'brave_web_search {"query": "Next.js 15 features", "count": 5}', description: "Search with limited results" },
      { command: 'brave_local_search {"query": "best coffee shops San Francisco"}', description: "Search local businesses" },
    ],
    tools: [
      {
        name: "brave_web_search",
        description: "Perform a web search using Brave Search",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            count: { type: "number", description: "Number of results", default: 10 },
          },
          required: ["query"],
        },
        exampleRequest: { query: "latest AI news", count: 5 },
      },
      {
        name: "brave_local_search",
        description: "Search for local businesses and places",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Local search query" },
            count: { type: "number", description: "Number of results", default: 5 },
          },
          required: ["query"],
        },
        exampleRequest: { query: "coffee shops near me" },
      },
    ],
  },
  {
    id: "memory",
    name: "Memory",
    slug: "memory",
    description: "Knowledge graph-based persistent memory system using a local JSON file for storage.",
    category: "ai",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-memory",
    icon: "🧠",
    tags: ["memory", "knowledge-graph", "persistence", "official"],
    usageCount: 7650,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    exampleCommands: [
      { command: 'create_entities {"entities": [{"name": "John", "type": "person", "observations": ["Software engineer", "Lives in SF"]}]}', description: "Create an entity" },
      { command: 'create_relations {"relations": [{"from": "John", "to": "TechCorp", "type": "works_at"}]}', description: "Create a relation" },
      { command: 'search_nodes {"query": "engineer"}', description: "Search the knowledge graph" },
      { command: 'read_graph {}', description: "Get entire knowledge graph" },
    ],
    tools: [
      {
        name: "create_entities",
        description: "Create new entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entities: { type: "array", description: "Array of entities to create" },
          },
          required: ["entities"],
        },
      },
      {
        name: "create_relations",
        description: "Create relations between entities",
        inputSchema: {
          type: "object",
          properties: {
            relations: { type: "array", description: "Array of relations" },
          },
          required: ["relations"],
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "Open specific nodes by name",
        inputSchema: {
          type: "object",
          properties: {
            names: { type: "array", description: "Node names to open" },
          },
          required: ["names"],
        },
      },
      {
        name: "delete_entities",
        description: "Delete entities from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: { type: "array", description: "Names of entities to delete" },
          },
          required: ["entityNames"],
        },
      },
    ],
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    slug: "puppeteer",
    description: "Browser automation and web scraping capabilities using Puppeteer.",
    category: "web",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-puppeteer",
    icon: "🎭",
    tags: ["browser", "automation", "scraping", "testing", "official"],
    usageCount: 6890,
    tools: [
      {
        name: "puppeteer_navigate",
        description: "Navigate to a URL in the browser",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to navigate to" },
          },
          required: ["url"],
        },
        exampleRequest: { url: "https://example.com" },
      },
      {
        name: "puppeteer_screenshot",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name for the screenshot" },
            selector: { type: "string", description: "CSS selector to screenshot" },
            width: { type: "number", description: "Viewport width" },
            height: { type: "number", description: "Viewport height" },
          },
          required: ["name"],
        },
      },
      {
        name: "puppeteer_click",
        description: "Click on an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector to click" },
          },
          required: ["selector"],
        },
      },
      {
        name: "puppeteer_fill",
        description: "Fill out an input field",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector for input" },
            value: { type: "string", description: "Value to fill" },
          },
          required: ["selector", "value"],
        },
      },
      {
        name: "puppeteer_select",
        description: "Select an option from a dropdown",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector for select" },
            value: { type: "string", description: "Value to select" },
          },
          required: ["selector", "value"],
        },
      },
      {
        name: "puppeteer_hover",
        description: "Hover over an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector to hover" },
          },
          required: ["selector"],
        },
      },
      {
        name: "puppeteer_evaluate",
        description: "Execute JavaScript in the browser",
        inputSchema: {
          type: "object",
          properties: {
            script: { type: "string", description: "JavaScript code to execute" },
          },
          required: ["script"],
        },
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    slug: "slack",
    description: "Interact with Slack workspaces, channels, and messages.",
    category: "communication",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-slack",
    icon: "💬",
    tags: ["slack", "messaging", "teams", "official"],
    usageCount: 5430,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    requiredEnv: ["SLACK_BOT_TOKEN"],
    exampleCommands: [
      { command: 'list_channels {}', description: "List all channels" },
      { command: 'post_message {"channel": "#general", "text": "Hello from MCPilot!"}', description: "Post a message" },
      { command: 'get_channel_history {"channel": "C1234567890", "limit": 10}', description: "Get recent messages" },
      { command: 'get_users {}', description: "List workspace users" },
      { command: 'add_reaction {"channel": "C123", "timestamp": "1234567890.123456", "name": "thumbsup"}', description: "Add reaction" },
    ],
    setupGuide: {
      steps: [
        { title: "Create Slack App", description: "Go to api.slack.com/apps and click 'Create New App'" },
        { title: "Choose Workspace", description: "Select 'From scratch' and choose your workspace" },
        { title: "Add Bot Scopes", description: "Under OAuth & Permissions, add scopes: channels:read, chat:write, users:read" },
        { title: "Install to Workspace", description: "Click 'Install to Workspace' and authorize the app" },
        { title: "Copy Bot Token", description: "Copy the Bot User OAuth Token (starts with xoxb-)", code: "export SLACK_BOT_TOKEN=xoxb-your-token" },
      ],
      mockModeNote: "Mock mode returns sample channel and message data without connecting to Slack.",
      realModeNote: "Real mode sends actual messages to your Slack workspace. Test in a private channel first!",
    },
    tools: [
      {
        name: "list_channels",
        description: "List all channels in the workspace",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum channels to return", default: 100 },
            cursor: { type: "string", description: "Pagination cursor" },
          },
        },
      },
      {
        name: "post_message",
        description: "Post a message to a channel",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID or name" },
            text: { type: "string", description: "Message text" },
          },
          required: ["channel", "text"],
        },
      },
      {
        name: "reply_to_thread",
        description: "Reply to a message thread",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID" },
            thread_ts: { type: "string", description: "Thread timestamp" },
            text: { type: "string", description: "Reply text" },
          },
          required: ["channel", "thread_ts", "text"],
        },
      },
      {
        name: "add_reaction",
        description: "Add a reaction emoji to a message",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID" },
            timestamp: { type: "string", description: "Message timestamp" },
            name: { type: "string", description: "Emoji name" },
          },
          required: ["channel", "timestamp", "name"],
        },
      },
      {
        name: "get_channel_history",
        description: "Get message history from a channel",
        inputSchema: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID" },
            limit: { type: "number", description: "Number of messages" },
          },
          required: ["channel"],
        },
      },
      {
        name: "get_users",
        description: "List users in the workspace",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum users to return" },
          },
        },
      },
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    slug: "google-drive",
    description: "Access and manage files in Google Drive.",
    category: "cloud",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-gdrive",
    icon: "📀",
    tags: ["google", "drive", "storage", "official"],
    usageCount: 4210,
    tools: [
      {
        name: "search_files",
        description: "Search for files in Google Drive",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "read_file",
        description: "Read contents of a file",
        inputSchema: {
          type: "object",
          properties: {
            fileId: { type: "string", description: "Google Drive file ID" },
          },
          required: ["fileId"],
        },
      },
    ],
  },
  {
    id: "fetch",
    name: "Fetch",
    slug: "fetch",
    description: "Make HTTP requests to fetch web content and APIs.",
    category: "web",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-fetch",
    icon: "🌐",
    tags: ["http", "api", "web", "requests", "official"],
    isHotPick: true,
    usageCount: 7120,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    exampleCommands: [
      { command: 'fetch {"url": "https://api.github.com/users/octocat"}', description: "Fetch GitHub user data" },
      { command: 'fetch {"url": "https://jsonplaceholder.typicode.com/posts/1"}', description: "Get a JSON post" },
      { command: 'fetch {"url": "https://httpbin.org/headers"}', description: "Test HTTP headers" },
      { command: 'fetch {"url": "https://api.ipify.org?format=json"}', description: "Get public IP address" },
    ],
    tools: [
      {
        name: "fetch",
        description: "Fetch a URL and return its contents",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to fetch" },
            maxLength: { type: "number", description: "Maximum response length" },
            startIndex: { type: "number", description: "Start index for pagination" },
            raw: { type: "boolean", description: "Return raw content without processing" },
          },
          required: ["url"],
        },
        exampleRequest: { url: "https://api.github.com/users/octocat" },
      },
    ],
  },
  {
    id: "sqlite",
    name: "SQLite",
    slug: "sqlite",
    description: "Query and analyze SQLite databases with business intelligence capabilities.",
    category: "database",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-sqlite /path/to/database.db",
    icon: "🗃️",
    tags: ["sqlite", "database", "sql", "official"],
    usageCount: 5890,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    exampleCommands: [
      { command: 'read_query {"query": "SELECT * FROM users LIMIT 5"}', description: "Query users table" },
      { command: 'read_query {"query": "SELECT name, price FROM products WHERE category = \'Electronics\'"}', description: "Filter products" },
      { command: 'list_tables {}', description: "List all tables" },
      { command: 'describe_table {"table_name": "orders"}', description: "Get table schema" },
      { command: 'write_query {"query": "INSERT INTO users (name, email) VALUES (\'Alice\', \'alice@example.com\')"}', description: "Insert a row" },
    ],
    tools: [
      {
        name: "read_query",
        description: "Execute a SELECT query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "SQL SELECT query" },
          },
          required: ["query"],
        },
      },
      {
        name: "write_query",
        description: "Execute an INSERT, UPDATE, or DELETE query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "SQL modification query" },
          },
          required: ["query"],
        },
      },
      {
        name: "create_table",
        description: "Create a new table",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "CREATE TABLE query" },
          },
          required: ["query"],
        },
      },
      {
        name: "list_tables",
        description: "List all tables in the database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "describe_table",
        description: "Get table schema",
        inputSchema: {
          type: "object",
          properties: {
            table_name: { type: "string", description: "Table name" },
          },
          required: ["table_name"],
        },
      },
    ],
  },
  {
    id: "google-maps",
    name: "Google Maps",
    slug: "google-maps",
    description: "Access Google Maps API for geocoding, directions, and place search.",
    category: "web",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-google-maps",
    icon: "🗺️",
    tags: ["maps", "google", "geocoding", "directions", "official"],
    usageCount: 4560,
    tools: [
      {
        name: "geocode",
        description: "Convert an address to coordinates",
        inputSchema: {
          type: "object",
          properties: {
            address: { type: "string", description: "Address to geocode" },
          },
          required: ["address"],
        },
      },
      {
        name: "reverse_geocode",
        description: "Convert coordinates to an address",
        inputSchema: {
          type: "object",
          properties: {
            latitude: { type: "number", description: "Latitude" },
            longitude: { type: "number", description: "Longitude" },
          },
          required: ["latitude", "longitude"],
        },
      },
      {
        name: "search_places",
        description: "Search for places nearby",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            location: { type: "string", description: "Location (lat,lng)" },
            radius: { type: "number", description: "Search radius in meters" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_directions",
        description: "Get directions between two points",
        inputSchema: {
          type: "object",
          properties: {
            origin: { type: "string", description: "Starting point" },
            destination: { type: "string", description: "Ending point" },
            mode: { type: "string", description: "Travel mode (driving, walking, bicycling, transit)" },
          },
          required: ["origin", "destination"],
        },
      },
    ],
  },
  // === COMMUNITY & THIRD-PARTY SERVERS ===
  {
    id: "notion",
    name: "Notion",
    slug: "notion",
    description: "Interact with Notion workspaces, pages, databases, and blocks.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-notion",
    icon: "📝",
    tags: ["notion", "notes", "productivity", "database"],
    usageCount: 6780,
    documentation: "https://developers.notion.com/reference",
    requiredEnv: ["NOTION_API_KEY"],
    exampleCommands: [
      { command: 'search_pages {"query": "meeting notes"}', description: "Search for pages" },
      { command: 'get_page {"page_id": "abc123..."}', description: "Get page details" },
      { command: 'create_page {"parent_id": "abc123...", "title": "New Page", "content": "Page content here"}', description: "Create a new page" },
      { command: 'query_database {"database_id": "def456..."}', description: "Query a database" },
    ],
    tools: [
      {
        name: "search_pages",
        description: "Search for pages in Notion",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_page",
        description: "Get a page by ID",
        inputSchema: {
          type: "object",
          properties: {
            page_id: { type: "string", description: "Page ID" },
          },
          required: ["page_id"],
        },
      },
      {
        name: "create_page",
        description: "Create a new page",
        inputSchema: {
          type: "object",
          properties: {
            parent_id: { type: "string", description: "Parent page or database ID" },
            title: { type: "string", description: "Page title" },
            content: { type: "string", description: "Page content" },
          },
          required: ["parent_id", "title"],
        },
      },
      {
        name: "update_page",
        description: "Update an existing page",
        inputSchema: {
          type: "object",
          properties: {
            page_id: { type: "string", description: "Page ID" },
            properties: { type: "object", description: "Properties to update" },
          },
          required: ["page_id", "properties"],
        },
      },
      {
        name: "query_database",
        description: "Query a Notion database",
        inputSchema: {
          type: "object",
          properties: {
            database_id: { type: "string", description: "Database ID" },
            filter: { type: "object", description: "Filter conditions" },
            sorts: { type: "array", description: "Sort conditions" },
          },
          required: ["database_id"],
        },
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    slug: "linear",
    description: "Project management and issue tracking with Linear.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/jerhadf/linear-mcp-server",
    connectionType: "stdio",
    command: "npx -y linear-mcp-server",
    icon: "📊",
    tags: ["linear", "issues", "project-management", "agile"],
    usageCount: 4320,
    tools: [
      {
        name: "search_issues",
        description: "Search for issues",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            teamId: { type: "string", description: "Team ID" },
          },
          required: ["query"],
        },
      },
      {
        name: "create_issue",
        description: "Create a new issue",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Issue title" },
            description: { type: "string", description: "Issue description" },
            teamId: { type: "string", description: "Team ID" },
            priority: { type: "number", description: "Priority (0-4)" },
          },
          required: ["title", "teamId"],
        },
      },
      {
        name: "update_issue",
        description: "Update an existing issue",
        inputSchema: {
          type: "object",
          properties: {
            issueId: { type: "string", description: "Issue ID" },
            title: { type: "string", description: "New title" },
            description: { type: "string", description: "New description" },
            stateId: { type: "string", description: "New state ID" },
          },
          required: ["issueId"],
        },
      },
      {
        name: "list_projects",
        description: "List all projects",
        inputSchema: {
          type: "object",
          properties: {
            teamId: { type: "string", description: "Team ID" },
          },
        },
      },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    slug: "jira",
    description: "Atlassian Jira issue tracking and project management.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/jira-mcp-server",
    connectionType: "stdio",
    command: "npx -y jira-mcp-server",
    icon: "🔷",
    tags: ["jira", "atlassian", "issues", "project-management"],
    usageCount: 5120,
    tools: [
      {
        name: "search_issues",
        description: "Search Jira issues using JQL",
        inputSchema: {
          type: "object",
          properties: {
            jql: { type: "string", description: "JQL query" },
            maxResults: { type: "number", description: "Maximum results" },
          },
          required: ["jql"],
        },
      },
      {
        name: "create_issue",
        description: "Create a new Jira issue",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string", description: "Project key" },
            summary: { type: "string", description: "Issue summary" },
            description: { type: "string", description: "Issue description" },
            issueType: { type: "string", description: "Issue type (Bug, Task, Story)" },
          },
          required: ["project", "summary", "issueType"],
        },
      },
      {
        name: "update_issue",
        description: "Update a Jira issue",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: { type: "string", description: "Issue key (e.g., PROJ-123)" },
            fields: { type: "object", description: "Fields to update" },
          },
          required: ["issueKey", "fields"],
        },
      },
      {
        name: "transition_issue",
        description: "Transition an issue to a new status",
        inputSchema: {
          type: "object",
          properties: {
            issueKey: { type: "string", description: "Issue key" },
            transition: { type: "string", description: "Transition name or ID" },
          },
          required: ["issueKey", "transition"],
        },
      },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    slug: "aws",
    description: "Interact with Amazon Web Services resources.",
    category: "cloud",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/aws-samples/aws-mcp-server",
    connectionType: "stdio",
    command: "npx -y aws-mcp-server",
    icon: "☁️",
    tags: ["aws", "amazon", "cloud", "s3", "ec2"],
    usageCount: 6890,
    documentation: "https://docs.aws.amazon.com/",
    requiredEnv: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
    exampleCommands: [
      { command: 's3_list_buckets {}', description: "List S3 buckets" },
      { command: 's3_list_objects {"bucket": "my-bucket", "prefix": "uploads/"}', description: "List bucket objects" },
      { command: 's3_get_object {"bucket": "my-bucket", "key": "config.json"}', description: "Get object from S3" },
      { command: 'ec2_describe_instances {}', description: "List EC2 instances" },
      { command: 'lambda_invoke {"functionName": "my-function", "payload": {"key": "value"}}', description: "Invoke Lambda" },
    ],
    tools: [
      {
        name: "s3_list_buckets",
        description: "List all S3 buckets",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "s3_list_objects",
        description: "List objects in an S3 bucket",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string", description: "Bucket name" },
            prefix: { type: "string", description: "Object prefix" },
          },
          required: ["bucket"],
        },
      },
      {
        name: "s3_get_object",
        description: "Get an object from S3",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string", description: "Bucket name" },
            key: { type: "string", description: "Object key" },
          },
          required: ["bucket", "key"],
        },
      },
      {
        name: "s3_put_object",
        description: "Upload an object to S3",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string", description: "Bucket name" },
            key: { type: "string", description: "Object key" },
            content: { type: "string", description: "Object content" },
          },
          required: ["bucket", "key", "content"],
        },
      },
      {
        name: "ec2_describe_instances",
        description: "Describe EC2 instances",
        inputSchema: {
          type: "object",
          properties: {
            instanceIds: { type: "array", description: "Instance IDs" },
          },
        },
      },
      {
        name: "lambda_invoke",
        description: "Invoke a Lambda function",
        inputSchema: {
          type: "object",
          properties: {
            functionName: { type: "string", description: "Function name" },
            payload: { type: "object", description: "Invocation payload" },
          },
          required: ["functionName"],
        },
      },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    slug: "docker",
    description: "Manage Docker containers, images, and networks.",
    category: "devops",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/docker-mcp-server",
    connectionType: "stdio",
    command: "npx -y docker-mcp-server",
    icon: "🐳",
    tags: ["docker", "containers", "devops", "deployment"],
    usageCount: 5670,
    documentation: "https://docs.docker.com/engine/api/",
    exampleCommands: [
      { command: 'list_containers {"all": true}', description: "List all containers" },
      { command: 'list_images {}', description: "List Docker images" },
      { command: 'container_logs {"container": "my-app", "tail": 50}', description: "View container logs" },
      { command: 'start_container {"container": "nginx-server"}', description: "Start a container" },
      { command: 'stop_container {"container": "nginx-server"}', description: "Stop a container" },
      { command: 'run_container {"image": "nginx:latest", "name": "my-nginx"}', description: "Run new container" },
    ],
    tools: [
      {
        name: "list_containers",
        description: "List running containers",
        inputSchema: {
          type: "object",
          properties: {
            all: { type: "boolean", description: "Include stopped containers" },
          },
        },
      },
      {
        name: "start_container",
        description: "Start a container",
        inputSchema: {
          type: "object",
          properties: {
            container: { type: "string", description: "Container ID or name" },
          },
          required: ["container"],
        },
      },
      {
        name: "stop_container",
        description: "Stop a running container",
        inputSchema: {
          type: "object",
          properties: {
            container: { type: "string", description: "Container ID or name" },
          },
          required: ["container"],
        },
      },
      {
        name: "container_logs",
        description: "Get container logs",
        inputSchema: {
          type: "object",
          properties: {
            container: { type: "string", description: "Container ID or name" },
            tail: { type: "number", description: "Number of lines" },
          },
          required: ["container"],
        },
      },
      {
        name: "list_images",
        description: "List Docker images",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "run_container",
        description: "Run a new container",
        inputSchema: {
          type: "object",
          properties: {
            image: { type: "string", description: "Image name" },
            name: { type: "string", description: "Container name" },
            ports: { type: "object", description: "Port mappings" },
            env: { type: "object", description: "Environment variables" },
          },
          required: ["image"],
        },
      },
    ],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    slug: "kubernetes",
    description: "Manage Kubernetes clusters, pods, and deployments.",
    category: "devops",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/kubernetes-mcp-server",
    connectionType: "stdio",
    command: "npx -y kubernetes-mcp-server",
    icon: "⎈",
    tags: ["kubernetes", "k8s", "containers", "orchestration"],
    usageCount: 4890,
    tools: [
      {
        name: "get_pods",
        description: "List pods in a namespace",
        inputSchema: {
          type: "object",
          properties: {
            namespace: { type: "string", description: "Namespace", default: "default" },
          },
        },
      },
      {
        name: "get_deployments",
        description: "List deployments",
        inputSchema: {
          type: "object",
          properties: {
            namespace: { type: "string", description: "Namespace" },
          },
        },
      },
      {
        name: "scale_deployment",
        description: "Scale a deployment",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Deployment name" },
            namespace: { type: "string", description: "Namespace" },
            replicas: { type: "number", description: "Number of replicas" },
          },
          required: ["name", "replicas"],
        },
      },
      {
        name: "get_logs",
        description: "Get pod logs",
        inputSchema: {
          type: "object",
          properties: {
            pod: { type: "string", description: "Pod name" },
            namespace: { type: "string", description: "Namespace" },
            container: { type: "string", description: "Container name" },
          },
          required: ["pod"],
        },
      },
      {
        name: "apply_manifest",
        description: "Apply a Kubernetes manifest",
        inputSchema: {
          type: "object",
          properties: {
            manifest: { type: "string", description: "YAML manifest" },
          },
          required: ["manifest"],
        },
      },
    ],
  },
  {
    id: "sentry",
    name: "Sentry",
    slug: "sentry",
    description: "Error tracking and performance monitoring with Sentry.",
    category: "devops",
    author: "Sentry",
    version: "1.0.0",
    repository: "https://github.com/getsentry/sentry-mcp-server",
    connectionType: "stdio",
    command: "npx -y @sentry/mcp-server",
    icon: "🐛",
    tags: ["sentry", "errors", "monitoring", "debugging"],
    usageCount: 4320,
    tools: [
      {
        name: "list_issues",
        description: "List Sentry issues",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string", description: "Project slug" },
            query: { type: "string", description: "Search query" },
          },
          required: ["project"],
        },
      },
      {
        name: "get_issue",
        description: "Get issue details",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: { type: "string", description: "Issue ID" },
          },
          required: ["issue_id"],
        },
      },
      {
        name: "resolve_issue",
        description: "Resolve an issue",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: { type: "string", description: "Issue ID" },
          },
          required: ["issue_id"],
        },
      },
    ],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    slug: "mongodb",
    description: "Query and manage MongoDB databases.",
    category: "database",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/mongodb-mcp-server",
    connectionType: "stdio",
    command: "npx -y mongodb-mcp-server",
    icon: "🍃",
    tags: ["mongodb", "nosql", "database", "documents"],
    usageCount: 5670,
    documentation: "https://www.mongodb.com/docs/drivers/node/current/",
    requiredEnv: ["MONGODB_URL"],
    exampleCommands: [
      { command: 'find {"collection": "users", "filter": {"age": {"$gt": 21}}, "limit": 10}', description: "Find users over 21" },
      { command: 'insert {"collection": "posts", "documents": [{"title": "Hello", "content": "World"}]}', description: "Insert a document" },
      { command: 'aggregate {"collection": "orders", "pipeline": [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]}', description: "Aggregate orders" },
      { command: 'list_collections {}', description: "List all collections" },
    ],
    tools: [
      {
        name: "find",
        description: "Find documents in a collection",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", description: "Collection name" },
            filter: { type: "object", description: "Query filter" },
            limit: { type: "number", description: "Maximum documents" },
          },
          required: ["collection"],
        },
      },
      {
        name: "insert",
        description: "Insert documents",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", description: "Collection name" },
            documents: { type: "array", description: "Documents to insert" },
          },
          required: ["collection", "documents"],
        },
      },
      {
        name: "update",
        description: "Update documents",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", description: "Collection name" },
            filter: { type: "object", description: "Query filter" },
            update: { type: "object", description: "Update operations" },
          },
          required: ["collection", "filter", "update"],
        },
      },
      {
        name: "aggregate",
        description: "Run an aggregation pipeline",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", description: "Collection name" },
            pipeline: { type: "array", description: "Aggregation stages" },
          },
          required: ["collection", "pipeline"],
        },
      },
      {
        name: "list_collections",
        description: "List all collections",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  },
  {
    id: "redis",
    name: "Redis",
    slug: "redis",
    description: "Interact with Redis cache and data store.",
    category: "database",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/redis-mcp-server",
    connectionType: "stdio",
    command: "npx -y redis-mcp-server",
    icon: "🔴",
    tags: ["redis", "cache", "database", "key-value"],
    usageCount: 4560,
    documentation: "https://redis.io/docs/",
    requiredEnv: ["REDIS_URL"],
    exampleCommands: [
      { command: 'get {"key": "user:123:session"}', description: "Get a key value" },
      { command: 'set {"key": "cache:homepage", "value": "cached data", "ttl": 3600}', description: "Set with 1hr TTL" },
      { command: 'del {"key": "temp:data"}', description: "Delete a key" },
      { command: 'keys {"pattern": "user:*"}', description: "Find keys by pattern" },
    ],
    tools: [
      {
        name: "get",
        description: "Get a value by key",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "Key name" },
          },
          required: ["key"],
        },
      },
      {
        name: "set",
        description: "Set a key-value pair",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "Key name" },
            value: { type: "string", description: "Value" },
            ttl: { type: "number", description: "Time to live in seconds" },
          },
          required: ["key", "value"],
        },
      },
      {
        name: "del",
        description: "Delete a key",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "Key name" },
          },
          required: ["key"],
        },
      },
      {
        name: "keys",
        description: "Find keys matching a pattern",
        inputSchema: {
          type: "object",
          properties: {
            pattern: { type: "string", description: "Pattern (e.g., user:*)" },
          },
          required: ["pattern"],
        },
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    slug: "openai",
    description: "Access OpenAI APIs for GPT, DALL-E, and embeddings.",
    category: "ai",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/openai-mcp-server",
    connectionType: "stdio",
    command: "npx -y openai-mcp-server",
    icon: "🤖",
    tags: ["openai", "gpt", "ai", "embeddings"],
    usageCount: 8900,
    documentation: "https://platform.openai.com/docs/api-reference",
    requiredEnv: ["OPENAI_API_KEY"],
    exampleCommands: [
      { command: 'chat_completion {"messages": [{"role": "user", "content": "Explain quantum computing in simple terms"}], "model": "gpt-4o-mini"}', description: "Chat with GPT" },
      { command: 'generate_image {"prompt": "A futuristic city with flying cars at sunset", "size": "1024x1024"}', description: "Generate with DALL-E" },
      { command: 'create_embeddings {"input": "Hello world", "model": "text-embedding-3-small"}', description: "Create embeddings" },
      { command: 'list_models {}', description: "List available models" },
    ],
    setupGuide: {
      steps: [
        { title: "Get API Key", description: "Sign up at platform.openai.com and navigate to API keys section" },
        { title: "Create New Key", description: "Click 'Create new secret key' and copy it immediately (you won't see it again)" },
        { title: "Set Environment Variable", description: "Add to your environment", code: "export OPENAI_API_KEY=sk-your-key-here" },
        { title: "Check Usage Limits", description: "Ensure you have sufficient credits. New accounts get free credits." },
      ],
      mockModeNote: "Mock mode returns sample AI responses without using API credits.",
      realModeNote: "Real mode calls OpenAI API. Costs apply based on tokens used. Monitor your usage.",
    },
    tools: [
      {
        name: "chat_completion",
        description: "Generate a chat completion",
        inputSchema: {
          type: "object",
          properties: {
            messages: { type: "array", description: "Chat messages" },
            model: { type: "string", description: "Model name", default: "gpt-4" },
            temperature: { type: "number", description: "Temperature" },
          },
          required: ["messages"],
        },
      },
      {
        name: "generate_image",
        description: "Generate an image with DALL-E",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Image description" },
            size: { type: "string", description: "Image size" },
            n: { type: "number", description: "Number of images" },
          },
          required: ["prompt"],
        },
      },
      {
        name: "create_embeddings",
        description: "Create text embeddings",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "string", description: "Text to embed" },
            model: { type: "string", description: "Embedding model" },
          },
          required: ["input"],
        },
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    slug: "anthropic",
    description: "Access Anthropic's Claude API.",
    category: "ai",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/anthropic-mcp-server",
    connectionType: "stdio",
    command: "npx -y anthropic-mcp-server",
    icon: "🧠",
    tags: ["anthropic", "claude", "ai", "llm"],
    usageCount: 7200,
    documentation: "https://docs.anthropic.com/claude/reference/",
    requiredEnv: ["ANTHROPIC_API_KEY"],
    exampleCommands: [
      { command: 'message {"messages": [{"role": "user", "content": "Write a haiku about programming"}], "model": "claude-3-5-sonnet-20241022"}', description: "Chat with Claude" },
      { command: 'message {"messages": [{"role": "user", "content": "Analyze this code for bugs"}], "max_tokens": 2000}', description: "Code analysis" },
    ],
    tools: [
      {
        name: "message",
        description: "Send a message to Claude",
        inputSchema: {
          type: "object",
          properties: {
            messages: { type: "array", description: "Conversation messages" },
            model: { type: "string", description: "Model name" },
            max_tokens: { type: "number", description: "Maximum tokens" },
          },
          required: ["messages"],
        },
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    slug: "discord",
    description: "Interact with Discord servers, channels, and messages.",
    category: "communication",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/discord-mcp-server",
    connectionType: "stdio",
    command: "npx -y discord-mcp-server",
    icon: "🎮",
    tags: ["discord", "chat", "gaming", "community"],
    usageCount: 4890,
    documentation: "https://discord.com/developers/docs/intro",
    requiredEnv: ["DISCORD_BOT_TOKEN"],
    exampleCommands: [
      { command: 'send_message {"channel_id": "123456789", "content": "Hello from MCPilot!"}', description: "Send a message" },
      { command: 'get_messages {"channel_id": "123456789", "limit": 20}', description: "Get channel messages" },
      { command: 'list_channels {"guild_id": "987654321"}', description: "List server channels" },
    ],
    tools: [
      {
        name: "send_message",
        description: "Send a message to a channel",
        inputSchema: {
          type: "object",
          properties: {
            channel_id: { type: "string", description: "Channel ID" },
            content: { type: "string", description: "Message content" },
          },
          required: ["channel_id", "content"],
        },
      },
      {
        name: "get_messages",
        description: "Get messages from a channel",
        inputSchema: {
          type: "object",
          properties: {
            channel_id: { type: "string", description: "Channel ID" },
            limit: { type: "number", description: "Number of messages" },
          },
          required: ["channel_id"],
        },
      },
      {
        name: "list_channels",
        description: "List channels in a server",
        inputSchema: {
          type: "object",
          properties: {
            guild_id: { type: "string", description: "Server ID" },
          },
          required: ["guild_id"],
        },
      },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    slug: "twilio",
    description: "Send SMS, make calls, and manage communications with Twilio.",
    category: "communication",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/twilio-mcp-server",
    connectionType: "stdio",
    command: "npx -y twilio-mcp-server",
    icon: "📱",
    tags: ["twilio", "sms", "voice", "communication"],
    usageCount: 3450,
    tools: [
      {
        name: "send_sms",
        description: "Send an SMS message",
        inputSchema: {
          type: "object",
          properties: {
            to: { type: "string", description: "Recipient phone number" },
            body: { type: "string", description: "Message content" },
          },
          required: ["to", "body"],
        },
      },
      {
        name: "make_call",
        description: "Initiate a phone call",
        inputSchema: {
          type: "object",
          properties: {
            to: { type: "string", description: "Phone number to call" },
            twiml: { type: "string", description: "TwiML instructions" },
          },
          required: ["to", "twiml"],
        },
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    slug: "stripe",
    description: "Process payments and manage Stripe resources.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/stripe-mcp-server",
    connectionType: "stdio",
    command: "npx -y stripe-mcp-server",
    icon: "💳",
    tags: ["stripe", "payments", "billing", "subscriptions"],
    usageCount: 5670,
    documentation: "https://stripe.com/docs/api",
    requiredEnv: ["STRIPE_SECRET_KEY"],
    exampleCommands: [
      { command: 'list_customers {"limit": 10}', description: "List customers" },
      { command: 'create_customer {"email": "john@example.com", "name": "John Doe"}', description: "Create customer" },
      { command: 'create_payment_intent {"amount": 2000, "currency": "usd"}', description: "Create $20 payment intent" },
      { command: 'list_invoices {"customer": "cus_xxx"}', description: "List customer invoices" },
      { command: 'list_products {}', description: "List all products" },
    ],
    tools: [
      {
        name: "list_customers",
        description: "List Stripe customers",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum customers" },
          },
        },
      },
      {
        name: "create_customer",
        description: "Create a new customer",
        inputSchema: {
          type: "object",
          properties: {
            email: { type: "string", description: "Customer email" },
            name: { type: "string", description: "Customer name" },
          },
          required: ["email"],
        },
      },
      {
        name: "create_payment_intent",
        description: "Create a payment intent",
        inputSchema: {
          type: "object",
          properties: {
            amount: { type: "number", description: "Amount in cents" },
            currency: { type: "string", description: "Currency code" },
            customer: { type: "string", description: "Customer ID" },
          },
          required: ["amount", "currency"],
        },
      },
      {
        name: "list_invoices",
        description: "List invoices",
        inputSchema: {
          type: "object",
          properties: {
            customer: { type: "string", description: "Customer ID" },
          },
        },
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    slug: "shopify",
    description: "Manage Shopify stores, products, and orders.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/shopify-mcp-server",
    connectionType: "stdio",
    command: "npx -y shopify-mcp-server",
    icon: "🛒",
    tags: ["shopify", "ecommerce", "products", "orders"],
    usageCount: 4120,
    tools: [
      {
        name: "list_products",
        description: "List store products",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum products" },
          },
        },
      },
      {
        name: "get_product",
        description: "Get product details",
        inputSchema: {
          type: "object",
          properties: {
            product_id: { type: "string", description: "Product ID" },
          },
          required: ["product_id"],
        },
      },
      {
        name: "list_orders",
        description: "List store orders",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", description: "Order status" },
            limit: { type: "number", description: "Maximum orders" },
          },
        },
      },
      {
        name: "update_inventory",
        description: "Update product inventory",
        inputSchema: {
          type: "object",
          properties: {
            inventory_item_id: { type: "string", description: "Inventory item ID" },
            available: { type: "number", description: "Available quantity" },
          },
          required: ["inventory_item_id", "available"],
        },
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    slug: "youtube",
    description: "Search and manage YouTube videos and channels.",
    category: "media",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/youtube-mcp-server",
    connectionType: "stdio",
    command: "npx -y youtube-mcp-server",
    icon: "📺",
    tags: ["youtube", "video", "media", "streaming"],
    usageCount: 3890,
    tools: [
      {
        name: "search_videos",
        description: "Search for YouTube videos",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            maxResults: { type: "number", description: "Maximum results" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_video",
        description: "Get video details",
        inputSchema: {
          type: "object",
          properties: {
            video_id: { type: "string", description: "Video ID" },
          },
          required: ["video_id"],
        },
      },
      {
        name: "get_transcript",
        description: "Get video transcript/captions",
        inputSchema: {
          type: "object",
          properties: {
            video_id: { type: "string", description: "Video ID" },
            language: { type: "string", description: "Language code" },
          },
          required: ["video_id"],
        },
      },
    ],
  },
  {
    id: "airtable",
    name: "Airtable",
    slug: "airtable",
    description: "Query and manage Airtable bases and records.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/airtable-mcp-server",
    connectionType: "stdio",
    command: "npx -y airtable-mcp-server",
    icon: "📋",
    tags: ["airtable", "spreadsheet", "database", "productivity"],
    usageCount: 3560,
    tools: [
      {
        name: "list_records",
        description: "List records from a table",
        inputSchema: {
          type: "object",
          properties: {
            baseId: { type: "string", description: "Base ID" },
            tableId: { type: "string", description: "Table ID" },
            maxRecords: { type: "number", description: "Maximum records" },
            filterByFormula: { type: "string", description: "Filter formula" },
          },
          required: ["baseId", "tableId"],
        },
      },
      {
        name: "create_record",
        description: "Create a new record",
        inputSchema: {
          type: "object",
          properties: {
            baseId: { type: "string", description: "Base ID" },
            tableId: { type: "string", description: "Table ID" },
            fields: { type: "object", description: "Record fields" },
          },
          required: ["baseId", "tableId", "fields"],
        },
      },
      {
        name: "update_record",
        description: "Update a record",
        inputSchema: {
          type: "object",
          properties: {
            baseId: { type: "string", description: "Base ID" },
            tableId: { type: "string", description: "Table ID" },
            recordId: { type: "string", description: "Record ID" },
            fields: { type: "object", description: "Fields to update" },
          },
          required: ["baseId", "tableId", "recordId", "fields"],
        },
      },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    slug: "figma",
    description: "Access Figma designs, components, and comments.",
    category: "development",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/figma-mcp-server",
    connectionType: "stdio",
    command: "npx -y figma-mcp-server",
    icon: "🎨",
    tags: ["figma", "design", "ui", "components"],
    usageCount: 4230,
    tools: [
      {
        name: "get_file",
        description: "Get a Figma file",
        inputSchema: {
          type: "object",
          properties: {
            file_key: { type: "string", description: "File key" },
          },
          required: ["file_key"],
        },
      },
      {
        name: "get_components",
        description: "Get file components",
        inputSchema: {
          type: "object",
          properties: {
            file_key: { type: "string", description: "File key" },
          },
          required: ["file_key"],
        },
      },
      {
        name: "get_comments",
        description: "Get file comments",
        inputSchema: {
          type: "object",
          properties: {
            file_key: { type: "string", description: "File key" },
          },
          required: ["file_key"],
        },
      },
      {
        name: "export_images",
        description: "Export nodes as images",
        inputSchema: {
          type: "object",
          properties: {
            file_key: { type: "string", description: "File key" },
            node_ids: { type: "array", description: "Node IDs to export" },
            format: { type: "string", description: "Image format (png, jpg, svg, pdf)" },
          },
          required: ["file_key", "node_ids"],
        },
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    slug: "vercel",
    description: "Manage Vercel deployments and projects.",
    category: "devops",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/vercel-mcp-server",
    connectionType: "stdio",
    command: "npx -y vercel-mcp-server",
    icon: "▲",
    tags: ["vercel", "deployment", "hosting", "serverless"],
    usageCount: 3780,
    tools: [
      {
        name: "list_projects",
        description: "List Vercel projects",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_deployments",
        description: "List deployments",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            limit: { type: "number", description: "Maximum deployments" },
          },
        },
      },
      {
        name: "get_deployment_logs",
        description: "Get deployment logs",
        inputSchema: {
          type: "object",
          properties: {
            deploymentId: { type: "string", description: "Deployment ID" },
          },
          required: ["deploymentId"],
        },
      },
      {
        name: "set_env_variable",
        description: "Set environment variable",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            key: { type: "string", description: "Variable name" },
            value: { type: "string", description: "Variable value" },
            target: { type: "array", description: "Environments (production, preview, development)" },
          },
          required: ["projectId", "key", "value"],
        },
      },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    slug: "cloudflare",
    description: "Manage Cloudflare DNS, Workers, and security settings.",
    category: "devops",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/cloudflare-mcp-server",
    connectionType: "stdio",
    command: "npx -y cloudflare-mcp-server",
    icon: "🔶",
    tags: ["cloudflare", "dns", "cdn", "workers"],
    usageCount: 3450,
    tools: [
      {
        name: "list_zones",
        description: "List DNS zones",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_dns_records",
        description: "List DNS records for a zone",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: { type: "string", description: "Zone ID" },
          },
          required: ["zone_id"],
        },
      },
      {
        name: "create_dns_record",
        description: "Create a DNS record",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: { type: "string", description: "Zone ID" },
            type: { type: "string", description: "Record type (A, AAAA, CNAME, etc.)" },
            name: { type: "string", description: "Record name" },
            content: { type: "string", description: "Record content" },
          },
          required: ["zone_id", "type", "name", "content"],
        },
      },
      {
        name: "purge_cache",
        description: "Purge cache for a zone",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: { type: "string", description: "Zone ID" },
            purge_everything: { type: "boolean", description: "Purge all cached content" },
          },
          required: ["zone_id"],
        },
      },
    ],
  },
  {
    id: "time",
    name: "Time",
    slug: "time",
    description: "Get current time in different timezones and time conversions.",
    category: "productivity",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-time",
    icon: "🕐",
    tags: ["time", "timezone", "conversion", "official"],
    usageCount: 3210,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
    exampleCommands: [
      { command: 'get_current_time {"timezone": "America/New_York"}', description: "Get time in New York" },
      { command: 'get_current_time {"timezone": "Asia/Tokyo"}', description: "Get time in Tokyo" },
      { command: 'get_current_time {}', description: "Get local time" },
      { command: 'convert_time {"time": "2026-01-15T10:00:00", "from_timezone": "America/Los_Angeles", "to_timezone": "Europe/London"}', description: "Convert timezone" },
    ],
    tools: [
      {
        name: "get_current_time",
        description: "Get current time in a timezone",
        inputSchema: {
          type: "object",
          properties: {
            timezone: { type: "string", description: "Timezone (e.g., America/New_York)" },
          },
        },
      },
      {
        name: "convert_time",
        description: "Convert time between timezones",
        inputSchema: {
          type: "object",
          properties: {
            time: { type: "string", description: "Time to convert" },
            from_timezone: { type: "string", description: "Source timezone" },
            to_timezone: { type: "string", description: "Target timezone" },
          },
          required: ["time", "from_timezone", "to_timezone"],
        },
      },
    ],
  },
  {
    id: "everything",
    name: "Everything",
    slug: "everything",
    description: "Reference server demonstrating all MCP capabilities.",
    category: "development",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-everything",
    icon: "✨",
    tags: ["demo", "reference", "testing", "official"],
    usageCount: 2890,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/everything",
    exampleCommands: [
      { command: 'echo {"message": "Hello, MCP!"}', description: "Echo a message" },
      { command: 'add {"a": 42, "b": 58}', description: "Add two numbers" },
      { command: 'longRunningOperation {"duration": 3}', description: "Test progress notifications" },
    ],
    tools: [
      {
        name: "echo",
        description: "Echo back the input",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "Message to echo" },
          },
          required: ["message"],
        },
      },
      {
        name: "add",
        description: "Add two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "longRunningOperation",
        description: "A tool that demonstrates progress notifications",
        inputSchema: {
          type: "object",
          properties: {
            duration: { type: "number", description: "Duration in seconds" },
          },
          required: ["duration"],
        },
      },
    ],
  },
  // === ADDITIONAL SERVERS FROM POSTMAN COLLECTION ===
  {
    id: "git",
    name: "Git",
    slug: "git",
    description: "Local Git repository operations including status, diff, log, commit, and branch management.",
    category: "development",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-git /path/to/repo",
    icon: "📚",
    tags: ["git", "version-control", "repository", "official"],
    usageCount: 8500,
    documentation: "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    exampleCommands: [
      { command: 'git_status {}', description: "Check repository status" },
      { command: 'git_log {"max_count": 10}', description: "View recent commits" },
      { command: 'git_diff {}', description: "Show uncommitted changes" },
      { command: 'git_branch {}', description: "List branches" },
    ],
    setupGuide: {
      steps: [
        { title: "Navigate to Repository", description: "Open a terminal in your git repository" },
        { title: "No Config Needed", description: "The Git MCP server works with local repositories" },
        { title: "Run Commands", description: "Use git_status, git_log, git_diff to inspect your repo" },
      ],
      mockModeNote: "Mock mode returns sample git data for a fictional repository.",
      realModeNote: "Real mode operates on your actual git repository. Commit operations will modify your repo.",
    },
    tools: [
      {
        name: "git_status",
        description: "Get the current status of the repository",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "git_log",
        description: "Get commit history",
        inputSchema: {
          type: "object",
          properties: {
            max_count: { type: "number", description: "Maximum number of commits" },
          },
        },
      },
      {
        name: "git_diff",
        description: "Show changes between commits or working tree",
        inputSchema: {
          type: "object",
          properties: {
            target: { type: "string", description: "Target commit or branch" },
          },
        },
      },
      {
        name: "git_commit",
        description: "Create a new commit",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "Commit message" },
          },
          required: ["message"],
        },
      },
      {
        name: "git_branch",
        description: "List or create branches",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "New branch name (optional)" },
          },
        },
      },
    ],
  },
  {
    id: "exa",
    name: "Exa Search",
    slug: "exa",
    description: "AI-powered web search with semantic understanding. Search by meaning, not just keywords.",
    category: "web",
    author: "Exa",
    version: "1.0.0",
    repository: "https://github.com/exa-labs/exa-mcp-server",
    connectionType: "stdio",
    command: "npx -y @exa/mcp-server",
    icon: "🔍",
    tags: ["search", "ai", "semantic", "web"],
    usageCount: 5600,
    documentation: "https://docs.exa.ai",
    requiredEnv: ["EXA_API_KEY"],
    exampleCommands: [
      { command: 'search {"query": "best practices for React performance optimization"}', description: "Semantic search" },
      { command: 'find_similar {"url": "https://example.com/article"}', description: "Find similar pages" },
      { command: 'search {"query": "AI news", "num_results": 5}', description: "Limited results" },
    ],
    setupGuide: {
      steps: [
        { title: "Get API Key", description: "Sign up at exa.ai and get your API key" },
        { title: "Set Environment", description: "Add to your environment", code: "export EXA_API_KEY=your_key_here" },
      ],
      mockModeNote: "Mock mode returns sample search results without API calls.",
      realModeNote: "Real mode uses Exa's AI-powered search. API credits apply.",
    },
    tools: [
      {
        name: "search",
        description: "Search the web with AI understanding",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            num_results: { type: "number", description: "Number of results", default: 10 },
          },
          required: ["query"],
        },
      },
      {
        name: "find_similar",
        description: "Find pages similar to a given URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to find similar content" },
          },
          required: ["url"],
        },
      },
    ],
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    slug: "sequential-thinking",
    description: "A tool for dynamic, reflective problem-solving through thought sequences.",
    category: "ai",
    author: "Anthropic",
    version: "1.0.0",
    repository: "https://github.com/modelcontextprotocol/servers",
    connectionType: "stdio",
    command: "npx -y @modelcontextprotocol/server-sequential-thinking",
    icon: "🧠",
    tags: ["thinking", "reasoning", "ai", "problem-solving"],
    usageCount: 4200,
    exampleCommands: [
      { command: 'think {"thought": "Let me analyze this problem step by step..."}', description: "Start a thought chain" },
    ],
    tools: [
      {
        name: "think",
        description: "Record a thought in a problem-solving sequence",
        inputSchema: {
          type: "object",
          properties: {
            thought: { type: "string", description: "The thought to record" },
            next_action: { type: "string", description: "What to do next" },
          },
          required: ["thought"],
        },
      },
    ],
  },
  {
    id: "gitlab",
    name: "GitLab",
    slug: "gitlab",
    description: "Interact with GitLab repositories, issues, merge requests, and pipelines.",
    category: "development",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/gitlab-mcp-server",
    connectionType: "stdio",
    command: "npx -y gitlab-mcp-server",
    icon: "🦊",
    tags: ["gitlab", "git", "ci-cd", "devops"],
    usageCount: 4800,
    requiredEnv: ["GITLAB_TOKEN"],
    documentation: "https://docs.gitlab.com/ee/api/",
    exampleCommands: [
      { command: 'list_projects {"owned": true}', description: "List your projects" },
      { command: 'get_project {"project_id": "123"}', description: "Get project details" },
      { command: 'list_merge_requests {"state": "opened"}', description: "List open MRs" },
    ],
    setupGuide: {
      steps: [
        { title: "Create Token", description: "Go to GitLab Settings → Access Tokens → Create new token with api scope" },
        { title: "Set Environment", description: "Add to your environment", code: "export GITLAB_TOKEN=glpat-your-token" },
      ],
      mockModeNote: "Mock mode returns sample GitLab project and MR data.",
      realModeNote: "Real mode accesses your GitLab instance. Ensure proper permissions.",
    },
    tools: [
      {
        name: "list_projects",
        description: "List GitLab projects",
        inputSchema: {
          type: "object",
          properties: {
            owned: { type: "boolean", description: "Only owned projects" },
            search: { type: "string", description: "Search query" },
          },
        },
      },
      {
        name: "get_project",
        description: "Get project details",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID or path" },
          },
          required: ["project_id"],
        },
      },
      {
        name: "list_merge_requests",
        description: "List merge requests",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID" },
            state: { type: "string", description: "MR state (opened, closed, merged)" },
          },
        },
      },
      {
        name: "list_pipelines",
        description: "List CI/CD pipelines",
        inputSchema: {
          type: "object",
          properties: {
            project_id: { type: "string", description: "Project ID" },
          },
          required: ["project_id"],
        },
      },
    ],
  },
  {
    id: "playwright",
    name: "Playwright",
    slug: "playwright",
    description: "Browser automation with Playwright for testing and web scraping.",
    category: "web",
    author: "Microsoft",
    version: "1.0.0",
    repository: "https://github.com/executeautomation/mcp-playwright",
    connectionType: "stdio",
    command: "npx -y @executeautomation/playwright-mcp-server",
    icon: "🎭",
    tags: ["browser", "testing", "automation", "scraping"],
    usageCount: 5100,
    documentation: "https://playwright.dev/docs/intro",
    exampleCommands: [
      { command: 'navigate {"url": "https://example.com"}', description: "Navigate to URL" },
      { command: 'screenshot {"name": "page"}', description: "Take screenshot" },
      { command: 'click {"selector": "button.submit"}', description: "Click element" },
    ],
    tools: [
      {
        name: "navigate",
        description: "Navigate to a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to navigate to" },
          },
          required: ["url"],
        },
      },
      {
        name: "screenshot",
        description: "Take a screenshot",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Screenshot name" },
            full_page: { type: "boolean", description: "Capture full page" },
          },
          required: ["name"],
        },
      },
      {
        name: "click",
        description: "Click an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector" },
          },
          required: ["selector"],
        },
      },
      {
        name: "fill",
        description: "Fill an input field",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector" },
            value: { type: "string", description: "Value to fill" },
          },
          required: ["selector", "value"],
        },
      },
      {
        name: "get_text",
        description: "Get text content of an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string", description: "CSS selector" },
          },
          required: ["selector"],
        },
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    slug: "gmail",
    description: "Read, send, and manage emails through Gmail API.",
    category: "communication",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/gmail-mcp-server",
    connectionType: "stdio",
    command: "npx -y gmail-mcp-server",
    icon: "📧",
    tags: ["email", "gmail", "google", "communication"],
    usageCount: 4500,
    requiredEnv: ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"],
    documentation: "https://developers.google.com/gmail/api",
    exampleCommands: [
      { command: 'list_messages {"max_results": 10}', description: "List recent emails" },
      { command: 'send_email {"to": "user@example.com", "subject": "Hello", "body": "Hi there!"}', description: "Send email" },
      { command: 'search_messages {"query": "from:boss@company.com"}', description: "Search emails" },
    ],
    setupGuide: {
      steps: [
        { title: "Create Google Cloud Project", description: "Go to console.cloud.google.com and create a project" },
        { title: "Enable Gmail API", description: "Enable the Gmail API in your project" },
        { title: "Create OAuth Credentials", description: "Create OAuth 2.0 credentials and download JSON" },
        { title: "Set Environment", description: "Configure credentials", code: "export GMAIL_CLIENT_ID=your_client_id\nexport GMAIL_CLIENT_SECRET=your_secret" },
      ],
      mockModeNote: "Mock mode returns sample email data without accessing Gmail.",
      realModeNote: "Real mode accesses your Gmail account. Be careful with send operations!",
    },
    tools: [
      {
        name: "list_messages",
        description: "List messages in inbox",
        inputSchema: {
          type: "object",
          properties: {
            max_results: { type: "number", description: "Maximum messages to return" },
            label: { type: "string", description: "Label to filter by" },
          },
        },
      },
      {
        name: "send_email",
        description: "Send an email",
        inputSchema: {
          type: "object",
          properties: {
            to: { type: "string", description: "Recipient email" },
            subject: { type: "string", description: "Email subject" },
            body: { type: "string", description: "Email body" },
          },
          required: ["to", "subject", "body"],
        },
      },
      {
        name: "search_messages",
        description: "Search for messages",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
    ],
  },
  {
    id: "azure",
    name: "Azure",
    slug: "azure",
    description: "Manage Microsoft Azure cloud resources including VMs, storage, and services.",
    category: "cloud",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/azure-mcp-server",
    connectionType: "stdio",
    command: "npx -y azure-mcp-server",
    icon: "☁️",
    tags: ["azure", "microsoft", "cloud", "devops"],
    usageCount: 4200,
    requiredEnv: ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID"],
    documentation: "https://docs.microsoft.com/azure/",
    exampleCommands: [
      { command: 'list_resource_groups {}', description: "List resource groups" },
      { command: 'list_vms {"resource_group": "my-rg"}', description: "List VMs in a group" },
    ],
    setupGuide: {
      steps: [
        { title: "Create Service Principal", description: "Use Azure CLI: az ad sp create-for-rbac" },
        { title: "Set Environment Variables", description: "Configure Azure credentials", code: "export AZURE_CLIENT_ID=...\nexport AZURE_CLIENT_SECRET=...\nexport AZURE_TENANT_ID=..." },
      ],
      mockModeNote: "Mock mode returns sample Azure resource data.",
      realModeNote: "Real mode manages your Azure resources. Use with caution!",
    },
    tools: [
      {
        name: "list_resource_groups",
        description: "List Azure resource groups",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "list_vms",
        description: "List virtual machines",
        inputSchema: {
          type: "object",
          properties: {
            resource_group: { type: "string", description: "Resource group name" },
          },
        },
      },
      {
        name: "list_storage_accounts",
        description: "List storage accounts",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  },
  {
    id: "confluence",
    name: "Confluence",
    slug: "confluence",
    description: "Access and manage Atlassian Confluence pages and spaces.",
    category: "productivity",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/confluence-mcp-server",
    connectionType: "stdio",
    command: "npx -y confluence-mcp-server",
    icon: "📖",
    tags: ["confluence", "atlassian", "wiki", "documentation"],
    usageCount: 3800,
    requiredEnv: ["CONFLUENCE_URL", "CONFLUENCE_TOKEN"],
    documentation: "https://developer.atlassian.com/cloud/confluence/rest/",
    exampleCommands: [
      { command: 'search_pages {"query": "project documentation"}', description: "Search pages" },
      { command: 'get_page {"page_id": "123456"}', description: "Get page content" },
      { command: 'list_spaces {}', description: "List all spaces" },
    ],
    tools: [
      {
        name: "search_pages",
        description: "Search Confluence pages",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_page",
        description: "Get page content",
        inputSchema: {
          type: "object",
          properties: {
            page_id: { type: "string", description: "Page ID" },
          },
          required: ["page_id"],
        },
      },
      {
        name: "create_page",
        description: "Create a new page",
        inputSchema: {
          type: "object",
          properties: {
            space_key: { type: "string", description: "Space key" },
            title: { type: "string", description: "Page title" },
            content: { type: "string", description: "Page content (HTML)" },
          },
          required: ["space_key", "title", "content"],
        },
      },
      {
        name: "list_spaces",
        description: "List Confluence spaces",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    slug: "elasticsearch",
    description: "Search and analyze data in Elasticsearch clusters.",
    category: "database",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/elasticsearch-mcp-server",
    connectionType: "stdio",
    command: "npx -y elasticsearch-mcp-server",
    icon: "🔎",
    tags: ["elasticsearch", "search", "analytics", "database"],
    usageCount: 4100,
    requiredEnv: ["ELASTICSEARCH_URL"],
    documentation: "https://www.elastic.co/guide/en/elasticsearch/reference/current/",
    exampleCommands: [
      { command: 'search {"index": "logs", "query": {"match_all": {}}}', description: "Search logs" },
      { command: 'list_indices {}', description: "List all indices" },
    ],
    tools: [
      {
        name: "search",
        description: "Search documents",
        inputSchema: {
          type: "object",
          properties: {
            index: { type: "string", description: "Index name" },
            query: { type: "object", description: "Elasticsearch query" },
          },
          required: ["index", "query"],
        },
      },
      {
        name: "list_indices",
        description: "List all indices",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_document",
        description: "Get a document by ID",
        inputSchema: {
          type: "object",
          properties: {
            index: { type: "string", description: "Index name" },
            id: { type: "string", description: "Document ID" },
          },
          required: ["index", "id"],
        },
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    slug: "supabase",
    description: "Interact with Supabase databases, authentication, and storage.",
    category: "database",
    author: "Community",
    version: "1.0.0",
    repository: "https://github.com/community/supabase-mcp-server",
    connectionType: "stdio",
    command: "npx -y supabase-mcp-server",
    icon: "⚡",
    tags: ["supabase", "postgres", "database", "auth"],
    usageCount: 5200,
    requiredEnv: ["SUPABASE_URL", "SUPABASE_KEY"],
    documentation: "https://supabase.com/docs",
    exampleCommands: [
      { command: 'query {"table": "users", "select": "*", "limit": 10}', description: "Query users table" },
      { command: 'insert {"table": "posts", "data": {"title": "Hello"}}', description: "Insert a record" },
    ],
    setupGuide: {
      steps: [
        { title: "Create Project", description: "Sign up at supabase.com and create a project" },
        { title: "Get API Keys", description: "Find your project URL and anon key in Settings → API" },
        { title: "Set Environment", description: "Configure credentials", code: "export SUPABASE_URL=https://xxx.supabase.co\nexport SUPABASE_KEY=your_anon_key" },
      ],
      mockModeNote: "Mock mode returns sample Supabase data.",
      realModeNote: "Real mode queries your actual Supabase database.",
    },
    tools: [
      {
        name: "query",
        description: "Query a table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string", description: "Table name" },
            select: { type: "string", description: "Columns to select" },
            filter: { type: "object", description: "Filter conditions" },
            limit: { type: "number", description: "Row limit" },
          },
          required: ["table"],
        },
      },
      {
        name: "insert",
        description: "Insert a record",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string", description: "Table name" },
            data: { type: "object", description: "Data to insert" },
          },
          required: ["table", "data"],
        },
      },
      {
        name: "list_tables",
        description: "List all tables",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  },
];

export function getHotPicks(): MCPServer[] {
  return MCP_SERVERS.filter(s => s.isHotPick).slice(0, 4);
}

export function searchServers(query: string): MCPServer[] {
  const lower = query.toLowerCase();
  return MCP_SERVERS.filter(
    s =>
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.tags.some(t => t.toLowerCase().includes(lower)) ||
      s.category.toLowerCase().includes(lower)
  );
}

export function getServerBySlug(slug: string): MCPServer | undefined {
  return MCP_SERVERS.find(s => s.slug === slug);
}

export function getServersByCategory(category: string): MCPServer[] {
  return MCP_SERVERS.filter(s => s.category === category);
}

export function getAllServers(): MCPServer[] {
  return MCP_SERVERS;
}
