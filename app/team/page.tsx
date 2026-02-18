"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TeamPage() {
  const agents = useQuery(api.agents.getAll, {});
  const activityFeed = useQuery(api.agents.getActivityFeed, { limit: 20 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">👥 Team</h1>

      {/* Team Members */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {agents?.map((agent) => (
          <div key={agent._id} className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{agent.avatar}</div>
              <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
              <p className="text-gray-400 mb-4">{agent.role}</p>
              
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  agent.status === "working" ? "bg-green-500" :
                  agent.status === "idle" ? "bg-yellow-500" :
                  "bg-gray-500"
                }`} />
                <span className="text-sm capitalize">{agent.status}</span>
              </div>
            </div>

            {agent.currentTask && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1">Current Task:</p>
                <p className="text-sm">{agent.currentTask}</p>
              </div>
            )}

            {agent.skills && agent.skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded capitalize"
                    >
                      {skill.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-4">
              Last active: {new Date(agent.lastActivity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Activity Feed</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {activityFeed && activityFeed.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {activityFeed.map((activity) => {
                const agent = agents?.find(a => a.agentId === activity.agent);
                
                return (
                  <div key={activity._id} className="p-4 flex gap-4 hover:bg-gray-800/50 transition-colors">
                    <div className="text-3xl">{agent?.avatar ?? "🤖"}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{activity.agent}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{activity.action.replace("_", " ")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-8 text-center text-gray-500">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
