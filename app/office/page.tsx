"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function OfficePage() {
  const agents = [
    {
      _id: "apex-001",
      agentId: "main",
      name: "APEX",
      role: "Chief Executive Officer",
      avatar: "🏴",
      status: "working",
      currentTask: "Strategic planning & coordination",
      lastActivity: Date.now(),
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.4)",
      screenType: "executive",
    },
    {
      _id: "forge-001",
      agentId: "forge",
      name: "FORGE",
      role: "Agent Improvement",
      avatar: "🔨",
      status: "idle",
      currentTask: "Sunday 23:00 CET weekly cycle",
      lastActivity: Date.now(),
      color: "#f97316",
      glowColor: "rgba(249, 115, 22, 0.4)",
      screenType: "executive",
    },
    {
      _id: "insight-001",
      agentId: "insight",
      name: "INSIGHT",
      role: "Marketing Analytics",
      avatar: "👁️",
      status: "working",
      currentTask: "Analyzing user metrics & trends",
      lastActivity: Date.now(),
      color: "#3b82f6",
      glowColor: "rgba(59, 130, 246, 0.4)",
      screenType: "analytics",
    },
    {
      _id: "vibe-001",
      agentId: "vibe",
      name: "VIBE",
      role: "Chief Creative Officer",
      avatar: "🎨",
      status: "working",
      currentTask: "Office redesign & brand assets",
      lastActivity: Date.now(),
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.4)",
      screenType: "creative",
    },
    {
      _id: "mission-001",
      agentId: "mission",
      name: "MISSION",
      role: "Chief of Operations",
      avatar: "📊",
      status: "working",
      currentTask: "Monitoring systems & ops",
      lastActivity: Date.now(),
      color: "#06b6d4",
      glowColor: "rgba(6, 182, 212, 0.4)",
      screenType: "monitoring",
    },
    {
      _id: "scout-001",
      agentId: "scout",
      name: "SCOUT",
      role: "Head of Growth",
      avatar: "🦅",
      status: "working",
      currentTask: "Daily Twitter intel & drafts",
      lastActivity: Date.now(),
      color: "#8b5cf6",
      glowColor: "rgba(139, 92, 246, 0.4)",
      screenType: "monitoring",
    },
  ];

  const [time, setTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const activityFeed = useQuery(api.agents.getActivityFeed, { limit: 8 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const isEvening = hour >= 18 && hour < 22;

  // 3-row startup office layout
  // Row 1: APEX (CEO, center — slightly bigger desk)
  // Row 2: FORGE (left), INSIGHT (center), VIBE (right)
  // Row 3: MISSION (left), SCOUT (right)
  const officeLayout = [
    { id: "main",    x: 50, y: 19, desk: "CEO Corner",         z: 2, size: "lg" as const, popupUp: false },
    { id: "forge",   x: 21, y: 47, desk: "Forge Lab",          z: 1, size: "sm" as const, popupUp: false },
    { id: "insight", x: 50, y: 47, desk: "Analytics Hub",      z: 1, size: "sm" as const, popupUp: false },
    { id: "vibe",    x: 79, y: 47, desk: "Creative Studio",    z: 1, size: "sm" as const, popupUp: false },
    { id: "mission", x: 32, y: 76, desk: "Ops Center",         z: 0, size: "sm" as const, popupUp: true  },
    { id: "scout",   x: 68, y: 76, desk: "Scout Station",      z: 0, size: "sm" as const, popupUp: true  },
  ];

  // Tiny screen content — realistic minimal lines
  const getScreenContent = (screenType: string, color: string, isWorking: boolean) => {
    if (!isWorking) return (
      <div style={{ width: "100%", height: "100%", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#222" }} />
      </div>
    );

    const lines: number[] = {
      executive:  [75, 50, 85, 40],
      analytics:  [60, 80, 45, 90],
      monitoring: [70, 55, 90, 35],
      creative:   [80, 60, 70, 50],
    }[screenType] || [70, 55, 80, 45];

    return (
      <div style={{ width: "100%", height: "100%", background: "#080808", padding: "2px 3px" }}>
        {lines.map((w, i) => (
          <div key={i} style={{
            width: `${w}%`, height: 2,
            background: color,
            opacity: 0.45 + i * 0.08,
            marginBottom: 2,
            borderRadius: 1,
            animation: `linePulse 2.2s ease-in-out ${i * 0.35}s infinite`,
          }} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">🏢 The Office</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            APEX AI Company — Live Floor View
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
               style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "dot-pulse 1.8s ease-in-out infinite" }} />
            Live
          </div>
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#6b7280" }}>
            <span>{isDaytime ? "☀️" : isEvening ? "🌆" : "🌙"}</span>
            <span>{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* ── Office Floor Plan ── */}
      <div className="rounded-2xl border mb-6"
           style={{
             borderColor: "rgba(255,255,255,0.07)",
             background: "#09090b",
             boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
             position: "relative",
           }}>

        {/* Top label bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b"
             style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Open Office — Floor 1
            </div>
            <div className="flex items-center gap-1">
              {["EXEC", "TEAM", "OPS"].map((l) => (
                <span key={l} style={{
                  fontSize: 9, color: "#1f2937", fontFamily: "monospace",
                  padding: "1px 5px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)",
                }}>{l}</span>
              ))}
            </div>
          </div>
          {/* Agent dots legend */}
          <div className="flex items-center gap-2">
            {agents.map((a) => (
              <div key={a._id} className="flex items-center gap-1">
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: a.color,
                  boxShadow: a.status === "working" ? `0 0 4px ${a.color}` : "none",
                  opacity: a.status === "working" ? 1 : 0.25,
                }} />
                <span style={{ fontSize: 9, color: "#374151", fontFamily: "monospace" }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Office area */}
        <div className="relative" style={{ height: 600, overflow: "visible" }}>

          {/* Floor tiles */}
          <div className="absolute inset-0 rounded-b-2xl overflow-hidden pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)
            `,
            backgroundSize: "52px 52px",
          }} />

          {/* Very subtle zone backgrounds for rows */}
          <div className="absolute pointer-events-none" style={{
            top: "2%", left: "28%", right: "28%", height: "30%",
            background: "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div className="absolute pointer-events-none" style={{
            top: "30%", left: "5%", right: "5%", height: "32%",
            background: "radial-gradient(ellipse, rgba(59,130,246,0.03) 0%, transparent 70%)",
          }} />

          {/* Row section dividers (hairlines) */}
          <div className="absolute pointer-events-none" style={{ top: "35%", left: "8%", right: "8%", height: 1, background: "rgba(255,255,255,0.025)" }} />
          <div className="absolute pointer-events-none" style={{ top: "62%", left: "8%", right: "8%", height: 1, background: "rgba(255,255,255,0.025)" }} />

          {/* Row labels — left rail */}
          {[
            { label: "EXEC", y: "19%" },
            { label: "TEAM", y: "47%" },
            { label: "OPS",  y: "76%" },
          ].map(({ label, y }) => (
            <div key={label} className="absolute pointer-events-none" style={{
              left: 12, top: y, transform: "translateY(-50%)",
              fontSize: 8, color: "#1f2937", fontFamily: "monospace", letterSpacing: "0.15em", writingMode: "vertical-lr",
            }}>
              {label}
            </div>
          ))}

          {/* ── Office props ── */}

          {/* Plants — corners */}
          <div className="absolute pointer-events-none" style={{ top: 10, right: 18, fontSize: 24, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))", animation: "sway 4s ease-in-out infinite" }}>🪴</div>
          <div className="absolute pointer-events-none" style={{ bottom: 16, left: 16, fontSize: 22, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))", animation: "sway 3.8s ease-in-out infinite 0.4s" }}>🌿</div>
          <div className="absolute pointer-events-none" style={{ bottom: 16, right: 16, fontSize: 20, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))", animation: "sway 4.2s ease-in-out infinite 0.8s" }}>🪴</div>
          <div className="absolute pointer-events-none" style={{ top: 10, left: 18, fontSize: 20, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))", animation: "sway 3.6s ease-in-out infinite 0.2s" }}>🌿</div>

          {/* Coffee station */}
          <div className="absolute pointer-events-none flex flex-col items-center" style={{ top: "42%", left: "7%", transform: "translateY(-50%)" }}>
            <div style={{ fontSize: 18, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>☕</div>
            <div style={{ fontSize: 8, color: "#1f2937", fontFamily: "monospace", marginTop: 2 }}>coffee</div>
          </div>

          {/* Meeting table — center, between rows 2 and 3 */}
          <div className="absolute pointer-events-none" style={{
            left: "50%", top: "62%",
            transform: "translate(-50%, -50%)",
          }}>
            <div style={{
              width: 86, height: 52,
              background: "linear-gradient(145deg, #1a1612, #0f0d0a)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 3,
            }}>
              <div style={{ fontSize: 14 }}>📋</div>
              <div style={{ fontSize: 7, color: "#374151", fontFamily: "monospace" }}>meeting</div>
            </div>
            {/* Chairs around table */}
            {[
              { top: -8, left: "50%", transform: "translateX(-50%)" },
              { bottom: -8, left: "50%", transform: "translateX(-50%)" },
              { left: -8, top: "50%", transform: "translateY(-50%)" },
              { right: -8, top: "50%", transform: "translateY(-50%)" },
            ].map((pos, i) => (
              <div key={i} style={{
                position: "absolute", ...pos,
                width: 14, height: 6,
                background: "#161412",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 2,
              }} />
            ))}
          </div>

          {/* ── Agent Workstations ── */}
          {officeLayout.map((station) => {
            const agent = agents.find((a) => a.agentId === station.id);
            if (!agent) return null;

            const isWorking = agent.status === "working";
            const isIdle    = agent.status === "idle";
            const isSelected = selectedAgent === station.id;
            const isLg = station.size === "lg";

            // Desk dimensions
            const deskW  = isLg ? 128 : 102;
            const deskH  = isLg ? 84  : 67;
            const monW   = isLg ? 50  : 38;
            const monH   = isLg ? 32  : 24;
            const kbW    = isLg ? 56  : 44;

            return (
              <div key={station.id}
                   className="absolute cursor-pointer"
                   style={{
                     left: `${station.x}%`,
                     top: `${station.y}%`,
                     transform: "translate(-50%, -50%)",
                     zIndex: isSelected ? 100 : 10 + station.z,
                   }}
                   onClick={() => setSelectedAgent(isSelected ? null : station.id)}>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.25s", transform: isSelected ? "translateY(-3px)" : undefined }}
                     className="group hover:-translate-y-1">

                  {/* Floor glow pool */}
                  <div style={{
                    position: "absolute",
                    width: deskW + 50, height: deskH + 30,
                    top: -18, left: -(25),
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${agent.glowColor}, transparent 70%)`,
                    filter: "blur(14px)",
                    opacity: isWorking ? 0.55 : 0.1,
                    pointerEvents: "none",
                    transition: "opacity 0.4s",
                  }} />

                  {/* ── Desk (top-down) ── */}
                  <div style={{
                    position: "relative",
                    width: deskW,
                    height: deskH,
                    background: "linear-gradient(148deg, #1d1b18, #111009)",
                    border: `1.5px solid ${isWorking ? agent.color + "70" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 6,
                    boxShadow: isWorking
                      ? `0 0 0 1px ${agent.color}12, 0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)`
                      : "0 6px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}>

                    {/* Desk surface sheen */}
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "inherit",
                      background: "linear-gradient(140deg, rgba(255,255,255,0.03) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }} />

                    {/* Monitor bezel */}
                    <div style={{
                      position: "absolute",
                      top: 7,
                      left: "50%", transform: "translateX(-50%)",
                      width: monW, height: monH,
                      background: "#060606",
                      border: "1px solid #191919",
                      borderRadius: 2,
                      boxShadow: isWorking ? `0 0 6px ${agent.glowColor}` : "none",
                    }}>
                      {/* Screen content */}
                      <div style={{ position: "absolute", inset: "1.5px", overflow: "hidden", borderRadius: 1 }}>
                        {getScreenContent(agent.screenType, agent.color, isWorking)}
                      </div>
                      {/* Monitor stand — tiny indicator */}
                      <div style={{
                        position: "absolute", bottom: -3, left: "50%", transform: "translateX(-50%)",
                        width: 6, height: 2,
                        background: "#111",
                        borderRadius: 1,
                      }} />
                    </div>

                    {/* Keyboard */}
                    <div style={{
                      position: "absolute",
                      bottom: 9,
                      left: "50%", transform: "translateX(-50%)",
                      width: kbW, height: 7,
                      background: "#0c0c0c",
                      border: "0.5px solid #1e1e1e",
                      borderRadius: 1,
                    }}>
                      {/* Key rows hint */}
                      <div style={{ display: "flex", gap: 1, padding: "1px 2px", opacity: 0.25 }}>
                        {Array(8).fill(0).map((_, i) => (
                          <div key={i} style={{ flex: 1, height: 2, background: "#555", borderRadius: 0.5 }} />
                        ))}
                      </div>
                    </div>

                    {/* Mouse */}
                    <div style={{
                      position: "absolute",
                      bottom: 9, right: isLg ? 8 : 6,
                      width: 6, height: 9,
                      background: "#0c0c0c",
                      border: "0.5px solid #1e1e1e",
                      borderRadius: 2,
                    }} />

                    {/* Status LED (top-right corner) */}
                    <div style={{
                      position: "absolute", top: 5, right: 5,
                      width: 5, height: 5, borderRadius: "50%",
                      background: isWorking ? agent.color : isIdle ? "#f59e0b" : "#2d2d2d",
                      boxShadow: isWorking ? `0 0 5px ${agent.color}` : "none",
                      animation: isWorking ? "dot-pulse 2s ease-in-out infinite" : "none",
                    }} />

                    {/* Selected ring */}
                    {isSelected && (
                      <div style={{
                        position: "absolute", inset: -3, borderRadius: 9,
                        border: `1.5px solid ${agent.color}`,
                        boxShadow: `0 0 14px ${agent.glowColor}`,
                        pointerEvents: "none",
                        animation: "ring-pulse 1.5s ease-in-out infinite",
                      }} />
                    )}
                  </div>

                  {/* Chair */}
                  <div style={{
                    width: isLg ? 38 : 30, height: 8,
                    marginTop: 3,
                    background: "#1a1614",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }} />

                  {/* Agent label */}
                  <div style={{ textAlign: "center", marginTop: 5, userSelect: "none" }}>
                    <div style={{
                      fontSize: isLg ? 12 : 10,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: agent.color + "aa",
                      marginTop: 1,
                      letterSpacing: "0.03em",
                    }}>
                      {agent.role}
                    </div>
                    <div style={{
                      marginTop: 4,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: isWorking ? agent.color : isIdle ? "#f59e0b" : "#374151",
                        boxShadow: isWorking ? `0 0 4px ${agent.color}` : "none",
                      }} />
                      <span style={{ fontSize: 9, color: "#4b5563", textTransform: "capitalize" }}>
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  {/* ── Selected Detail Panel ── */}
                  {isSelected && (
                    <div style={{
                      position: "absolute",
                      ...(station.popupUp
                        ? { bottom: "100%", marginBottom: 10 }
                        : { top: "100%", marginTop: 10 }),
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 230,
                      background: "rgba(9,9,11,0.98)",
                      border: `1px solid ${agent.color}40`,
                      borderRadius: 12,
                      padding: 14,
                      backdropFilter: "blur(24px)",
                      boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), 0 0 28px ${agent.glowColor}20`,
                      zIndex: 200,
                    }}>
                      {/* Panel header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: `${agent.color}18`, border: `1px solid ${agent.color}45`,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                          }}>
                            {agent.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{agent.name}</div>
                            <div style={{ fontSize: 10, color: agent.color }}>{agent.role}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAgent(null); }}
                          style={{ color: "#4b5563", fontSize: 14, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 2 }}>
                          ✕
                        </button>
                      </div>
                      {/* Divider */}
                      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${agent.color}35, transparent)`, marginBottom: 10 }} />
                      {/* Info rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 11 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4b5563" }}>Status</span>
                          <span style={{ color: agent.color, fontWeight: 600, textTransform: "capitalize" }}>{agent.status}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4b5563" }}>Station</span>
                          <span style={{ color: "#9ca3af" }}>{station.desk}</span>
                        </div>
                        {agent.currentTask && (
                          <div>
                            <div style={{ color: "#4b5563", marginBottom: 4 }}>Current task</div>
                            <div style={{ color: "#d1d5db", lineHeight: 1.5 }}>{agent.currentTask}</div>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#4b5563" }}>Last active</span>
                          <span style={{ color: "#6b7280" }}>{new Date(agent.lastActivity).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom panels ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Live Activity */}
        <div className="rounded-xl p-5" style={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <h3 style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📋</span> Live Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 192, overflowY: "auto" }}>
            {activityFeed && activityFeed.length > 0 ? activityFeed.map((entry: any) => {
              const agentColors: Record<string, string> = {
                APEX: "#10b981", INSIGHT: "#3b82f6", VIBE: "#f59e0b",
                MISSION: "#06b6d4", SCOUT: "#8b5cf6", FORGE: "#f97316",
              };
              const c = agentColors[entry.agent] || "#6b7280";
              return (
                <div key={entry._id} style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "6px 10px", borderRadius: 7,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: c }}>{entry.agent}</span>
                    <span style={{ fontSize: 11, color: "#374151", margin: "0 4px" }}>·</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{entry.description}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#1f2937", flexShrink: 0 }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            }) : (
              <div style={{ padding: "24px 0", textAlign: "center", fontSize: 11, color: "#1f2937" }}>
                Activity appears as agents work
              </div>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="rounded-xl p-5" style={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <h3 style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👥</span> Team Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {agents.map((agent) => {
              const isWorking = agent.status === "working";
              return (
                <div key={agent._id}
                     style={{
                       display: "flex", alignItems: "center", justifyContent: "space-between",
                       padding: "7px 11px", borderRadius: 8, cursor: "pointer",
                       background: "rgba(255,255,255,0.02)",
                       border: "1px solid rgba(255,255,255,0.04)",
                       transition: "border-color 0.2s",
                     }}
                     onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${agent.color}35`)}
                     onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)")}
                     onClick={() => setSelectedAgent(agent.agentId)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: `${agent.color}15`, border: `1px solid ${agent.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                    }}>
                      {agent.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{agent.name}</div>
                      <div style={{ fontSize: 10, color: "#4b5563" }}>{agent.role}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: isWorking ? agent.color : agent.status === "idle" ? "#f59e0b" : "#374151",
                      boxShadow: isWorking ? `0 0 5px ${agent.color}` : "none",
                    }} />
                    <span style={{ fontSize: 10, color: "#4b5563", textTransform: "capitalize" }}>{agent.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: "Active",  count: agents.filter((a) => a.status === "working").length,  color: "#10b981" },
              { label: "Idle",    count: agents.filter((a) => a.status === "idle").length,     color: "#f59e0b" },
              { label: "Offline", count: agents.filter((a) => a.status === "offline").length,  color: "#374151" },
            ].map(({ label, count, color }) => (
              <div key={label} style={{
                textAlign: "center", padding: "8px 4px", borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes linePulse {
          0%, 100% { opacity: var(--op, 0.5); }
          50% { opacity: calc(var(--op, 0.5) * 0.5); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg) translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
