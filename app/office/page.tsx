"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function OfficePage() {
  const agents = useQuery(api.agents.getAll, {});
  const recentActivity = useQuery(api.agents.getActivityFeed, { limit: 5 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">🏢 Office</h1>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-12">
        <div className="max-w-4xl mx-auto">
          {/* Simple office visualization */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            {agents?.map((agent, idx) => {
              const positions = [
                { x: "left", y: "top" },
                { x: "center", y: "top" },
                { x: "right", y: "top" },
              ];
              const pos = positions[idx] || positions[0];

              return (
                <div
                  key={agent._id}
                  className="flex flex-col items-center"
                >
                  <div className={`
                    w-32 h-32 rounded-lg flex items-center justify-center text-6xl mb-4
                    ${agent.status === "working" ? "bg-green-900/30 border-2 border-green-500 animate-pulse" :
                      agent.status === "idle" ? "bg-gray-800 border-2 border-gray-600" :
                      "bg-gray-800/50 border-2 border-gray-700"}
                  `}>
                    {agent.avatar}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold mb-1">{agent.name}</h3>
                    <p className="text-sm text-gray-400">{agent.role}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === "working" ? "bg-green-500" :
                        agent.status === "idle" ? "bg-yellow-500" :
                        "bg-gray-500"
                      }`} />
                      <span className="text-xs capitalize">{agent.status}</span>
                    </div>
                    {agent.currentTask && (
                      <div className="mt-3 bg-gray-800 rounded px-3 py-2 text-xs max-w-[200px]">
                        {agent.currentTask}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Activity */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">Live Activity</h3>
            <div className="space-y-3">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const agent = agents?.find(a => a.agentId === activity.agent);
                  
                  return (
                    <div
                      key={activity._id}
                      className="flex items-center gap-3 text-sm bg-gray-800/50 rounded-lg p-3"
                    >
                      <span className="text-2xl">{agent?.avatar ?? "🤖"}</span>
                      <div className="flex-1">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-gray-400"> • {activity.description}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 py-6">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
