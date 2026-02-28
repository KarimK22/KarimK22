"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Dashboard() {
  const agents = useQuery(api.agents.getAll, {});
  const taskStats = useQuery(api.tasks.getStats, {});
  const contentStats = useQuery(api.contentPipeline.getStats, {});
  const upcomingTasks = useQuery(api.calendar.getUpcoming, { limit: 5 });
  const recentActivity = useQuery(api.agents.getActivityFeed, { limit: 10 });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Agent Status */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Team Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents?.map((agent) => (
            <div key={agent._id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{agent.avatar}</span>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === "working" ? "bg-green-500" :
                  agent.status === "idle" ? "bg-yellow-500" :
                  "bg-gray-500"
                }`} />
                <span className="text-sm capitalize">{agent.status}</span>
              </div>
              {agent.currentTask && (
                <p className="text-sm text-gray-400 mt-2">{agent.currentTask}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Tasks Completed"
            value={taskStats?.completed ?? 0}
            subtitle={`${taskStats?.completionRate}% completion rate`}
            icon="✅"
          />
          <StatCard
            title="In Progress"
            value={taskStats?.inProgress ?? 0}
            subtitle={`${taskStats?.backlog ?? 0} in backlog`}
            icon="⚡"
          />
          <StatCard
            title="Content in Pipeline"
            value={contentStats?.total ?? 0}
            subtitle={`${contentStats?.published ?? 0} published`}
            icon="📝"
          />
          <StatCard
            title="Scheduled Tasks"
            value={upcomingTasks?.length ?? 0}
            subtitle="Next 7 days"
            icon="📅"
          />
        </div>
      </section>

      {/* Upcoming Schedule */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Schedule</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {upcomingTasks.map((task) => (
                <div key={task._id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{task.name}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(task.nextRun).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(task.nextRun).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-gray-500">No upcoming scheduled tasks</p>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {recentActivity.map((activity) => (
                <div key={activity._id} className="p-4 flex gap-4">
                  <div className="text-2xl">{
                    agents?.find(a => a.agentId === activity.agent)?.avatar ?? "🤖"
                  }</div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-gray-500">No recent activity</p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
