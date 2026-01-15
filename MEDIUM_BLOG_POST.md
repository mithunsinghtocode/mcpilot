# I Built Swagger for AI Tools — Meet MCPilot 🚀

*A weekend project that turned into something actually useful*

---

![MCPilot Main Interface](./public/screenshots/main-interface.png)

## The Problem I Was Trying to Solve

If you've been following the AI space, you've probably heard about **Model Context Protocol (MCP)** — the new open standard that lets AI assistants connect to external tools and data sources.

Think of MCP as the USB-C of AI integrations. One protocol to connect them all.

But here's the thing: **testing MCP servers is painful.**

Want to try out the GitHub MCP server? You need to:
1. Install the server
2. Configure your AI client
3. Set up authentication
4. Write the right prompts
5. Hope it works

What if you just want to *see* what an MCP server can do before committing to the setup?

That's exactly what I built **MCPilot** to solve.

---

## What is MCPilot?

**MCPilot is Swagger for MCP servers.**

If you've ever used Swagger (OpenAPI) to test REST APIs, you know how powerful it is to have an interactive interface where you can:
- Browse all available endpoints
- See request/response examples
- Test operations with one click
- No code required

MCPilot brings that same experience to MCP servers.

![API Documentation](./public/screenshots/api-docs.png)

---

## ✨ Key Features

### 🎯 40+ Pre-configured MCP Servers

From official servers like Filesystem, GitHub, and PostgreSQL to community favorites like OpenAI, Slack, and Notion — they're all ready to explore.

### 🧪 Mock Mode (Zero Config)

This is my favorite feature. **You don't need any API keys to start exploring.**

Mock mode returns realistic sample data for every operation. Want to see what the GitHub `search_repositories` endpoint returns? Click "Execute" and get a realistic response instantly.

### ⚡ Real Mode (When You're Ready)

Once you've explored with mock data, switch to Real mode, add your API keys, and execute actual operations.

### 💬 Chat Interface with `/` Commands

Inspired by Claude Code's interface, you can type `/` to quickly navigate:
- `/servers` — Browse all servers
- `/github` — Connect to GitHub MCP
- `/filesystem` — Connect to Filesystem MCP
- `/help` — Show available commands

### 📋 Swagger-Style Documentation

Every tool comes with:
- Clear descriptions
- Parameter specifications
- Example requests
- Example responses
- "Try it" button

![Server Panel](./public/screenshots/server-panel.png)

---

## 🚀 Step-by-Step Installation

### Prerequisites

- **Node.js 18+** (I recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **yarn**
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/mithunsinghtocode/mcpilot.git
cd mcpilot
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16
- React 19
- shadcn/ui components
- Tailwind CSS
- And more...

### Step 3: Start the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.1.2
- Local: http://localhost:3000
✓ Ready in 2.5s
```

### Step 4: Open in Browser

Navigate to **http://localhost:3000**

That's it! You're ready to explore MCP servers. 🎉

---

## 🎮 How to Use MCPilot

### Exploring Your First MCP Server

1. **Type `/filesystem` in the chat** or click on "Filesystem" from the sidebar
2. The **server panel** opens on the right
3. Click the **API** tab to see all available tools
4. Find `read_file` and click **"Try it"**
5. Fill in the path parameter (e.g., `/Users/demo/test.txt`)
6. Click **Execute**

In Mock mode, you'll get a realistic sample response. In Real mode, it reads the actual file!

### Switching Between Mock and Real Mode

At the top of the server panel, you'll see two buttons:
- **🧪 Mock** — Returns sample data (no config needed)
- **⚡ Real** — Executes actual operations (needs API keys)

### Setting Up Real Mode

For servers that need authentication:

1. Create a `.env.local` file in the project root:

```bash
touch .env.local
```

2. Add your API keys:

```env
# GitHub
GITHUB_TOKEN=ghp_your_token_here

# OpenAI
OPENAI_API_KEY=sk-your_key_here

# Slack
SLACK_BOT_TOKEN=xoxb-your_token_here

# Add more as needed...
```

3. Restart the dev server:

```bash
npm run dev
```

4. Switch to **Real** mode and execute!

---

## 🌐 Deploy Your Own Instance

### Option 1: Netlify (Free)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repo
5. Click "Deploy"

Your MCPilot will be live at `https://your-site.netlify.app`

### Option 2: Run with Docker

```bash
docker build -t mcpilot .
docker run -p 3000:3000 mcpilot
```

---

## 🛠️ Tech Stack

For the curious developers out there:

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **Zustand** | State management |
| **cmdk** | Command palette |

---

## What's Next?

I built MCPilot as a weekend project, but I'm excited about where it could go:

- [ ] **MCP Server marketplace** — Discover and install new servers
- [ ] **Request history** — Save and replay past executions
- [ ] **Collections** — Group related operations together
- [ ] **Team sharing** — Share configurations with your team
- [ ] **VS Code extension** — Test MCP servers without leaving your editor

---

## Try It Yourself

MCPilot is **100% open source** and free to use.

🔗 **GitHub:** [github.com/mithunsinghtocode/mcpilot](https://github.com/mithunsinghtocode/mcpilot)

Give it a ⭐ if you find it useful!

---

## Final Thoughts

The MCP ecosystem is growing rapidly. As more AI assistants adopt this protocol, having a universal testing tool becomes increasingly valuable.

Whether you're:
- **Evaluating** which MCP servers to integrate
- **Developing** your own MCP server
- **Debugging** why a tool isn't working
- **Learning** what's possible with MCP

MCPilot has you covered.

Happy testing! 🚀

---

*Built by [Mithun Singh](https://github.com/mithunsinghtocode)*

*Have questions or feedback? Open an issue on [GitHub](https://github.com/mithunsinghtocode/mcpilot/issues) or connect with me on [LinkedIn](https://linkedin.com/in/mithunsingh).*

---

**Tags:** #MCP #AI #OpenSource #DeveloperTools #NextJS #TypeScript #Swagger #APITesting
