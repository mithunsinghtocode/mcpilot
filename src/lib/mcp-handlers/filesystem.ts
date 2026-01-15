import { promises as fs } from "fs";
import path from "path";

export async function handleFilesystem(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "read_file": {
      const filePath = params.path as string;
      if (!filePath) throw new Error("Path is required");
      
      const content = await fs.readFile(filePath, "utf-8");
      const stats = await fs.stat(filePath);
      return {
        content,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        path: filePath,
      };
    }

    case "read_multiple_files": {
      const paths = params.paths as string[];
      if (!paths || !Array.isArray(paths)) throw new Error("Paths array is required");
      
      const results = await Promise.all(
        paths.map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const stats = await fs.stat(filePath);
            return { path: filePath, content, size: stats.size, success: true };
          } catch (err: unknown) {
            return { path: filePath, error: (err as Error).message, success: false };
          }
        })
      );
      return results;
    }

    case "write_file": {
      const filePath = params.path as string;
      const content = params.content as string;
      if (!filePath) throw new Error("Path is required");
      if (content === undefined) throw new Error("Content is required");
      
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        bytesWritten: stats.size,
        timestamp: new Date().toISOString(),
      };
    }

    case "edit_file": {
      const filePath = params.path as string;
      const edits = params.edits as Array<{ oldText: string; newText: string }>;
      const dryRun = params.dryRun as boolean;
      
      if (!filePath) throw new Error("Path is required");
      if (!edits || !Array.isArray(edits)) throw new Error("Edits array is required");
      
      let content = await fs.readFile(filePath, "utf-8");
      const changes: Array<{ from: string; to: string; applied: boolean }> = [];
      
      for (const edit of edits) {
        if (content.includes(edit.oldText)) {
          content = content.replace(edit.oldText, edit.newText);
          changes.push({ from: edit.oldText, to: edit.newText, applied: true });
        } else {
          changes.push({ from: edit.oldText, to: edit.newText, applied: false });
        }
      }
      
      if (!dryRun) {
        await fs.writeFile(filePath, content, "utf-8");
      }
      
      return { path: filePath, dryRun: !!dryRun, changes, newContent: dryRun ? content : undefined };
    }

    case "create_directory": {
      const dirPath = params.path as string;
      if (!dirPath) throw new Error("Path is required");
      
      await fs.mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath, created: new Date().toISOString() };
    }

    case "list_directory": {
      const dirPath = params.path as string;
      if (!dirPath) throw new Error("Path is required");
      
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const results = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          try {
            const stats = await fs.stat(fullPath);
            return {
              name: entry.name,
              type: entry.isDirectory() ? "directory" : "file",
              size: entry.isFile() ? stats.size : undefined,
              modified: stats.mtime.toISOString(),
            };
          } catch {
            return { name: entry.name, type: entry.isDirectory() ? "directory" : "file" };
          }
        })
      );
      return { path: dirPath, entries: results, count: results.length };
    }

    case "move_file": {
      const source = params.source as string;
      const destination = params.destination as string;
      if (!source) throw new Error("Source path is required");
      if (!destination) throw new Error("Destination path is required");
      
      await fs.rename(source, destination);
      return { success: true, source, destination, timestamp: new Date().toISOString() };
    }

    case "search_files": {
      const searchPath = params.path as string;
      const pattern = params.pattern as string;
      if (!searchPath) throw new Error("Path is required");
      
      const results: string[] = [];
      
      async function searchDir(dir: string, depth = 0) {
        if (depth > 10) return; // Limit depth
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith(".")) {
              await searchDir(fullPath, depth + 1);
            } else if (!pattern || entry.name.includes(pattern) || 
                      new RegExp(pattern.replace(/\*/g, ".*")).test(entry.name)) {
              results.push(fullPath);
            }
          }
        } catch { /* Skip inaccessible directories */ }
      }
      
      await searchDir(searchPath);
      return { path: searchPath, pattern: pattern || "*", matches: results.slice(0, 100), count: results.length };
    }

    case "get_file_info": {
      const filePath = params.path as string;
      if (!filePath) throw new Error("Path is required");
      
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        name: path.basename(filePath),
        directory: path.dirname(filePath),
        extension: path.extname(filePath),
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
      };
    }

    case "list_allowed_directories": {
      const home = process.env.HOME || "/";
      return {
        directories: [
          home,
          path.join(home, "Documents"),
          path.join(home, "Downloads"),
          path.join(home, "Desktop"),
          "/tmp",
        ],
      };
    }

    default:
      throw new Error(`Unknown filesystem tool: ${toolName}`);
  }
}
