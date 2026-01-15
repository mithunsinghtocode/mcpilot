// "Everything" server - demonstrates various MCP capabilities

export async function handleEverything(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "echo": {
      const message = params.message as string;
      if (!message) throw new Error("Message is required");
      return {
        echoed: message,
        length: message.length,
        reversed: message.split("").reverse().join(""),
        uppercase: message.toUpperCase(),
        timestamp: new Date().toISOString(),
      };
    }

    case "add": {
      const a = params.a as number;
      const b = params.b as number;
      if (typeof a !== "number") throw new Error("Parameter 'a' must be a number");
      if (typeof b !== "number") throw new Error("Parameter 'b' must be a number");
      
      return {
        a,
        b,
        sum: a + b,
        difference: a - b,
        product: a * b,
        quotient: b !== 0 ? a / b : "undefined (division by zero)",
      };
    }

    case "longRunningOperation": {
      const duration = (params.duration as number) || 5;
      const steps = Math.min(duration, 10);
      const progress: string[] = [];
      
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        progress.push(`Step ${i}/${steps} completed`);
      }
      
      return {
        duration,
        steps,
        progress,
        completed: true,
        message: `Long running operation completed in ${duration} seconds (simulated)`,
      };
    }

    case "sampleLLM": {
      const prompt = params.prompt as string;
      if (!prompt) throw new Error("Prompt is required");
      
      // This would normally call an LLM, but we return a placeholder
      return {
        prompt,
        response: `This is a sample response to: "${prompt}". In a real MCP server, this would call an LLM.`,
        model: "sample",
        tokens: prompt.split(" ").length * 2,
      };
    }

    default:
      throw new Error(`Unknown everything tool: ${toolName}`);
  }
}
