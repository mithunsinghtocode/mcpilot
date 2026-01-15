export async function handleTime(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "get_current_time": {
      const timezone = (params.timezone as string) || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        dateStyle: "full",
        timeStyle: "long",
      });
      
      return {
        timezone,
        datetime: now.toISOString(),
        formatted: formatter.format(now),
        unix: Math.floor(now.getTime() / 1000),
        offset: new Date().toLocaleString("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).split(" ").pop(),
      };
    }

    case "convert_time": {
      const time = params.time as string;
      const fromTimezone = params.from_timezone as string;
      const toTimezone = params.to_timezone as string;
      
      if (!time) throw new Error("Time is required");
      if (!fromTimezone) throw new Error("from_timezone is required");
      if (!toTimezone) throw new Error("to_timezone is required");
      
      const date = new Date(time);
      
      const fromFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: fromTimezone,
        dateStyle: "full",
        timeStyle: "long",
      });
      
      const toFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: toTimezone,
        dateStyle: "full",
        timeStyle: "long",
      });
      
      return {
        original: {
          time,
          timezone: fromTimezone,
          formatted: fromFormatter.format(date),
        },
        converted: {
          timezone: toTimezone,
          formatted: toFormatter.format(date),
          iso: date.toISOString(),
        },
      };
    }

    default:
      throw new Error(`Unknown time tool: ${toolName}`);
  }
}
