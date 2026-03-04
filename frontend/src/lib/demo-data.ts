// Demo data for when the backend is not available (GitHub Pages deployment)

function generateTimeseries(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      day: d.toISOString().slice(0, 10),
      views: Math.floor(200 + Math.random() * 600 + Math.sin(i / 3) * 150),
      sessions: Math.floor(80 + Math.random() * 200 + Math.sin(i / 3) * 50),
    });
  }
  return data;
}

const demoPages = [
  { url: "/docs/authentication", views: 4821, unique_visitors: 2103 },
  { url: "/docs/payments/create", views: 3654, unique_visitors: 1847 },
  { url: "/docs/webhooks", views: 3201, unique_visitors: 1562 },
  { url: "/docs/errors", views: 2987, unique_visitors: 1423 },
  { url: "/docs/getting-started", views: 2654, unique_visitors: 1891 },
  { url: "/docs/settlements", views: 2103, unique_visitors: 987 },
  { url: "/docs/refunds", views: 1876, unique_visitors: 843 },
  { url: "/docs/disputes", views: 1543, unique_visitors: 721 },
  { url: "/docs/3d-secure", views: 1234, unique_visitors: 598 },
  { url: "/docs/sdk/node", views: 1102, unique_visitors: 534 },
];

const demoSearchQueries = [
  { query: "how to authenticate", count: 342, results_found: true },
  { query: "webhook signature verification", count: 287, results_found: true },
  { query: "payment retry logic", count: 198, results_found: false },
  { query: "idempotency key", count: 176, results_found: true },
  { query: "sandbox credentials", count: 154, results_found: true },
  { query: "rate limiting", count: 143, results_found: false },
  { query: "batch payments", count: 132, results_found: false },
  { query: "PCI compliance", count: 121, results_found: true },
  { query: "error code 4012", count: 98, results_found: false },
  { query: "currency conversion", count: 87, results_found: true },
];

const demoCoverage = {
  overall_score: 78,
  features: [
    { feature: "Authentication", endpoints: "POST /auth/token, POST /auth/refresh", doc_page: "/docs/authentication", status: "documented" },
    { feature: "Payments", endpoints: "POST /payments, GET /payments/{id}", doc_page: "/docs/payments/create", status: "documented" },
    { feature: "Webhooks", endpoints: "POST /webhooks, DELETE /webhooks/{id}", doc_page: "/docs/webhooks", status: "documented" },
    { feature: "Refunds", endpoints: "POST /refunds, GET /refunds/{id}", doc_page: "/docs/refunds", status: "documented" },
    { feature: "Disputes", endpoints: "POST /disputes/respond", doc_page: "/docs/disputes", status: "partial" },
    { feature: "Settlements", endpoints: "GET /settlements, GET /settlements/{id}", doc_page: "/docs/settlements", status: "documented" },
    { feature: "Batch Payments", endpoints: "POST /batch, GET /batch/{id}", doc_page: "", status: "undocumented" },
    { feature: "3D Secure", endpoints: "POST /3ds/authenticate", doc_page: "/docs/3d-secure", status: "partial" },
  ],
};

const demoFreshness = [
  { file: "authentication.md", path: "docs/authentication.md", last_updated: "2026-02-28T10:30:00Z", days_ago: 5, status: "fresh" },
  { file: "payments.md", path: "docs/payments.md", last_updated: "2026-02-20T14:00:00Z", days_ago: 13, status: "fresh" },
  { file: "webhooks.md", path: "docs/webhooks.md", last_updated: "2026-01-15T09:00:00Z", days_ago: 49, status: "aging" },
  { file: "errors.md", path: "docs/errors.md", last_updated: "2026-02-25T16:00:00Z", days_ago: 8, status: "fresh" },
  { file: "getting-started.md", path: "docs/getting-started.md", last_updated: "2025-12-10T11:00:00Z", days_ago: 85, status: "aging" },
  { file: "settlements.md", path: "docs/settlements.md", last_updated: "2025-10-05T08:00:00Z", days_ago: 151, status: "stale" },
  { file: "refunds.md", path: "docs/refunds.md", last_updated: "2026-01-28T13:00:00Z", days_ago: 36, status: "aging" },
  { file: "disputes.md", path: "docs/disputes.md", last_updated: "2025-08-20T10:00:00Z", days_ago: 197, status: "abandoned" },
  { file: "sdk-node.md", path: "docs/sdk-node.md", last_updated: "2026-03-01T09:00:00Z", days_ago: 4, status: "fresh" },
  { file: "3d-secure.md", path: "docs/3d-secure.md", last_updated: "2025-11-15T14:00:00Z", days_ago: 110, status: "stale" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoData(path: string, params: Record<string, string> = {}): any {
  const days = parseInt(params.days || "30");

  if (path === "/analytics/overview") {
    return {
      total_views: 28543,
      unique_visitors: 12876,
      avg_reading_time: 147,
      top_page: { url: "/docs/authentication", views: 4821 },
      period_days: days,
    };
  }

  if (path === "/analytics/timeseries") {
    return generateTimeseries(days);
  }

  if (path === "/analytics/pages") {
    const limit = parseInt(params.limit || "10");
    return demoPages.slice(0, limit);
  }

  if (path === "/search/queries") {
    return { queries: demoSearchQueries.filter(q => q.results_found), total: 7 };
  }

  if (path === "/search/failed") {
    return { queries: demoSearchQueries.filter(q => !q.results_found), total: 4 };
  }

  if (path === "/search/stats") {
    return { total_searches: 1538, unique_queries: 432, zero_result_rate: 0.26, avg_results: 3.4 };
  }

  if (path === "/coverage") {
    return demoCoverage;
  }

  if (path === "/freshness") {
    const avg = 68;
    return { repo: "SulagnaSasmal/vaultpay-api-docs", files: demoFreshness, overall_score: avg };
  }

  return null;
}
