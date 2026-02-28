"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AGENTS = [
  { id: "all", label: "All Agents", color: "#b8a070", avatar: "🏢" },
  { id: "apex-ceo", label: "APEX", color: "#10b981", avatar: "🏴" },
  { id: "insight", label: "INSIGHT", color: "#3b82f6", avatar: "📊" },
  { id: "vibe", label: "VIBE", color: "#f59e0b", avatar: "🎨" },
  { id: "mission-operator", label: "MISSION", color: "#06b6d4", avatar: "📊" },
];

const ACTION_ICONS: Record<string, string> = {
  created_task: "✅",
  completed_task: "🏁",
  logged_query: "📝",
  session_start: "🟢",
  session_end: "🔴",
  posted_content: "📤",
  created_report: "📊",
  default: "⚡",
};

export default function LogsPage() {
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [view, setView] = useState<"activity" | "memory">("activity");

  const activityLogs = useQuery(api.agents.getActivityFeed, { limit: 100 });
  const memories = useQuery(api.memories.getRecent, {
    agent: selectedAgent === "all" ? undefined : selectedAgent,
    limit: 100,
  });

  const filteredActivity = (activityLogs || []).filter(
    (e: any) => selectedAgent === "all" || e.agent === selectedAgent
  );

  const agentInfo = (id: string) =>
    AGENTS.find(a => a.id === id) || { color: "#b8a070", avatar: "⚡", label: id };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">🗂️ Agent Logs</h1>
        <p className="text-gray-400 mt-1">Full activity and memory trail across all agents</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        {/* Agent Filter */}
        <div className="flex gap-2 flex-wrap">
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(a.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                selectedAgent === a.id
                  ? "text-white border-current"
                  : "text-gray-500 border-gray-800 hover:text-gray-300"
              }`}
              style={selectedAgent === a.id ? { color: a.color, borderColor: a.color, background: `${a.color}15` } : {}}
            >
              {a.avatar} {a.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 p-1 bg-gray-900/50 rounded-lg border border-gray-800/50">
          {(["activity", "memory"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                view === v ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              {v === "activity" ? "⚡ Activity" : "🧠 Memory"}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      {view === "activity" && (
        <div className="space-y-2">
          {filteredActivity.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="text-4xl mb-3">📭</div>
              <p>No activity logged yet.</p>
            </div>
          ) : filteredActivity.map((entry: any) => {
            const agent = agentInfo(entry.agent);
            const icon = ACTION_ICONS[entry.action] || ACTION_ICONS.default;
            return (
              <div key={entry._id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/40 hover:border-gray-700/60 transition-all">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                     style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: agent.color }}>{agent.label}</span>
                    <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-gray-800/50">
                      {entry.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{entry.description}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(entry.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Memory Log */}
      {view === "memory" && (
        <div className="space-y-2">
          {(memories || []).length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="text-4xl mb-3">🧠</div>
              <p>No memory entries found.</p>
            </div>
          ) : (memories || []).map((m: any) => {
            const agent = agentInfo(m.agent || "");
            return (
              <div key={m._id}
                className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/40 hover:border-gray-700/60 transition-all">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    {m.agent && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                        {agent.avatar} {agent.label}
                      </span>
                    )}
                    <span className="text-xs text-gray-600 capitalize px-2 py-0.5 rounded-full bg-gray-800/50">
                      {m.type}
                    </span>
                    {m.metadata?.importance && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.metadata.importance === "critical" ? "bg-red-900/30 text-red-400" :
                        m.metadata.importance === "high" ? "bg-orange-900/30 text-orange-400" :
                        "bg-gray-800/50 text-gray-500"
                      }`}>{m.metadata.importance}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {new Date(m.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{m.content}</p>
                {m.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {m.tags.map((t: string) => (
                      <span key={t} className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-gray-800/30 border border-gray-700/30">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
