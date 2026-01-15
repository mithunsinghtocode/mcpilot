const GITHUB_API = "https://api.github.com";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "MCPilot/1.0",
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
}

async function githubFetch(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers as Record<string, string> },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`GitHub API Error: ${error.message || response.statusText}`);
  }
  
  return response.json();
}

export async function handleGitHub(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "search_repositories": {
      const query = params.query as string;
      const page = (params.page as number) || 1;
      const perPage = Math.min((params.perPage as number) || 30, 100);
      
      if (!query) throw new Error("Query is required");
      
      const result = await githubFetch(
        `/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
      ) as { total_count: number; items: Array<{ full_name: string; description: string; stargazers_count: number; html_url: string; language: string }> };
      
      return {
        query,
        totalCount: result.total_count,
        page,
        perPage,
        results: result.items.map(item => ({
          fullName: item.full_name,
          description: item.description,
          stars: item.stargazers_count,
          url: item.html_url,
          language: item.language,
        })),
      };
    }

    case "get_file_contents": {
      const owner = params.owner as string;
      const repo = params.repo as string;
      const path = params.path as string;
      const branch = (params.branch as string) || "main";
      
      if (!owner) throw new Error("Owner is required");
      if (!repo) throw new Error("Repo is required");
      if (!path) throw new Error("Path is required");
      
      const result = await githubFetch(
        `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      ) as { content: string; encoding: string; name: string; size: number; sha: string };
      
      const content = result.encoding === "base64" 
        ? Buffer.from(result.content, "base64").toString("utf-8")
        : result.content;
      
      return {
        path,
        name: result.name,
        size: result.size,
        sha: result.sha,
        content,
      };
    }

    case "list_commits": {
      const owner = params.owner as string;
      const repo = params.repo as string;
      const sha = (params.sha as string) || "main";
      const page = (params.page as number) || 1;
      
      if (!owner) throw new Error("Owner is required");
      if (!repo) throw new Error("Repo is required");
      
      const result = await githubFetch(
        `/repos/${owner}/${repo}/commits?sha=${sha}&page=${page}&per_page=30`
      ) as Array<{ sha: string; commit: { message: string; author: { name: string; date: string } } }>;
      
      return {
        repository: `${owner}/${repo}`,
        branch: sha,
        commits: result.map(c => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author.name,
          date: c.commit.author.date,
        })),
      };
    }

    case "list_issues": {
      const owner = params.owner as string;
      const repo = params.repo as string;
      const state = (params.state as string) || "open";
      
      if (!owner) throw new Error("Owner is required");
      if (!repo) throw new Error("Repo is required");
      
      const result = await githubFetch(
        `/repos/${owner}/${repo}/issues?state=${state}&per_page=30`
      ) as Array<{ number: number; title: string; state: string; user: { login: string }; created_at: string; labels: Array<{ name: string }> }>;
      
      return {
        repository: `${owner}/${repo}`,
        state,
        issues: result.map(issue => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user.login,
          created: issue.created_at,
          labels: issue.labels.map(l => l.name),
        })),
      };
    }

    case "get_user": {
      const username = params.username as string;
      if (!username) throw new Error("Username is required");
      
      const user = await githubFetch(`/users/${username}`) as {
        login: string; name: string; bio: string; public_repos: number;
        followers: number; following: number; html_url: string;
      };
      
      return {
        username: user.login,
        name: user.name,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        url: user.html_url,
      };
    }

    case "get_repo": {
      const owner = params.owner as string;
      const repo = params.repo as string;
      
      if (!owner) throw new Error("Owner is required");
      if (!repo) throw new Error("Repo is required");
      
      const result = await githubFetch(`/repos/${owner}/${repo}`) as {
        full_name: string; description: string; stargazers_count: number;
        forks_count: number; open_issues_count: number; language: string;
        html_url: string; default_branch: string; created_at: string;
      };
      
      return {
        fullName: result.full_name,
        description: result.description,
        stars: result.stargazers_count,
        forks: result.forks_count,
        issues: result.open_issues_count,
        language: result.language,
        url: result.html_url,
        defaultBranch: result.default_branch,
        created: result.created_at,
      };
    }

    case "search_code": {
      const query = params.query as string;
      if (!query) throw new Error("Query is required");
      
      const result = await githubFetch(
        `/search/code?q=${encodeURIComponent(query)}&per_page=20`
      ) as { total_count: number; items: Array<{ name: string; path: string; repository: { full_name: string }; html_url: string }> };
      
      return {
        query,
        totalCount: result.total_count,
        results: result.items.map(item => ({
          name: item.name,
          path: item.path,
          repository: item.repository.full_name,
          url: item.html_url,
        })),
      };
    }

    default:
      throw new Error(`Unknown GitHub tool: ${toolName}`);
  }
}
