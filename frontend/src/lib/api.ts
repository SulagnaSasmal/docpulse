import { getDemoData } from "./demo-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getSite(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("docpulse-site") || "vaultpay-docs";
  }
  return "vaultpay-docs";
}

export async function fetchAPI<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const site = getSite();
  const searchParams = new URLSearchParams({ site, ...params });
  try {
    const res = await fetch(`${API_URL}${path}?${searchParams}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch {
    // Backend unreachable — return demo data for portfolio demo
    const demo = getDemoData(path, params);
    if (demo !== null) return demo as T;
    throw new Error("API unavailable and no demo data for this endpoint");
  }
}
