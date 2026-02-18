"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function OfficePage() {
  const agents = useQuery(api.agents.getAll, {});
  const recentActivity = useQuery(api.agents.getActivityFeed, { limit: 5 });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const officeLayout = [
    { id: "main", x: 20, y: 30, desk: "Executive Desk" },
    { id: "insight", x: 60, y: 30, desk: "Analytics Station" },
    { id: "vibe", x: 40, y: 60, desk: "Creative Studio" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🏢 The Office</h1>
        <div className="text-sm text-gray-400">
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Office Floor Plan */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8 relative overflow-hidden">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #444 1px, transparent 1px),
              linear-gradient(to bottom, #444 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Office Space */}
        <div className="relative" style={{ height: '600px' }}>
          {/* Room Outline */}
          <div className="absolute inset-4 border-4 border-gray-700 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            {/* Title on floor */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-700">
              AI COMPANY HQ
            </div>

            {/* Conference Table in center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-48 h-32 bg-gray-700/50 rounded-lg border-2 border-gray-600
                          flex items-center justify-center text-xs text-gray-500">
              Meeting Table
            </div>

            {/* Agent Workstations */}
            {officeLayout.map((station) => {
              const agent = agents?.find(a => a.agentId === station.id);
              if (!agent) return null;

              const isWorking = agent.status === "working";
              const isIdle = agent.status === "idle";

              return (
                <div
                  key={station.id}
                  className="absolute"
                  style={{
                    left: `${station.x}%`,
                    top: `${station.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Desk */}
                  <div className="relative">
                    {/* Desk surface */}
                    <div className="w-32 h-24 bg-gradient-to-br from-amber-900/40 to-amber-950/40 
                                  rounded-lg border-2 border-amber-800/50 mb-2
                                  shadow-xl relative overflow-hidden">
                      {/* Computer monitor */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 
                                    w-16 h-12 bg-gray-800 rounded border border-gray-600">
                        {/* Screen glow when working */}
                        {isWorking && (
                          <div className="w-full h-full bg-gradient-to-b from-blue-400/30 to-green-400/30 
                                        rounded animate-pulse" />
                        )}
                        {isIdle && (
                          <div className="w-full h-full bg-gray-700/50 rounded" />
                        )}
                      </div>
                      
                      {/* Keyboard */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                                    w-14 h-3 bg-gray-700 rounded-sm border border-gray-600" />
                    </div>

                    {/* Chair with Agent */}
                    <div className="w-32 flex flex-col items-center">
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-3xl
                        relative
                        ${isWorking ? 'bg-green-900/30 border-2 border-green-500 ring-4 ring-green-500/20 animate-pulse' : 
                          isIdle ? 'bg-yellow-900/30 border-2 border-yellow-500' :
                          'bg-gray-800 border-2 border-gray-600'}
                      `}>
                        {agent.avatar}
                        
                        {/* Status indicator */}
                        <div className={`
                          absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900
                          ${isWorking ? 'bg-green-500' : isIdle ? 'bg-yellow-500' : 'bg-gray-500'}
                        `} />

                        {/* Working animation - typing hands */}
                        {isWorking && (
                          <div className="absolute -bottom-2 text-xs animate-bounce">
                            ⌨️
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="mt-2 text-center">
                        <div className="font-bold text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.role}</div>
                        <div className="text-xs text-gray-500 mt-1">{station.desk}</div>
                        {agent.currentTask && (
                          <div className="mt-2 px-2 py-1 bg-gray-800/80 rounded text-xs max-w-[140px] 
                                        border border-gray-700 backdrop-blur">
                            💭 {agent.currentTask}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Office Furniture/Decorations */}
            {/* Plant in corner */}
            <div className="absolute top-8 right-8 text-4xl">🪴</div>
            <div className="absolute bottom-8 left-8 text-4xl">🪴</div>
            
            {/* Coffee station */}
            <div className="absolute top-8 left-8 flex flex-col items-center">
              <div className="text-3xl">☕</div>
              <div className="text-xs text-gray-500 mt-1">Coffee</div>
            </div>

            {/* Exit */}
            <div className="absolute bottom-8 right-8 flex flex-col items-center">
              <div className="text-3xl">🚪</div>
              <div className="text-xs text-gray-500 mt-1">Exit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Live Activity
          </h3>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const agent = agents?.find(a => a.agentId === activity.agent);
                
                return (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 text-sm bg-gray-800/50 rounded-lg p-3
                             border border-gray-700/50 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-2xl">{agent?.avatar ?? "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-300 truncate">{activity.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-6">No recent activity</p>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Team Status
          </h3>
          <div className="space-y-4">
            {agents?.map((agent) => (
              <div key={agent._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.avatar}</span>
                  <div>
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === "working" ? "bg-green-500 animate-pulse" :
                    agent.status === "idle" ? "bg-yellow-500" :
                    "bg-gray-500"
                  }`} />
                  <span className="text-sm capitalize text-gray-400">{agent.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {agents?.filter(a => a.status === "working").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Working</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {agents?.filter(a => a.status === "idle").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Idle</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {agents?.filter(a => a.status === "offline").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Offline</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
