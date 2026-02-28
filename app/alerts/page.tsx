"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";

interface Alert {
  id: string;
  level: "critical" | "warning" | "info" | "ok";
  title: string;
  description: string;
  metric?: string;
  value?: string;
  threshold?: string;
  timestamp: number;
  agent?: string;
}

const LEVEL_STYLES = {
  critical: { bg: "bg-red-900/20", border: "border-red-700/50", text: "text-red-400", badge: "bg-red-900/40 text-red-300", dot: "bg-red-500", icon: "🚨" },
  warning:  { bg: "bg-orange-900/20", border: "border-orange-700/50", text: "text-orange-400", badge: "bg-orange-900/40 text-orange-300", dot: "bg-orange-500", icon: "⚠️" },
  info:     { bg: "bg-blue-900/20", border: "border-blue-700/50", text: "text-blue-400", badge: "bg-blue-900/40 text-blue-300", dot: "bg-blue-500", icon: "ℹ️" },
  ok:       { bg: "bg-green-900/20", border: "border-green-700/50", text: "text-green-400", badge: "bg-green-900/40 text-green-300", dot: "bg-green-500", icon: "✅" },
};

// Alert rules — thresholds that generate alerts automatically
const STAKING_RULES = [
  { threshold: 34, level: "ok" as const, title: "Staking At Baseline", desc: (rate: number) => `${rate.toFixed(1)}% completion — at or above the 34% baseline. Platform healthy.` },
  { threshold: 25, level: "warning" as const, title: "Staking Below Baseline", desc: (rate: number) => `${rate.toFixed(1)}% completion — ${(34 - rate).toFixed(1)}pp below the 34% baseline. Needs monitoring.` },
  { threshold: 10, level: "critical" as const, title: "Staking Critical", desc: (rate: number) => `${rate.toFixed(1)}% completion — severe degradation. Immediate investigation required.` },
];

function getStakingRule(rate: number) {
  for (const rule of STAKING_RULES) {
    if (rate >= rule.threshold) return rule;
  }
  return STAKING_RULES[STAKING_RULES.length - 1];
}

