"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";

// ─────────────────────────────────────────────
// Metric definitions — weights must sum to 100
// ─────────────────────────────────────────────
const METRIC_WEIGHTS = {
  staking:    { label: "Staking Rate",     weight: 40, icon: "🔒", baseline: 0.341 },
  dau:        { label: "Daily Active Users",weight: 25, icon: "👤", baseline: null  },
  retention:  { label: "Retention",        weight: 20, icon: "🔄", baseline: null  },
  engagement: { label: "Engagement",       weight: 15, icon: "⚡", baseline: null  },
};

// Placeholder values until INSIGHT populates them
const PLACEHOLDER_METRICS: Record<string, { value: number; score: number; delta: number | null; note: string }> = {
  dau:        { value: 0,    score: 70, delta: null,  note: "Pending INSIGHT data" },
  retention:  { value: 0,    score: 68, delta: null,  note: "Pending INSIGHT data" },
  engagement: { value: 0,    score: 74, delta: null,  note: "Pending INSIGHT data" },
};

function scoreGrade(score: number) {
  if (score >= 90) return { grade: "A", label: "Excellent",    color: "text-green-400" };
  if (score >= 75) return { grade: "B", label: "Good",         color: "text-blue-400"  };
  if (score >= 60) return { grade: "C", label: "Fair",         color: "text-yellow-400"};
  if (score >= 40) return { grade: "D", label: "Warning",      color: "text-orange-400"};
  return             { grade: "F", label: "Critical",  color: "text-red-500"   };
}

// Converts a completion rate (0–1) to a 0–100 score relative to baseline
function stakingScore(rate: number, baseline: number) {
  if (rate === 0) return 0; // blackout
  // 100 = at or above baseline; drops proportionally below
  return Math.min(100, Math.round((rate / baseline) * 100));
}

// SVG circular gauge
function CircleGauge({ score }: { score: number }) {
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const { grade, label, color } = scoreGrade(score);

  const strokeColor =
    score >= 90 ? "#4ade80" :
    score >= 75 ? "#60a5fa" :
    score >= 60 ? "#facc15" :
    score >= 40 ? "#fb923c" :
    "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" className="transform -rotate-90">
        {/* Track */}
        <circle cx="110" cy="110" r={r} fill="none" stroke="#1f2937" strokeWidth="14" />
        {/* Progress */}
        <circle
          cx="110" cy="110" r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="-mt-[130px] mb-[110px] flex flex-col items-center">
        <span className={`text-6xl font-bold ${color}`}>{score}</span>
        <span className={`text-lg font-semibold ${color}`}>{grade}</span>
        <span className="text-sm text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  );
}

