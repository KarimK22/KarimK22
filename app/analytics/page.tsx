"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, AreaChart, Area,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayData {
  date: string;          // "YYYY-MM-DD"
  label: string;         // "Feb 19"
  staking: number | null;   // completion rate %
  starts: number | null;
  completions: number | null;
  dau: number | null;
  stakingNotes?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(d: string) {
  const [, m, day] = d.split("-");
  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[+m]} ${+day}`;
}

function stakingColor(rate: number | null) {
  if (rate === null) return "#374151";
  if (rate === 0)    return "#ef4444";
  if (rate >= 34)    return "#10b981";
  if (rate >= 25)    return "#f59e0b";
  return "#f97316";
}

function stakingLabel(rate: number | null) {
  if (rate === null) return "No data";
  if (rate === 0)    return "🔴 Blackout";
  if (rate >= 34)    return "✅ At baseline";
  if (rate >= 25)    return "🟡 Below baseline";
  return "🟠 Low";
}

function deltaArrow(curr: number | null, prev: number | null) {
  if (curr === null || prev === null) return null;
  const diff = curr - prev;
  return { diff, up: diff >= 0 };
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function StakingTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: DayData = payload[0]?.payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold text-white mb-2">{label}</p>
      <p className="text-gray-400">Staking rate: <span className="text-white font-bold">{d.staking ?? 0}%</span></p>
      {d.starts !== null && <p className="text-gray-400">Started: <span className="text-white">{d.starts}</span></p>}
      {d.completions !== null && <p className="text-gray-400">Completed: <span className="text-white">{d.completions}</span></p>}
      <p className="text-gray-500 mt-2 text-xs">{stakingLabel(d.staking)}</p>
    </div>
  );
}

function DAUTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: DayData = payload[0]?.payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl text-sm min-w-[160px]">
      <p className="font-semibold text-white mb-2">{label}</p>
      <p className="text-gray-400">Daily active users: <span className="text-white font-bold">{d.dau ?? "—"}</span></p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroCard({ label, value, sub, delta, icon, color, unit = "pp" }: {
  label: string; value: string; sub?: string;
  delta?: { diff: number; up: boolean } | null;
  icon: string; color: string; unit?: string;
}) {
  return (
    <div className={`rounded-2xl p-6 border bg-gray-900/70 backdrop-blur-sm ${color}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      {sub && <p className="text-sm text-gray-400">{sub}</p>}
      {delta && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-semibold ${delta.up ? "text-green-400" : "text-red-400"}`}>
          <span>{delta.up ? "▲" : "▼"}</span>
          <span>{Math.abs(delta.diff).toFixed(1)}{unit} vs yesterday</span>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const stakingMems = useQuery(api.memories.getRecent, { limit: 60 });
  const allMems     = useQuery(api.memories.getRecent, { limit: 200 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { days, latest, prevDay, latestDau, prevDau } = useMemo(() => {
    if (!stakingMems || !allMems) return { days: [], latest: null, prevDay: null, latestDau: null, prevDau: null };

    // Parse staking
    const stakingMap: Record<string, any> = {};
    (stakingMems.filter((m: any) => m.type === "staking-metric") as any[]).forEach((m: any) => {
      try {
        const c = JSON.parse(m.content);
        // Keep only latest entry per date
        if (!stakingMap[c.date] || m._creationTime > stakingMap[c.date]._ts) {
          stakingMap[c.date] = { ...c, _ts: m._creationTime };
        }
      } catch {}
    });

    // Parse DAU
    const dauMap: Record<string, number> = {};
    (allMems.filter((m: any) => m.type === "engagement-metric") as any[]).forEach((m: any) => {
      try {
        const c = JSON.parse(m.content);
        if (c.date && typeof c.dau === "number") dauMap[c.date] = c.dau;
      } catch {}
    });

    // Merge by date
    const dateSet = new Set([...Object.keys(stakingMap), ...Object.keys(dauMap)]);
    const sorted  = Array.from(dateSet).sort();

    const days: DayData[] = sorted.map(date => ({
      date,
      label: fmt(date),
      staking:     stakingMap[date] ? (() => {
        // Normalize: old backfill stored as % (34.1), new cron stores as decimal (0.355)
        const raw = stakingMap[date].completionRate;
        return round1(raw > 1 ? raw : raw * 100);
      })() : null,
      starts:      stakingMap[date]?.starts ?? null,
      completions: stakingMap[date]?.completions ?? null,
      stakingNotes:stakingMap[date]?.notes,
      dau:         dauMap[date] ?? null,
    }));

    const stDays  = days.filter(d => d.staking !== null);
    const dauDays = days.filter(d => d.dau !== null);
    return {
      days,
      latest:   stDays.at(-1) ?? null,
      prevDay:  stDays.at(-2) ?? null,
      latestDau: dauDays.at(-1) ?? null,
      prevDau:   dauDays.at(-2) ?? null,
    };
  }, [stakingMems, allMems]);

  const stakingDelta = deltaArrow(latest?.staking ?? null, prevDay?.staking ?? null);
  const dauDelta     = deltaArrow(latestDau?.dau ?? null, prevDau?.dau ?? null);

  // For DAU delta display
  const dauDeltaDisplay = dauDelta
    ? { diff: Math.abs(dauDelta.diff), up: dauDelta.up, label: `${dauDelta.up ? "▲" : "▼"} ${Math.abs(dauDelta.diff)} vs yesterday` }
    : null;

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📈 Analytics</h1>
        <p className="text-gray-400 mt-1">Lingo platform — updated daily by INSIGHT</p>
      </div>

      {/* ── Hero metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <HeroCard
          label="Staking Rate"
          value={latest?.staking != null ? `${latest.staking}%` : "—"}
          sub={latest ? `${latest.completions}/${latest.starts} users completed · ${fmt(latest.date)}` : "No data yet"}
          delta={stakingDelta}
          icon="⛓️"
          color={latest?.staking != null && latest.staking >= 34 ? "border-green-800/50" : "border-orange-800/50"}
        />
        <HeroCard
          label="Daily Active Users"
          value={latestDau?.dau != null ? latestDau.dau.toLocaleString() : "—"}
          sub={latestDau ? `As of ${fmt(latestDau.date)}` : "No data yet"}
          delta={dauDelta ? { diff: dauDelta.diff, up: dauDelta.up } : null}
          icon="👤"
          color="border-blue-800/50"
          unit=" users"
        />
        <HeroCard
          label="Gap to Target"
          value={latest?.staking != null ? `${Math.abs(34.1 - latest.staking).toFixed(1)}pp` : "—"}
          sub={latest?.staking != null
            ? (latest.staking >= 34.1 ? "Above baseline ✅" : "Below 34.1% baseline")
            : "Target: 34.1% staking rate"}
          icon="🎯"
          color={latest?.staking != null && latest.staking >= 34.1 ? "border-green-800/50" : "border-yellow-800/50"}
        />
      </div>

      {/* ── Staking chart ── */}
      <section className="mb-8">
        <div className="bg-gray-900/70 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Staking Completion Rate</h2>
              <p className="text-sm text-gray-400 mt-0.5">How many users who started staking actually finished — target is 34%</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"/>At target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"/>Below target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"/>Blackout</span>
            </div>
          </div>

          {mounted && days.some(d => d.staking !== null) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={days.filter(d => d.staking !== null)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 50]} tickFormatter={v => `${v}%`} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<StakingTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <ReferenceLine y={34.1} stroke="#6b7280" strokeDasharray="6 3" label={{ value: "Target 34%", fill: "#9ca3af", fontSize: 11, position: "right" }} />
                <Bar dataKey="staking" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={true}>
                  {days.filter(d => d.staking !== null).map((d, i) => (
                    <Cell key={i} fill={stakingColor(d.staking)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-600 text-sm">
              {mounted ? "No staking data yet" : "Loading…"}
            </div>
          )}
        </div>
      </section>

      {/* ── DAU chart ── */}
      <section className="mb-8">
        <div className="bg-gray-900/70 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Daily Active Users</h2>
            <p className="text-sm text-gray-400 mt-0.5">How many people used Lingo each day</p>
          </div>

          {mounted && days.some(d => d.dau !== null) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={days.filter(d => d.dau !== null)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DAUTooltip />} cursor={{ stroke: "#374151" }} />
                <Area
                  type="monotone" dataKey="dau"
                  stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#dauGrad)" dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#60a5fa" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">
              {mounted ? "No DAU data yet" : "Loading…"}
            </div>
          )}
        </div>
      </section>

      {/* ── Combined data table ── */}
      <section>
        <div className="bg-gray-900/70 border border-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-gray-800/50">
            <h2 className="text-lg font-semibold text-white">Daily Breakdown</h2>
            <p className="text-sm text-gray-400 mt-0.5">Every number in one place</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  {["Date", "Active Users", "Staking Started", "Staking Finished", "Completion Rate", "Status"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs text-gray-500 uppercase tracking-wider text-left first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {[...days].reverse().map((d, i) => {
                  const color = d.staking === null ? "text-gray-600"
                    : d.staking === 0 ? "text-red-400"
                    : d.staking >= 34 ? "text-green-400"
                    : d.staking >= 25 ? "text-yellow-400"
                    : "text-orange-400";
                  return (
                    <tr key={d.date} className={i % 2 === 0 ? "bg-white/[0.01]" : ""}>
                      <td className="px-6 py-3 font-medium text-gray-200">{fmt(d.date)}</td>
                      <td className="px-6 py-3 text-gray-300">{d.dau?.toLocaleString() ?? <span className="text-gray-700">—</span>}</td>
                      <td className="px-6 py-3 text-gray-300">{d.starts ?? <span className="text-gray-700">—</span>}</td>
                      <td className="px-6 py-3 text-gray-300">{d.completions ?? <span className="text-gray-700">—</span>}</td>
                      <td className={`px-6 py-3 font-bold ${color}`}>
                        {d.staking !== null ? `${d.staking}%` : <span className="text-gray-700 font-normal">—</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">{d.staking !== null ? stakingLabel(d.staking) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}

function round1(n: number) { return Math.round(n * 10) / 10; }
