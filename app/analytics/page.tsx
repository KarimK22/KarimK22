"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface StakingEntry {
  date: string;
  starts: number;
  completions: number;
  completionRate: number;
  notes?: string;
}

const STAKING_COLORS = {
  good:     { bar: "#10b981", text: "text-green-400", bg: "bg-green-900/20", border: "border-green-700/30" },
  ok:       { bar: "#f59e0b", text: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-700/30" },
  poor:     { bar: "#f97316", text: "text-orange-400", bg: "bg-orange-900/20", border: "border-orange-700/30" },
  critical: { bar: "#ef4444", text: "text-red-400", bg: "bg-red-900/20", border: "border-red-700/30" },
};

function getStakingStatus(rate: number) {
  if (rate >= 34) return "good";
  if (rate >= 20) return "ok";
  if (rate >= 10) return "poor";
  return "critical";
}

function getStatusLabel(rate: number) {
  if (rate >= 34) return "✅ At Baseline";
  if (rate >= 20) return "🟡 Below Baseline";
  if (rate >= 10) return "🟠 Poor";
  if (rate === 0) return "🔴 Blackout";
  return "🔴 Critical";
}

function MetricCard({ label, value, sub, delta, color = "text-white", icon }: {
  label: string; value: string | number; sub?: string;
  delta?: number; color?: string; icon: string;
}) {
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
          <span>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}pp vs prior day</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const stakingMemories = useQuery(api.memories.getRecent, { type: "staking-metric", limit: 60 });
  const recentMemories  = useQuery(api.memories.getRecent, { limit: 100 });

  // Parse staking entries
  const stakingEntries: StakingEntry[] = (stakingMemories || [])
    .map((m: any) => { try { return JSON.parse(m.content); } catch { return null; } })
    .filter(Boolean)
    .sort((a: StakingEntry, b: StakingEntry) => a.date.localeCompare(b.date));

  const latest  = stakingEntries[stakingEntries.length - 1];
  const prev    = stakingEntries[stakingEntries.length - 2];
  const delta   = latest && prev ? latest.completionRate - prev.completionRate : undefined;
  const maxRate = Math.max(...stakingEntries.map(m => m.completionRate), 34);

  // Analytics reports from memory
  const analyticsMemories = (recentMemories || []).filter((m: any) =>
    ["dau", "wau", "mau", "daily active", "weekly active", "retention", "conversion"].some(k =>
      m.content?.toLowerCase().includes(k)
    ) && m.type !== "staking-metric"
  );

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">📈 Analytics</h1>
          <p className="text-gray-400 mt-1">Lingo platform metrics · Updated by INSIGHT</p>
        </div>
        {latest && (
          <div className={`px-4 py-2 rounded-xl border text-sm font-medium
            ${STAKING_COLORS[getStakingStatus(latest.completionRate)].bg}
            ${STAKING_COLORS[getStakingStatus(latest.completionRate)].text}
            ${STAKING_COLORS[getStakingStatus(latest.completionRate)].border}`}>
            {getStatusLabel(latest.completionRate)}
          </div>
        )}
      </div>

      {/* ── Staking Section ── */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">⛓️ Staking · Baseline: 34%</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Current Rate" icon="⛓️"
            value={latest ? `${latest.completionRate.toFixed(1)}%` : "—"}
            sub={latest?.date ?? "no data"}
            delta={delta}
            color={latest ? STAKING_COLORS[getStakingStatus(latest.completionRate)].text : "text-gray-400"}
          />
          <MetricCard
            label="Gap to Baseline" icon="🎯"
            value={latest ? `${Math.abs(34.1 - latest.completionRate).toFixed(1)}pp` : "—"}
            sub={latest ? (latest.completionRate >= 34.1 ? "Above baseline ✅" : "Below baseline") : ""}
            color={latest ? (latest.completionRate >= 34.1 ? "text-green-400" : "text-orange-400") : "text-gray-400"}
          />
          <MetricCard
            label="Latest Volume" icon="👥"
            value={latest?.starts ?? "—"}
            sub={`${latest?.completions ?? 0} completed`}
          />
          <MetricCard
            label="Baseline" icon="📏"
            value="34.1%"
            sub="Feb 19 reference"
            color="text-gray-400"
          />
        </div>

        {/* Full bar chart */}
        {stakingEntries.length > 0 ? (
          <div className="rounded-xl p-6 bg-gray-900/60 border border-gray-800/50">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-5">Completion Rate History</h3>
            <div className="space-y-2.5">
              {stakingEntries.map((m) => {
                const status = getStakingStatus(m.completionRate);
                const { bar, text } = STAKING_COLORS[status];
                const barWidth = Math.max((m.completionRate / maxRate) * 100, 2);
                const baselineWidth = (34.1 / maxRate) * 100;
                return (
                  <div key={m.date} className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-20 shrink-0">{m.date.slice(5)}</span>
                    <div className="flex-1 relative h-7 bg-gray-800/50 rounded">
                      <div className="absolute top-0 bottom-0 w-px bg-gray-600 z-10"
                           style={{ left: `${baselineWidth}%` }} />
                      <div className="h-full rounded transition-all duration-500"
                           style={{ width: `${barWidth}%`, background: `${bar}25`, border: `1px solid ${bar}50` }} />
                      <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium ${text}`}>
                        {m.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 w-20 shrink-0 text-right">
                      {m.completions}/{m.starts}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-800/40">
                <div className="w-px h-3 bg-gray-600" />
                <span className="text-xs text-gray-600">Baseline (34.1%)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-10 bg-gray-900/40 border border-gray-800/40 text-center text-gray-600">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">No staking data yet — INSIGHT logs it daily.</p>
          </div>
        )}

        {/* Data table */}
        {stakingEntries.length > 0 && (
          <div className="mt-4 rounded-xl bg-gray-900/60 border border-gray-800/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  {["Date","Starts","Completions","Rate","Status","Notes"].map(h => (
                    <th key={h} className={`px-5 py-3 text-xs text-gray-500 uppercase tracking-wider ${["Date","Notes"].includes(h) ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...stakingEntries].reverse().map((m, i) => {
                  const { text } = STAKING_COLORS[getStakingStatus(m.completionRate)];
                  return (
                    <tr key={m.date} className={`border-b border-gray-800/20 ${i % 2 === 0 ? "" : "bg-gray-800/10"}`}>
                      <td className="px-5 py-2.5 text-gray-300 font-mono text-xs">{m.date}</td>
                      <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{m.starts}</td>
                      <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{m.completions}</td>
                      <td className={`px-5 py-2.5 text-right font-bold text-sm ${text}`}>{m.completionRate.toFixed(1)}%</td>
                      <td className="px-5 py-2.5 text-right text-xs text-gray-500">{getStatusLabel(m.completionRate)}</td>
                      <td className="px-5 py-2.5 text-gray-600 text-xs">{m.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Engagement Section ── */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">📱 Engagement</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "DAU", icon: "👤", sub: "Daily Active Users" },
            { label: "WAU", icon: "📅", sub: "Weekly Active Users" },
            { label: "D7 Retention", icon: "🔄", sub: "7-day retention rate" },
          ].map(({ label, icon, sub }) => (
            <div key={label} className="rounded-xl p-5 bg-gray-900/60 border border-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                <span className="text-xl">{icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-600">—</p>
              <p className="text-xs text-gray-700 mt-1">{sub}</p>
              <p className="text-xs text-gray-700 mt-2">Populates when INSIGHT posts structured reports</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Reports ── */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">📋 Recent INSIGHT Reports</h2>
        {analyticsMemories.length === 0 ? (
          <div className="rounded-xl p-10 bg-gray-900/40 border border-gray-800/40 text-center text-gray-600">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No analytics reports logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyticsMemories.slice(0, 6).map((m: any) => (
              <div key={m._id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-400 font-medium">📊 INSIGHT</span>
                  <span className="text-xs text-gray-600">
                    {new Date(m.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
