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
  const res = await fetch(`${API_URL}${path}?${searchParams}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
