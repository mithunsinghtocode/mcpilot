# MCPilot 🚀

**Swagger for MCP Servers** - A beautiful, interactive testing interface for Model Context Protocol (MCP) servers.

[![MCPilot](https://img.shields.io/badge/MCP-Pilot-blue?style=for-the-badge)](https://github.com/mithunsinghtocode/mcpilot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/mithunsinghtocode/mcpilot)

## 📸 Screenshots

### Main Interface
![Main Interface](./public/screenshots/main-interface.png)
*Chat interface with command palette and server browsing*

### API Documentation (Swagger-style)
![API Documentation](./public/screenshots/api-docs.png)
*Interactive API documentation with request/response examples*

### Server Panel - Try It
![Server Panel](./public/screenshots/server-panel.png)
*Test any MCP server tool with form or JSON input*

### Servers Modal
![Servers Modal](./public/screenshots/servers-modal.png)
*Browse 40+ MCP servers by category*

---

## ✨ Features

- **🎯 40+ MCP Servers** - Pre-configured servers including Filesystem, GitHub, OpenAI, Slack, and more
- **📋 Swagger-like API Documentation** - Interactive endpoint documentation with request/response examples
- **🧪 Mock Mode** - Test any server instantly without configuration
- **⚡ Real Mode** - Execute actual operations with proper credentials
- **💬 Chat Interface** - Claude Code-style `/` commands for quick navigation
- **🎨 Modern UI** - Built with shadcn/ui components

## 🌐 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mithunsinghtocode/mcpilot)

> Click the button above to deploy your own instance to Vercel in one click!

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mithunsinghtocode/mcpilot.git
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
| `/hot` | Show trending/popular servers |
| `/help` | Show help message |
| `/clear` | Clear chat history |

### Executing Tools

**Via Chat:**
```
read_file {"path": "/Users/demo/test.txt"}
```

**Via API Panel:**
1. Select a server from the list or type `/servername`
2. Go to the **API** tab to see all endpoints with examples
3. Click **Try it** on any endpoint
4. Fill in parameters and click **Execute**

### Mock vs Real Mode

| Mode | Description | Setup Required |
|------|-------------|----------------|
| 🧪 **Mock** (default) | Returns realistic sample data instantly | None |
| ⚡ **Real** | Executes actual operations | API keys needed |

## 🔧 Configuration

For Real mode, create a `.env.local` file:

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

## 🚀 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy MCPilot is using Vercel:

1. **One-Click Deploy:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mithunsinghtocode/mcpilot)

2. **Manual Deploy:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Via GitHub Integration:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Environment Variables (Vercel)

Add your API keys in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each key (e.g., `GITHUB_TOKEN`, `OPENAI_API_KEY`)
3. Redeploy for changes to take effect

### Other Platforms

| Platform | Support | Notes |
|----------|---------|-------|
| **Vercel** | ✅ Full | Recommended, zero-config |
| **Netlify** | ✅ Full | Use `@netlify/plugin-nextjs` |
| **Railway** | ✅ Full | Add build command: `npm run build` |
| **Docker** | ✅ Full | See Dockerfile below |
| **GitHub Pages** | ⚠️ Limited | Static export only (no API routes) |

<details>
<summary>📦 Docker Deployment</summary>

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t mcpilot .
docker run -p 3000:3000 mcpilot
```

</details>

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
│   └── screenshots/        # App screenshots
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

<p align="center">
  Built with ❤️ for the MCP community
  <br><br>
  <a href="https://github.com/mithunsinghtocode/mcpilot">⭐ Star on GitHub</a> •
  <a href="https://github.com/mithunsinghtocode/mcpilot/issues">🐛 Report Bug</a> •
  <a href="https://github.com/mithunsinghtocode/mcpilot/issues">✨ Request Feature</a>
</p>