export default function AlertsPage() {
  const stakingMemories = useQuery(api.memories.getRecent, { type: "staking-metric", limit: 30 });
  const recentMemories = useQuery(api.memories.getRecent, { limit: 50 });

  const alerts = useMemo(() => {
    const result: Alert[] = [];

    // ── Staking alerts ──
    const stakingEntries = (stakingMemories || [])
      .map((m: any) => { try { return { ...JSON.parse(m.content), _ts: m.timestamp }; } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => b.date.localeCompare(a.date));

    const latest = stakingEntries[0];
    const prev = stakingEntries[1];

    if (latest) {
      const rule = getStakingRule(latest.completionRate);
      result.push({
        id: "staking-current",
        level: rule.level,
        title: rule.title,
        description: rule.desc(latest.completionRate),
        metric: "Staking Completion",
        value: `${latest.completionRate.toFixed(1)}%`,
        threshold: "34% baseline",
        timestamp: latest._ts || Date.now(),
        agent: "INSIGHT",
      });

      // Day-over-day drop alert
      if (prev) {
        const delta = latest.completionRate - prev.completionRate;
        if (delta <= -10) {
          result.push({
            id: "staking-drop",
            level: "critical",
            title: "Sharp Staking Drop",
            description: `Staking dropped ${Math.abs(delta).toFixed(1)}pp in one day (${prev.date}: ${prev.completionRate.toFixed(1)}% → ${latest.date}: ${latest.completionRate.toFixed(1)}%).`,
            metric: "Day-over-Day Delta",
            value: `${delta.toFixed(1)}pp`,
            threshold: "−10pp trigger",
            timestamp: latest._ts || Date.now(),
            agent: "INSIGHT",
          });
        } else if (delta >= 10) {
          result.push({
            id: "staking-jump",
            level: "info",
            title: "Strong Staking Recovery",
            description: `Staking jumped +${delta.toFixed(1)}pp day-over-day (${prev.date}: ${prev.completionRate.toFixed(1)}% → ${latest.date}: ${latest.completionRate.toFixed(1)}%).`,
            metric: "Day-over-Day Delta",
            value: `+${delta.toFixed(1)}pp`,
            threshold: "+10pp trigger",
            timestamp: latest._ts || Date.now(),
            agent: "INSIGHT",
          });
        }
      }

      // Zero-completion blackout detection
      if (latest.completionRate === 0) {
        result.push({
          id: "staking-blackout",
          level: "critical",
          title: "Staking Blackout Detected",
          description: "Zero completions recorded. Staking functionality may be non-operational.",
          metric: "Completions",
          value: "0",
          threshold: "> 0 required",
          timestamp: latest._ts || Date.now(),
          agent: "INSIGHT",
        });
      }
    }

    // ── Memory-based alerts ──
    const importantMemories = (recentMemories || []).filter((m: any) =>
      m.metadata?.importance === "critical" || m.metadata?.importance === "high"
    );

    for (const m of importantMemories.slice(0, 5)) {
      result.push({
        id: `memory-${m._id}`,
        level: m.metadata?.importance === "critical" ? "critical" : "warning",
        title: "High-Priority Memory Flagged",
        description: m.content.slice(0, 200) + (m.content.length > 200 ? "..." : ""),
        timestamp: m.timestamp,
        agent: m.agent,
      });
    }

    // ── No staking data alert ──
    if (!stakingEntries.length) {
      result.push({
        id: "no-staking-data",
        level: "info",
        title: "No Staking Data",
        description: "No staking metrics have been logged yet. INSIGHT should post daily staking data to Mission Control.",
        timestamp: Date.now(),
      });
    }

    return result.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2, ok: 3 };
      return order[a.level] - order[b.level];
    });
  }, [stakingMemories, recentMemories]);

  const counts = {
    critical: alerts.filter(a => a.level === "critical").length,
    warning: alerts.filter(a => a.level === "warning").length,
    ok: alerts.filter(a => a.level === "ok").length,
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">🚨 Alerts</h1>
          <p className="text-gray-400 mt-1">Automated anomaly detection across all metrics</p>
        </div>
        <div className="flex gap-3">
          {counts.critical > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm font-medium">
              🚨 {counts.critical} Critical
            </div>
          )}
          {counts.warning > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-orange-900/30 border border-orange-700/40 text-orange-400 text-sm font-medium">
              ⚠️ {counts.warning} Warning
            </div>
          )}
          {counts.critical === 0 && counts.warning === 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-700/40 text-green-400 text-sm font-medium">
              ✅ All Clear
            </div>
          )}
        </div>
      </div>

      {/* Rules reference */}
      <div className="rounded-xl p-4 bg-gray-900/40 border border-gray-800/40 mb-6">
        <h2 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Active Rules</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🚨", label: "Staking Critical", rule: "Rate < 10%", level: "critical" },
            { icon: "⚠️", label: "Staking Below Baseline", rule: "Rate < 25%", level: "warning" },
            { icon: "🚨", label: "Sharp Daily Drop", rule: "Day-over-day ≤ −10pp", level: "critical" },
            { icon: "ℹ️", label: "Strong Recovery", rule: "Day-over-day ≥ +10pp", level: "info" },
            { icon: "🚨", label: "Blackout", rule: "0 completions", level: "critical" },
            { icon: "⚠️", label: "High-Priority Memory", rule: "Importance: critical/high", level: "warning" },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-2 text-xs text-gray-500">
              <span>{r.icon}</span>
              <div>
                <p className="text-gray-400 font-medium">{r.label}</p>
                <p className="text-gray-600">{r.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const style = LEVEL_STYLES[alert.level];
          return (
            <div key={alert.id} className={`rounded-xl p-5 border ${style.bg} ${style.border}`}>
              <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${style.dot}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{style.icon} {alert.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                      {alert.level.toUpperCase()}
                    </span>
                    {alert.agent && (
                      <span className="text-xs text-gray-500">via {alert.agent}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{alert.description}</p>
                  {(alert.metric || alert.value) && (
                    <div className="flex gap-4 mt-3">
                      {alert.metric && (
                        <div className="text-xs">
                          <span className="text-gray-600">Metric: </span>
                          <span className="text-gray-300">{alert.metric}</span>
                        </div>
                      )}
                      {alert.value && (
                        <div className="text-xs">
                          <span className="text-gray-600">Value: </span>
                          <span className={`font-mono font-medium ${style.text}`}>{alert.value}</span>
                        </div>
                      )}
                      {alert.threshold && (
                        <div className="text-xs">
                          <span className="text-gray-600">Threshold: </span>
                          <span className="text-gray-400">{alert.threshold}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(alert.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
