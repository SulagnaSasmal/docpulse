"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { fetchAPI } from "@/lib/api";

interface FreshnessFile {
  file: string;
  path: string;
  last_updated: string;
  days_ago: number;
  status: string;
}

interface FreshnessData {
  repo: string;
  files: FreshnessFile[];
  overall_score: number;
  error?: string;
}

export default function FreshnessPage() {
  const [owner, setOwner] = useState("SulagnaSasmal");
  const [repo, setRepo] = useState("docquery");
  const [docsPath, setDocsPath] = useState("docs");
  const [data, setData] = useState<FreshnessData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFreshness = async () => {
    setLoading(true);
    try {
      const d = await fetchAPI<FreshnessData>("/freshness", {
        repo_owner: owner,
        repo_name: repo,
        docs_path: docsPath,
      });
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load demo data on mount
  useEffect(() => {
    fetchFreshness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    fresh: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    aging: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    stale: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
    abandoned: { bg: "bg-slate-200 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-400" },
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Content Freshness</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Check when documentation files were last updated via GitHub commits
        </p>
      </div>

      {/* Config */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Repo Owner</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Repo Name</label>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Docs Path</label>
            <input
              value={docsPath}
              onChange={(e) => setDocsPath(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchFreshness}
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Scanning..." : "Scan Freshness"}
            </button>
          </div>
        </div>
      </div>

      {data && !data.error && (
        <>
          {/* Score */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.repo} Freshness Score</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{data.overall_score}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  data.overall_score >= 70 ? "bg-emerald-500" : data.overall_score >= 40 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${data.overall_score}%` }}
              />
            </div>
          </div>

          {/* Freshness Heatmap Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">File Freshness Heatmap</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {data.files.map((f) => {
                const sc = statusConfig[f.status] || statusConfig.stale;
                return (
                  <div
                    key={f.path}
                    className={`rounded-lg p-3 ${sc.bg} transition-colors`}
                    title={`${f.file}: ${f.days_ago} days ago (${f.status})`}
                  >
                    <p className={`text-xs font-medium truncate ${sc.text}`}>{f.file}</p>
                    <p className={`text-[10px] mt-0.5 opacity-70 ${sc.text}`}>{f.days_ago}d ago</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30" /> Fresh (&le;30d)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30" /> Aging (31-90d)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" /> Stale (91-180d)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" /> Abandoned (&gt;180d)</span>
            </div>
          </div>

          {/* Files Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">File</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Last Updated</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Days Ago</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.files.map((f) => {
                  const sc = statusConfig[f.status] || statusConfig.stale;
                  return (
                    <tr key={f.path} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{f.path}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{new Date(f.last_updated).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{f.days_ago}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${sc.bg} ${sc.text}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data?.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 text-sm text-red-700 dark:text-red-400">
          {data.error}
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">&#128197;</div>
          <p className="text-slate-500 dark:text-slate-400">Enter a GitHub repository above and click &ldquo;Scan Freshness&rdquo; to check documentation age.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
