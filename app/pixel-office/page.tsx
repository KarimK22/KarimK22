"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import dynamic from "next/dynamic";
import type { AgentData, AgentState } from "./PixelOfficeCanvas";

// Load canvas component client-side only (no SSR)
const PixelOfficeCanvas = dynamic(() => import("./PixelOfficeCanvas"), { ssr: false });

// ── Agent config ───────────────────────────────────────────────────────────────
const AGENT_CONFIG: Record<string, { label: string; role: string; color: string; desk: {x:number;y:number} }> = {
  main:    { label: "APEX",    role: "CEO",        color: "#FFD700", desk: {x:8,  y:4}  },
  insight: { label: "INSIGHT", role: "Analytics",  color: "#00BFFF", desk: {x:3,  y:4}  },
  vibe:    { label: "VIBE",    role: "Creative",   color: "#FF69B4", desk: {x:13, y:4}  },
  mission: { label: "MISSION", role: "Operations", color: "#9370DB", desk: {x:8,  y:10} },
};

const STATE_COLORS: Record<string, string> = {
  idle: "#666", thinking: "#FFD700", working: "#00FF88", writing: "#00FF88",
  reading: "#00BFFF", executing: "#FF8C00", browsing: "#DA70D6",
  waiting: "#FF4444", error: "#FF0000", active: "#00FF88",
};

export default function PixelOfficePage() {
  const agentStatuses = useQuery(api.agents.getAll);
  const activityFeed  = useQuery(api.agents.getActivityFeed, { limit: 6 });

  // Map Convex agent data to pixel office format
  const agents: AgentData[] = Object.entries(AGENT_CONFIG).map(([id, cfg]) => {
    const convexAgent = agentStatuses?.find(
      (a: any) => a.agentId === id || a.agentId === cfg.label.toLowerCase()
    );

    // Map Convex status → pixel state
    const rawStatus = convexAgent?.status || "idle";
    let state: AgentState = "idle";
    if      (rawStatus === "working" || rawStatus === "active") state = "thinking";
    else if (rawStatus === "idle")   state = "idle";
    else if (rawStatus === "error")  state = "error";
    else if (rawStatus === "offline") state = "idle";

    return {
      id,
      label:    cfg.label,
      role:     cfg.role,
      color:    cfg.color,
      desk:     cfg.desk,
      state,
      activity: convexAgent?.currentTask || "",
    };
  });

  return (
    <div className="p-6" style={{ fontFamily: "monospace", background: "#0a0a0f", minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🕹️ Pixel Office</h1>
          <p className="text-sm text-gray-400 mt-0.5">Live AI Company HQ — animated agent visualization</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #333", color: "#888" }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex gap-6">
        {/* Canvas */}
        <div className="flex-shrink-0">
          <PixelOfficeCanvas agents={agents} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 min-w-[200px]">

          {/* Agent cards */}
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Agents</div>
            <div className="flex flex-col gap-2">
              {agents.map(agent => (
                <div key={agent.id} className="px-3 py-2 rounded-lg"
                     style={{ background: "#111118", border: `1px solid ${agent.color}33`, borderLeft: `3px solid ${agent.color}` }}>
                  <div className="font-bold text-xs" style={{ color: agent.color }}>{agent.label}</div>
                  <div className="text-xs text-gray-500">{agent.role}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{
                            background: STATE_COLORS[agent.state] || "#666",
                            boxShadow: agent.state !== "idle" ? `0 0 4px ${STATE_COLORS[agent.state]}` : "none",
                          }} />
                    <span className="text-xs text-gray-400">{agent.state}</span>
                  </div>
                  {agent.activity && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[160px]" title={agent.activity}>
                      {agent.activity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          {activityFeed && activityFeed.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Recent Activity</div>
              <div className="flex flex-col gap-1.5">
                {activityFeed.map((entry: any) => {
                  const cfg = Object.values(AGENT_CONFIG).find(c => c.label === entry.agent);
                  const color = cfg?.color || "#888";
                  return (
                    <div key={entry._id} className="px-2 py-1.5 rounded text-xs"
                         style={{ background: "#111118", border: "1px solid #222" }}>
                      <span className="font-medium" style={{ color }}>{entry.agent}</span>
                      <span className="text-gray-500 ml-1">·</span>
                      <span className="text-gray-400 ml-1">{entry.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">States</div>
            <div className="flex flex-col gap-1">
              {Object.entries(STATE_COLORS).filter(([s]) => !["active","working"].includes(s)).map(([state, color]) => (
                <div key={state} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />
                  {state}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
