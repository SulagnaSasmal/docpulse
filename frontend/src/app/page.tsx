"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { fetchAPI } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

interface Overview {
  total_views: number;
  unique_visitors: number;
  avg_reading_time: number;
  top_page: { url: string; views: number } | null;
  period_days: number;
}

interface TimeseriesEntry {
  day: string;
  views: number;
  sessions: number;
}

interface PageEntry {
  url: string;
  views: number;
  unique_visitors: number;
}

export default function OverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesEntry[]>([]);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, ts, pg] = await Promise.all([
        fetchAPI<Overview>("/analytics/overview", { days }),
        fetchAPI<TimeseriesEntry[]>("/analytics/timeseries", { days }),
        fetchAPI<PageEntry[]>("/analytics/pages", { days, limit: "10" }),
      ]);
      setOverview(ov);
      setTimeseries(ts);
      setPages(pg);
    } catch {
      // API not reachable
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("docpulse-site-change", handler);
    return () => window.removeEventListener("docpulse-site-change", handler);
  }, [loadData]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Documentation performance at a glance</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading analytics...</div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Page Views"
              value={overview?.total_views?.toLocaleString() || "0"}
              color="indigo"
            />
            <MetricCard
              label="Unique Visitors"
              value={overview?.unique_visitors?.toLocaleString() || "0"}
              color="emerald"
            />
            <MetricCard
              label="Avg Reading Time"
              value={`${overview?.avg_reading_time || 0}s`}
              color="amber"
            />
            <MetricCard
              label="Top Page"
              value={overview?.top_page?.views?.toLocaleString() || "0"}
              subtitle={overview?.top_page?.url || "N/A"}
              color="slate"
            />
          </div>

          {/* Page Views Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Page Views Over Time</h3>
            {timeseries.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No data for this period</p>
            )}
          </div>

          {/* Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Pages</h3>
              <div className="space-y-2">
                {pages.map((p, i) => (
                  <div key={p.url} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{p.url}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{p.views.toLocaleString()}</span>
                  </div>
                ))}
                {pages.length === 0 && (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No page data</p>
                )}
              </div>
            </div>

            {/* Page Views Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Views by Page</h3>
              {pages.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pages.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="url" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={120} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No data</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
