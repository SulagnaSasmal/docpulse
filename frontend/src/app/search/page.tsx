"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { fetchAPI } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface SearchStats {
  total_searches: number;
  failed_searches: number;
  success_rate: number;
}

interface QueryEntry {
  query: string;
  count: number;
  min_results: number;
}

interface FailedEntry {
  query: string;
  count: number;
}

export default function SearchPage() {
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [queries, setQueries] = useState<QueryEntry[]>([]);
  const [failed, setFailed] = useState<FailedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, q, f] = await Promise.all([
        fetchAPI<SearchStats>("/search/stats"),
        fetchAPI<QueryEntry[]>("/search/queries", { limit: "20" }),
        fetchAPI<FailedEntry[]>("/search/failed", { limit: "15" }),
      ]);
      setStats(s);
      setQueries(q);
      setFailed(f);
    } catch {
      // API not reachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("docpulse-site-change", handler);
    return () => window.removeEventListener("docpulse-site-change", handler);
  }, [loadData]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Understand what users are searching for and where docs fall short</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading search analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MetricCard label="Total Searches" value={stats?.total_searches?.toLocaleString() || "0"} color="indigo" />
            <MetricCard label="Failed Searches" value={stats?.failed_searches?.toLocaleString() || "0"} color="red" />
            <MetricCard label="Success Rate" value={`${stats?.success_rate || 0}%`} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Search Queries */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Search Queries</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {queries.map((q, i) => (
                  <div key={q.query} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">&ldquo;{q.query}&rdquo;</p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{q.min_results} results</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{q.count}x</span>
                  </div>
                ))}
                {queries.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No search data</p>
                )}
              </div>
            </div>

            {/* Failed Searches Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Failed Searches (No Results)</h3>
              {failed.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={failed.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="query" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={140} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 py-10 text-center">No failed searches</p>
              )}
            </div>
          </div>

          {/* Failed Searches Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Content Gaps from Search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">These queries returned zero results — consider adding documentation for them.</p>
            {failed.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Query</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Times Searched</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map((f) => (
                    <tr key={f.query} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">&ldquo;{f.query}&rdquo;</td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">{f.count}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          f.count >= 10 ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : f.count >= 5 ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {f.count >= 10 ? "High" : f.count >= 5 ? "Medium" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No failed searches detected</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
