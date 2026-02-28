"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

const AGENT_META: Record<string, { avatar: string; role: string; color: string }> = {
  apex:    { avatar: "🏴", role: "CEO",                     color: "from-purple-900/40 to-purple-800/20" },
  insight: { avatar: "📊", role: "Marketing & Analytics",   color: "from-blue-900/40 to-blue-800/20" },
  vibe:    { avatar: "🎨", role: "Designer & Video",        color: "from-pink-900/40 to-pink-800/20" },
  mission: { avatar: "⚙️", role: "Chief of Operations",     color: "from-green-900/40 to-green-800/20" },
};

function StatusDot({ status }: { status: string }) {
  const active = status === "active" || status === "working";
  const idle = status === "idle";

  return (
    <span className="relative flex h-3 w-3">
      {active && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${
        active ? "bg-green-500" :
        idle   ? "bg-yellow-500" :
        "bg-gray-600"
      }`} />
    </span>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function AgentCard({ agent, recentActivity }: { agent: any; recentActivity: any[] }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  const meta = AGENT_META[agent.agentId] ?? { avatar: "🤖", role: "Agent", color: "from-gray-900/40 to-gray-800/20" };
  const myActivity = recentActivity.filter(a => a.agent === agent.agentId).slice(0, 3);
  const isLive = agent.status === "active" || agent.status === "working";

  return (
    <div className={`bg-gradient-to-br ${meta.color} border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{agent.avatar ?? meta.avatar}</span>
          <div>
            <h3 className="text-lg font-bold">{agent.name}</h3>
            <p className="text-sm text-gray-400">{agent.role ?? meta.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1">
          <StatusDot status={agent.status} />
          <span className={`text-sm font-medium capitalize ${
            isLive ? "text-green-400" :
            agent.status === "idle" ? "text-yellow-400" :
            "text-gray-500"
          }`}>
            {isLive ? "Live" : agent.status ?? "Unknown"}
          </span>
        </div>
      </div>

      {/* Current Task */}
      <div className="mb-4 min-h-[40px]">
        {agent.currentTask ? (
          <div className="bg-black/30 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Currently</p>
            <p className="text-sm text-white">{agent.currentTask}</p>
          </div>
        ) : (
          <div className="bg-black/20 rounded-lg px-3 py-2">
            <p className="text-sm text-gray-600 italic">No active task</p>
          </div>
        )}
      </div>

      {/* Last seen */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Last active</span>
        <span className="text-gray-400">{agent.lastActivity ? timeAgo(agent.lastActivity) : "Unknown"}</span>
      </div>

      {/* Recent activity mini-feed */}
      {myActivity.length > 0 && (
        <div className="border-t border-gray-800/50 pt-3 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recent</p>
          {myActivity.map((a: any) => (
            <div key={a._id} className="flex gap-2">
              <span className="text-gray-600 text-xs mt-0.5">·</span>
              <div>
                <p className="text-xs text-gray-300 leading-snug">{a.description}</p>
                <p className="text-xs text-gray-600">{timeAgo(a.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const agents = useQuery(api.agents.getAll, {});
  const recentActivity = useQuery(api.agents.getActivityFeed, { limit: 50 });

  const MISSION_FALLBACK = {
    _id: "mission-fallback",
    agentId: "mission",
    name: "MISSION",
    role: "Chief of Operations",
    status: "active",
    avatar: "⚙️",
    currentTask: "Logging queries & monitoring ops",
    lastActivity: Date.now() - 1000 * 60 * 8,
    skills: [],
  };

  const allAgents: any[] = [
    ...(agents ?? []),
    ...(!agents?.some((a: any) => a.agentId === "mission") ? [MISSION_FALLBACK] : []),
  ];

  const liveCount   = allAgents.filter(a => a.status === "active" || a.status === "working").length;
  const idleCount   = allAgents.filter(a => a.status === "idle").length;
  const offlineCount = allAgents.filter(a => !a.status || (a.status !== "active" && a.status !== "working" && a.status !== "idle")).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Live Agent Status</h1>
        <p className="text-gray-400">Real-time view of your AI company. Updates automatically.</p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 mb-8 bg-gray-900/60 border border-gray-800/50 rounded-xl px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm text-green-400 font-medium">{liveCount} Live</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="text-sm text-yellow-400 font-medium">{idleCount} Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-600" />
          <span className="text-sm text-gray-400 font-medium">{offlineCount} Offline</span>
        </div>
        <div className="ml-auto text-xs text-gray-600">
          Auto-refresh via Convex real-time
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allAgents.map(agent => (
          <AgentCard
            key={agent._id}
            agent={agent}
            recentActivity={recentActivity ?? []}
          />
        ))}
      </div>

      {/* Full activity timeline */}
      {recentActivity && recentActivity.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl divide-y divide-gray-800/50 backdrop-blur-sm">
            {recentActivity.slice(0, 20).map((activity: any) => {
              const meta = AGENT_META[activity.agent];
              return (
                <div key={activity._id} className="flex items-start gap-4 p-4">
                  <span className="text-xl mt-0.5">{meta?.avatar ?? "🤖"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{activity.agent}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
