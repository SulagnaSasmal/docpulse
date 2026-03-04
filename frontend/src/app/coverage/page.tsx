"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { fetchAPI } from "@/lib/api";

interface Feature {
  name: string;
  endpoints: string[];
  doc_pages: string[];
  status: string;
}

interface CoverageData {
  product: string;
  features: Feature[];
  overall_score: number;
  total_features: number;
  documented: number;
  partial: number;
  undocumented: number;
}

export default function CoveragePage() {
  const [data, setData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchAPI<CoverageData>("/coverage");
      setData(d);
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

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    documented: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Documented",
    },
    partial: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-400",
      label: "Partial",
    },
    undocumented: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      label: "Undocumented",
    },
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coverage Matrix</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track which API features are fully documented, partially documented, or missing
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading coverage data...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Overall Score"
              value={`${data.overall_score}%`}
              color={data.overall_score >= 80 ? "emerald" : data.overall_score >= 60 ? "amber" : "red"}
            />
            <MetricCard label="Documented" value={data.documented} color="emerald" />
            <MetricCard label="Partial" value={data.partial} color="amber" />
            <MetricCard label="Undocumented" value={data.undocumented} color="red" />
          </div>

          {/* Score Progress Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.product} Coverage</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{data.overall_score}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.overall_score >= 80
                    ? "bg-emerald-500"
                    : data.overall_score >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${data.overall_score}%` }}
              />
            </div>
          </div>

          {/* Feature Coverage Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Feature</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Endpoints</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Doc Pages</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.features.map((feature) => {
                  const sc = statusColors[feature.status] || statusColors.undocumented;
                  return (
                    <tr key={feature.name} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{feature.name}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {feature.endpoints.map((ep) => (
                            <span key={ep} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {ep}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {feature.doc_pages.length > 0 ? (
                          feature.doc_pages.map((dp) => (
                            <span key={dp} className="text-xs text-indigo-600 dark:text-indigo-400">{dp}</span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">No coverage data available. Make sure coverage.yaml exists.</div>
      )}
    </DashboardLayout>
  );
}
