"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getSite } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportsPage() {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const site = getSite();
      const res = await fetch(`${API_URL}/reports/weekly?site=${encodeURIComponent(site)}`);
      if (!res.ok) throw new Error("Failed");
      const text = await res.text();
      setReport(text);
    } catch {
      setReport("Failed to generate report. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (md: string) => {
    return md
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("- ")) return <li key={i} className="text-sm text-slate-600 dark:text-slate-400 ml-4 list-disc">{line.slice(2)}</li>;
        if (line.match(/^\d+\./)) return <li key={i} className="text-sm text-slate-600 dark:text-slate-400 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
        if (line.startsWith("---")) return <hr key={i} className="my-4 border-slate-200 dark:border-slate-700" />;
        if (line.startsWith("*")) return <p key={i} className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">{line.replace(/\*/g, "")}</p>;
        if (line.trim() === "") return <br key={i} />;
        return <p key={i} className="text-sm text-slate-600 dark:text-slate-400">{line}</p>;
      });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate weekly documentation performance reports</p>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate Weekly Report"}
        </button>
      </div>

      {report ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          {renderMarkdown(report)}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob([report], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `docpulse-report-${new Date().toISOString().slice(0, 10)}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Download Markdown
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(report)}
              className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">&#128202;</div>
          <p className="text-slate-500 dark:text-slate-400">Click &ldquo;Generate Weekly Report&rdquo; to create a performance summary.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Reports include page views, unique visitors, feedback, top pages, and content gaps.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
