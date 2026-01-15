import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJson(json: unknown): string {
  return JSON.stringify(json, null, 2);
}

export function highlightJson(json: string): string {
  return json
    .replace(/"([^"]+)":/g, '<span class="token-property">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="token-string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="token-number">$1</span>')
    .replace(/: (true|false|null)/g, ': <span class="token-keyword">$1</span>');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
