# MCPilot 🚀

**Swagger for MCP Servers** - A beautiful, interactive testing interface for Model Context Protocol (MCP) servers.

![MCPilot](https://img.shields.io/badge/MCP-Pilot-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)

## ✨ Features

- **🎯 40+ MCP Servers** - Pre-configured servers including Filesystem, GitHub, OpenAI, Slack, and more
- **📋 Swagger-like API Documentation** - Interactive endpoint documentation with request/response examples
- **🧪 Mock Mode** - Test any server instantly without configuration
- **⚡ Real Mode** - Execute actual operations with proper credentials
- **💬 Chat Interface** - Claude Code-style `/` commands for quick navigation
- **🎨 Modern UI** - Built with shadcn/ui components

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/mcpilot.git
cd mcpilot

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Chat Commands

| Command | Description |
|---------|-------------|
| `/servers` | Browse all available MCP servers |
| `/filesystem` | Connect to Filesystem server |
| `/github` | Connect to GitHub server |
| `/openai` | Connect to OpenAI server |
| `/help` | Show help message |
| `/clear` | Clear chat history |

### Executing Tools

**Via Chat:**
```
read_file {"path": "/Users/demo/test.txt"}
```

**Via API Panel:**
1. Select a server from the list
2. Go to the **API** tab to see all endpoints with examples
3. Click **Try it** on any endpoint
4. Fill in parameters and click **Execute**

### Mock vs Real Mode

- **🧪 Mock Mode** (default): Returns realistic sample data instantly. No configuration needed.
- **⚡ Real Mode**: Executes actual operations. May require API keys.

## 🔧 Configuration

For Real mode, set environment variables in `.env.local`:

```env
# GitHub
GITHUB_TOKEN=ghp_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_xxxxx

# And more...
```

## 📦 Supported MCP Servers

### Official (Anthropic)
- Filesystem, GitHub, PostgreSQL, SQLite
- Brave Search, Memory, Puppeteer
- Slack, Google Drive, Fetch, Time

### Community
- OpenAI, Anthropic, Discord, Stripe
- Docker, Kubernetes, AWS, Azure
- MongoDB, Redis, Elasticsearch
- Notion, Linear, Jira, Confluence
- And many more...

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State**: Zustand
- **Commands**: cmdk

## 📁 Project Structure

```
mcpilot/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/mcp/        # MCP execution API
│   │   └── page.tsx        # Main chat interface
│   ├── components/
│   │   ├── chat/           # Chat components
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       ├── mcp-handlers/   # Real & mock handlers
│       └── mcp-servers.ts  # Server definitions
├── public/
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Postman MCP Collection](https://www.postman.com/explore/mcp-servers) for server references

---

Built with ❤️ for the MCP community
