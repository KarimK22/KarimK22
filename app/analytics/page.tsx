"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface MetricCard {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number;
  color?: string;
  icon: string;
}

function StatCard({ label, value, sub, delta, color = "text-white", icon }: MetricCard) {
  return (
    <div className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
          <span>{delta >= 0 ? "▲" : "▼"}</span>
          <span>{Math.abs(delta).toFixed(1)}pp vs prior</span>
        </div>
      )}
    </div>
  );
}

function parseMetricFromMemory(memories: any[], keywords: string[], field?: string): number | null {
  for (const m of memories) {
    const content = m.content?.toLowerCase() || "";
    if (keywords.every(k => content.includes(k.toLowerCase()))) {
      if (field) {
        const match = content.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:${field})`));
        if (match) return parseFloat(match[1]);
      }
      const numMatch = content.match(/(\d+(?:\\.\\d+)?)/);
      if (numMatch) return parseFloat(numMatch[1]);
    }
  }
  return null;
}

export default function AnalyticsPage() {
  const recentMemories = useQuery(api.memories.getRecent, { limit: 100 });
  const stakingMemories = useQuery(api.memories.getRecent, { type: "staking-metric", limit: 30 });

  // Parse staking from structured staking-metric entries
  const stakingEntries = (stakingMemories || [])
    .map((m: any) => { try { return JSON.parse(m.content); } catch { return null; } })
    .filter(Boolean)
    .sort((a: any, b: any) => b.date.localeCompare(a.date));

  const latestStaking = stakingEntries[0];
  const prevStaking = stakingEntries[1];
  const stakingDelta = latestStaking && prevStaking
    ? latestStaking.completionRate - prevStaking.completionRate
    : undefined;

  // Search memories for analytics data
  const analyticsMemories = (recentMemories || []).filter((m: any) =>
    ["dau", "wau", "mau", "daily active", "weekly active", "retention", "users"].some(k =>
      m.content?.toLowerCase().includes(k)
    )
  );

  // Try to extract DAU from recent analytics memories
  const dauMemory = analyticsMemories.find((m: any) =>
    m.content?.toLowerCase().includes("dau") || m.content?.toLowerCase().includes("daily active")
  );
  const wauMemory = analyticsMemories.find((m: any) =>
    m.content?.toLowerCase().includes("wau") || m.content?.toLowerCase().includes("weekly active")
  );
  const retentionMemory = analyticsMemories.find((m: any) =>
    m.content?.toLowerCase().includes("retention") || m.content?.toLowerCase().includes("d7") || m.content?.toLowerCase().includes("day 7")
  );

  // Timeline of staking recovery
  const stakingTimeline = stakingEntries.slice(0, 10).reverse();
  const maxRate = Math.max(...stakingTimeline.map((m: any) => m.completionRate), 34);

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">📈 Analytics</h1>
          <p className="text-gray-400 mt-1">Lingo platform metrics · Powered by INSIGHT reports</p>
        </div>
        <div className="text-xs text-gray-600 bg-gray-900/50 border border-gray-800/50 px-3 py-2 rounded-lg">
          Last updated: {new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Staking - Primary Metric */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">⛓️ Staking (Primary Focus)</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Current Rate"
            value={latestStaking ? `${latestStaking.completionRate.toFixed(1)}%` : "—"}
            sub={latestStaking?.date ?? "no data"}
            delta={stakingDelta}
            color={latestStaking ? (latestStaking.completionRate >= 34 ? "text-green-400" : latestStaking.completionRate >= 20 ? "text-yellow-400" : "text-red-400") : "text-gray-400"}
            icon="⛓️"
          />
          <StatCard
            label="Baseline"
            value="34.1%"
            sub="Feb 19 reference"
            color="text-gray-400"
            icon="📏"
          />
          <StatCard
            label="Gap to Baseline"
            value={latestStaking ? `${(34.1 - latestStaking.completionRate).toFixed(1)}pp` : "—"}
            sub={latestStaking && latestStaking.completionRate >= 34.1 ? "Above baseline ✅" : "Below baseline"}
            color={latestStaking && latestStaking.completionRate >= 34.1 ? "text-green-400" : "text-orange-400"}
            icon="🎯"
          />
          <StatCard
            label="Latest Volume"
            value={latestStaking?.starts ?? "—"}
            sub={`${latestStaking?.completions ?? 0} completions`}
            color="text-white"
            icon="👥"
          />
        </div>

        {/* Staking mini chart */}
        {stakingTimeline.length > 0 && (
          <div className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Recovery Timeline</h3>
            <div className="space-y-2">
              {stakingTimeline.map((m: any) => {
                const pct = Math.max((m.completionRate / maxRate) * 100, 2);
                const baseline = (34.1 / maxRate) * 100;
                const color = m.completionRate >= 34 ? "#10b981" : m.completionRate >= 20 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={m.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{m.date.slice(5)}</span>
                    <div className="flex-1 relative h-5 bg-gray-800/50 rounded">
                      <div className="absolute top-0 bottom-0 w-px bg-gray-600 z-10" style={{ left: `${baseline}%` }} />
                      <div className="h-full rounded transition-all duration-500"
                           style={{ width: `${pct}%`, background: `${color}30`, border: `1px solid ${color}50` }} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium" style={{ color }}>
                        {m.completionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">📱 Engagement</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">DAU</span>
              <span className="text-xl">👤</span>
            </div>
            <p className="text-3xl font-bold text-white">—</p>
            <p className="text-xs text-gray-600 mt-1">Daily Active Users</p>
            {dauMemory && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{dauMemory.content.slice(0, 80)}...</p>
            )}
          </div>
          <div className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">WAU</span>
              <span className="text-xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-white">—</p>
            <p className="text-xs text-gray-600 mt-1">Weekly Active Users</p>
            {wauMemory && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{wauMemory.content.slice(0, 80)}...</p>
            )}
          </div>
          <div className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Retention</span>
              <span className="text-xl">🔄</span>
            </div>
            <p className="text-3xl font-bold text-white">—</p>
            <p className="text-xs text-gray-600 mt-1">D7 Retention</p>
            {retentionMemory && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{retentionMemory.content.slice(0, 80)}...</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-700 mt-3">
          💡 DAU/WAU/Retention will auto-populate as INSIGHT posts structured analytics reports to Mission Control.
        </p>
      </div>

      {/* Recent Analytics Reports */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">📋 Recent Reports from INSIGHT</h2>
        {analyticsMemories.length === 0 ? (
          <div className="text-center py-12 text-gray-600 rounded-xl bg-gray-900/40 border border-gray-800/40">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No analytics reports logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyticsMemories.slice(0, 8).map((m: any) => (
              <div key={m._id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-400 font-medium">📊 INSIGHT Report</span>
                  <span className="text-xs text-gray-600">
                    {new Date(m.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
