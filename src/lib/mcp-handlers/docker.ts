// Docker handler
// Requires Docker socket access

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runDocker(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`docker ${command}`);
    return stdout.trim();
  } catch (error) {
    const e = error as { stderr?: string; message: string };
    throw new Error(`Docker error: ${e.stderr || e.message}`);
  }
}

export async function handleDocker(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "list_containers": {
      const all = params.all as boolean;
      const format = '{{json .}}';
      
      try {
        const output = await runDocker(`ps ${all ? "-a" : ""} --format "${format}"`);
        const containers = output.split("\n").filter(Boolean).map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        return {
          containers: containers.map((c: { ID: string; Names: string; Image: string; Status: string; Ports: string }) => ({
            id: c.ID,
            name: c.Names,
            image: c.Image,
            status: c.Status,
            ports: c.Ports,
          })),
          count: containers.length,
        };
      } catch (e) {
        return {
          error: (e as Error).message,
          note: "Make sure Docker is installed and running",
        };
      }
    }

    case "start_container": {
      const container = params.container as string;
      if (!container) throw new Error("Container ID or name is required");
      
      try {
        await runDocker(`start ${container}`);
        return { success: true, container, action: "started" };
      } catch (e) {
        return { error: (e as Error).message, container };
      }
    }

    case "stop_container": {
      const container = params.container as string;
      if (!container) throw new Error("Container ID or name is required");
      
      try {
        await runDocker(`stop ${container}`);
        return { success: true, container, action: "stopped" };
      } catch (e) {
        return { error: (e as Error).message, container };
      }
    }

    case "container_logs": {
      const container = params.container as string;
      const tail = (params.tail as number) || 50;
      
      if (!container) throw new Error("Container ID or name is required");
      
      try {
        const logs = await runDocker(`logs --tail ${tail} ${container}`);
        return {
          container,
          logs: logs.split("\n"),
          lines: tail,
        };
      } catch (e) {
        return { error: (e as Error).message, container };
      }
    }

    case "list_images": {
      try {
        const output = await runDocker('images --format "{{json .}}"');
        const images = output.split("\n").filter(Boolean).map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        return {
          images: images.map((img: { Repository: string; Tag: string; ID: string; Size: string }) => ({
            repository: img.Repository,
            tag: img.Tag,
            id: img.ID,
            size: img.Size,
          })),
          count: images.length,
        };
      } catch (e) {
        return { error: (e as Error).message };
      }
    }

    case "run_container": {
      const image = params.image as string;
      const name = params.name as string;
      const detach = params.detach !== false;
      
      if (!image) throw new Error("Image is required");
      
      try {
        const nameFlag = name ? `--name ${name}` : "";
        const detachFlag = detach ? "-d" : "";
        const output = await runDocker(`run ${detachFlag} ${nameFlag} ${image}`);
        
        return {
          success: true,
          containerId: output.substring(0, 12),
          image,
          name: name || "auto-generated",
        };
      } catch (e) {
        return { error: (e as Error).message, image };
      }
    }

    case "inspect_container": {
      const container = params.container as string;
      if (!container) throw new Error("Container ID or name is required");
      
      try {
        const output = await runDocker(`inspect ${container}`);
        const info = JSON.parse(output)[0];
        
        return {
          id: info.Id,
          name: info.Name,
          state: info.State,
          config: {
            image: info.Config.Image,
            env: info.Config.Env?.slice(0, 5),
            cmd: info.Config.Cmd,
          },
          networkSettings: {
            ipAddress: info.NetworkSettings.IPAddress,
            ports: info.NetworkSettings.Ports,
          },
        };
      } catch (e) {
        return { error: (e as Error).message, container };
      }
    }

    default:
      throw new Error(`Unknown Docker tool: ${toolName}`);
  }
}
