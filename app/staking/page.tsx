"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React from "react";

// ── Error boundary to catch Convex "function not found" crashes ──
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const STATUS_COLORS = {
  critical: { bg: "bg-red-900/30", text: "text-red-400", border: "border-red-700/40" },
  poor:     { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-700/40" },
  ok:       { bg: "bg-yellow-900/30", text: "text-yellow-400", border: "border-yellow-700/40" },
  good:     { bg: "bg-green-900/30", text: "text-green-400", border: "border-green-700/40" },
};

function getStatus(rate: number) {
  if (rate === 0) return "critical";
  if (rate < 20) return "poor";
  if (rate < 34) return "ok";
  return "good";
}

function getStatusLabel(rate: number) {
  if (rate === 0) return "🔴 Critical";
  if (rate < 20) return "🟠 Poor";
  if (rate < 34) return "🟡 Below Baseline";
  return "🟢 Healthy";
}

function StakingContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics = useQuery((api as any).stakingMetrics?.getRecent ?? null, { limit: 30 });

  const sorted = [...(metrics || [])].sort((a: any, b: any) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1] as any;
  const prev = sorted[sorted.length - 2] as any;

  const trend = latest && prev
    ? latest.completionRate - prev.completionRate
    : null;

  const maxRate = Math.max(...sorted.map((m: any) => m.completionRate), 1);

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">⛓️ Staking Metrics</h1>
          <p className="text-gray-400 mt-1">Completion rate over time · Baseline: 34%</p>
        </div>
        {latest && (
          <div className={`px-4 py-2 rounded-xl border text-sm font-medium ${STATUS_COLORS[getStatus(latest.completionRate) as keyof typeof STATUS_COLORS].bg} ${STATUS_COLORS[getStatus(latest.completionRate) as keyof typeof STATUS_COLORS].text} ${STATUS_COLORS[getStatus(latest.completionRate) as keyof typeof STATUS_COLORS].border}`}>
            {getStatusLabel(latest.completionRate)}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Latest Rate",
            value: latest ? `${latest.completionRate.toFixed(1)}%` : "—",
            sub: latest?.date ?? "no data yet",
            color: latest ? STATUS_COLORS[getStatus(latest.completionRate) as keyof typeof STATUS_COLORS].text : "text-gray-400",
          },
          {
            label: "vs Yesterday",
            value: trend !== null ? `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}pp` : "—",
            sub: "percentage points",
            color: trend === null ? "text-gray-400" : trend >= 0 ? "text-green-400" : "text-red-400",
          },
          {
            label: "Latest Completions",
            value: latest?.completions ?? "—",
            sub: `of ${latest?.starts ?? 0} starts`,
            color: "text-white",
          },
          {
            label: "Baseline",
            value: "34%",
            sub: "Feb 19 reference",
            color: "text-gray-400",
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl p-6 bg-gray-900/60 border border-gray-800/50 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Completion Rate History</h2>

        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">No staking data yet.</p>
            <p className="text-xs mt-2 text-gray-700">
              INSIGHT posts data here via <code className="bg-gray-800 px-1 rounded">/api/staking</code>
              <br />or run <code className="bg-gray-800 px-1 rounded">npx convex dev --once</code> to enable the table.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((m: any) => {
              const status = getStatus(m.completionRate);
              const barWidth = Math.max((m.completionRate / Math.max(maxRate, 34)) * 100, 2);
              const baselineWidth = (34 / Math.max(maxRate, 34)) * 100;
              const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS];

              return (
                <div key={m.date} className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{m.date}</span>
                  <div className="flex-1 relative h-7 bg-gray-800/50 rounded">
                    <div className="absolute top-0 bottom-0 w-px bg-gray-600 z-10"
                         style={{ left: `${baselineWidth}%` }} />
                    <div className={`h-full rounded transition-all duration-500 ${colors.bg} border ${colors.border}`}
                         style={{ width: `${barWidth}%` }} />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium ${colors.text}`}>
                      {m.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 w-24 shrink-0 text-right">
                    {m.completions}/{m.starts}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800/50">
              <div className="w-px h-4 bg-gray-600" />
              <span className="text-xs text-gray-600">Baseline (34%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Raw Table */}
      {sorted.length > 0 && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/50">
                {["Date","Starts","Completions","Rate","Status","Notes"].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs text-gray-500 uppercase tracking-wider ${h === "Date" || h === "Notes" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...sorted].reverse().map((m: any, i: number) => {
                const colors = STATUS_COLORS[getStatus(m.completionRate) as keyof typeof STATUS_COLORS];
                return (
                  <tr key={m.date} className={`border-b border-gray-800/30 ${i % 2 === 0 ? "" : "bg-gray-800/10"}`}>
                    <td className="px-6 py-3 text-gray-300 font-mono">{m.date}</td>
                    <td className="px-6 py-3 text-right text-gray-400">{m.starts}</td>
                    <td className="px-6 py-3 text-right text-gray-400">{m.completions}</td>
                    <td className={`px-6 py-3 text-right font-bold ${colors.text}`}>{m.completionRate.toFixed(1)}%</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {getStatusLabel(m.completionRate)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{m.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const SetupFallback = () => (
  <div className="p-8 min-h-screen flex flex-col items-center justify-center">
    <div className="text-6xl mb-4">⛓️</div>
    <h1 className="text-2xl font-bold text-white mb-2">Staking Metrics</h1>
    <p className="text-gray-400 mb-6 text-center max-w-sm">
      Backend table not deployed yet. Run this on your PC to activate:
    </p>
    <code className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-green-400 text-sm">
      npx convex dev --once
    </code>
  </div>
);

export default function StakingPage() {
  return (
    <ErrorBoundary fallback={<SetupFallback />}>
      <StakingContent />
    </ErrorBoundary>
  );
}