function MetricRow({
  icon, label, weight, score, value, delta, note, isLive
}: {
  icon: string; label: string; weight: number; score: number;
  value?: number; delta: number | null; note?: string; isLive: boolean;
}) {
  const { color } = scoreGrade(score);
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-800/50 last:border-0">
      <span className="text-2xl w-8 text-center">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{label}</span>
          <span className="text-xs text-gray-600 bg-gray-800 rounded px-1.5 py-0.5">{weight}% weight</span>
          {!isLive && (
            <span className="text-xs text-yellow-600 bg-yellow-900/30 rounded px-1.5 py-0.5">estimate</span>
          )}
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${
              score >= 90 ? "bg-green-500" :
              score >= 75 ? "bg-blue-500" :
              score >= 60 ? "bg-yellow-500" :
              score >= 40 ? "bg-orange-500" :
              "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        {note && <p className="text-xs text-gray-600 mt-1">{note}</p>}
      </div>
      <div className="text-right min-w-[60px]">
        <span className={`text-xl font-bold ${color}`}>{score}</span>
        {delta !== null && (
          <p className={`text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HealthPage() {
  const memories = useQuery(api.memories.getRecent, { limit: 100 });

  const { stakingData, healthScore, metrics } = useMemo(() => {
    if (!memories) return { stakingData: null, healthScore: null, metrics: null };

    // Pull staking entries
    const stakingEntries = memories
      .filter((m: any) => m.type === "staking-metric")
      .map((m: any) => {
        try { return { ...JSON.parse(m.content), _ts: m._creationTime }; }
        catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latest = stakingEntries[0] ?? null;
    const prev   = stakingEntries[1] ?? null;

    const stakingRate = latest ? (latest.completionRate ?? 0) : 0;
    const prevRate    = prev   ? (prev.completionRate   ?? 0) : null;

    const baseline = METRIC_WEIGHTS.staking.baseline;
    const sScore = latest ? stakingScore(stakingRate, baseline) : 50;
    const sDelta = prevRate !== null ? (stakingRate - prevRate) * 100 : null;

    const allMetrics = {
      staking: {
        score: sScore,
        value: Math.round(stakingRate * 100),
        delta: sDelta,
        note: latest ? `${latest.completions}/${latest.starts} completions — ${latest.date}` : undefined,
        isLive: !!latest,
      },
      dau: {
        ...PLACEHOLDER_METRICS.dau,
        isLive: false,
      },
      retention: {
        ...PLACEHOLDER_METRICS.retention,
        isLive: false,
      },
      engagement: {
        ...PLACEHOLDER_METRICS.engagement,
        isLive: false,
      },
    };

    // Weighted composite
    const composite = Math.round(
      Object.entries(METRIC_WEIGHTS).reduce((sum, [key, meta]) => {
        const m = allMetrics[key as keyof typeof allMetrics];
        return sum + (m.score * meta.weight) / 100;
      }, 0)
    );

    return { stakingData: { latest, entries: stakingEntries }, healthScore: composite, metrics: allMetrics };
  }, [memories]);

  const { grade, label, color } = healthScore !== null ? scoreGrade(healthScore) : { grade: "—", label: "Loading", color: "text-gray-400" };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Lingo Health Score</h1>
        <p className="text-gray-400">Composite platform health — staking, users, retention, engagement.</p>
      </div>

      {/* Main gauge + score breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Gauge */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm flex flex-col items-center justify-center">
          {healthScore !== null ? (
            <>
              <CircleGauge score={healthScore} />
              <p className="text-sm text-gray-500 mt-2">Composite Health Score</p>
              <p className="text-xs text-gray-600 mt-1">Weighted across 4 metrics</p>
            </>
          ) : (
            <p className="text-gray-500 animate-pulse">Calculating…</p>
          )}
        </div>

        {/* Summary stats */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-semibold mb-2">Breakdown</h2>

          {metrics && Object.entries(METRIC_WEIGHTS).map(([key, meta]) => {
            const m = metrics[key as keyof typeof metrics];
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{meta.icon}</span>
                  <span className="text-sm text-gray-300">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!m.isLive && (
                    <span className="text-xs text-yellow-700">~</span>
                  )}
                  <span className={`text-sm font-bold ${scoreGrade(m.score).color}`}>
                    {m.score}
                  </span>
                  <span className="text-xs text-gray-600">× {meta.weight}%</span>
                </div>
              </div>
            );
          })}

          <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Overall</span>
            <span className={`text-xl font-bold ${color}`}>{healthScore ?? "—"} / 100</span>
          </div>

          <p className="text-xs text-gray-600 mt-2">
            ⚠️ DAU, Retention, Engagement are estimates. INSIGHT will update with live Mixpanel data.
          </p>
        </div>
      </div>

      {/* Metric detail rows */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm mb-8">
        <h2 className="text-lg font-semibold mb-2">Metric Detail</h2>
        {metrics && Object.entries(METRIC_WEIGHTS).map(([key, meta]) => {
          const m = metrics[key as keyof typeof metrics];
          return (
            <MetricRow
              key={key}
              icon={meta.icon}
              label={meta.label}
              weight={meta.weight}
              score={m.score}
              delta={m.delta}
              note={(m as any).note}
              isLive={m.isLive}
            />
          );
        })}
      </div>

      {/* Staking history mini-chart */}
      {stakingData && stakingData.entries.length > 1 && (
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4">Staking Rate History</h2>
          <div className="space-y-2">
            {[...stakingData.entries].reverse().map((entry: any) => {
              const rate = Math.round((entry.completionRate ?? 0) * 100);
              const pct  = Math.min(100, (rate / 50) * 100); // 50% = full bar
              const isToday = entry.date === new Date().toISOString().slice(0, 10);
              return (
                <div key={entry.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{entry.date}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${rate === 0 ? "bg-red-700" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-10 text-right ${
                    rate === 0 ? "text-red-400" :
                    rate >= 34 ? "text-green-400" : "text-gray-300"
                  }`}>{rate}%</span>
                  {isToday && <span className="text-xs text-blue-400">today</span>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-4">Baseline: 34.1% (Feb 19)</p>
        </div>
      )}
    </div>
  );
}
