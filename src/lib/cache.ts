import { type PaperData } from "@/routes/index";

const CACHE_VERSION = "v1";

function cacheKey(namespace: string): string {
  return `papertrail-cache-${CACHE_VERSION}-${namespace}`;
}

export function getCachedPaper(namespace: string): PaperData | null {
  try {
    const raw = localStorage.getItem(cacheKey(namespace));
    if (!raw) return null;
    return JSON.parse(raw) as PaperData;
  } catch {
    return null;
  }
}

export function setCachedPaper(namespace: string, data: PaperData): void {
  try {
    localStorage.setItem(cacheKey(namespace), JSON.stringify(data));
  } catch {
    // storage full — fail silently
  }
}

export function clearCachedPaper(namespace: string): void {
  try {
    localStorage.removeItem(cacheKey(namespace));
  } catch {}
}