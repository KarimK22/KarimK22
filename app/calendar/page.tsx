"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function CalendarPage() {
  const upcomingTasks = useQuery(api.calendar.getUpcoming, { daysAhead: 30 });
  const allTasks = useQuery(api.calendar.getAll, {});

  // Group by date
  const tasksByDate = upcomingTasks?.reduce((acc, task) => {
    const date = new Date(task.nextRun).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof upcomingTasks>);

  const sortedDates = tasksByDate ? Object.keys(tasksByDate).sort() : [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">📅 Calendar</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Scheduled</h3>
          <p className="text-3xl font-bold">{allTasks?.length ?? 0}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-400">
            {allTasks?.filter(t => t.status === "active").length ?? 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Paused</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {allTasks?.filter(t => t.status === "paused").length ?? 0}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Next 7 Days</h3>
          <p className="text-3xl font-bold text-blue-400">{upcomingTasks?.length ?? 0}</p>
        </div>
      </div>

      {/* Upcoming Tasks by Date */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Upcoming Schedule</h2>
        
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const tasks = tasksByDate![date];
            const dateObj = new Date(tasks[0].nextRun);
            const isToday = dateObj.toLocaleDateString() === new Date().toLocaleDateString();
            
            return (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className={`text-xl font-semibold ${isToday ? "text-blue-400" : ""}`}>
                    {isToday ? "Today" : dateObj.toLocaleDateString("en-US", { 
                      weekday: "long", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </h3>
                  <span className="text-sm text-gray-500">{tasks.length} tasks</span>
                </div>
                
                <div className="grid gap-3">
                  {tasks.map((task) => {
                    const time = new Date(task.nextRun);
                    
                    return (
                      <div
                        key={task._id}
                        className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                task.type === "recurring" ? "bg-purple-900 text-purple-200" :
                                task.type === "one-time" ? "bg-blue-900 text-blue-200" :
                                "bg-green-900 text-green-200"
                              }`}>
                                {task.type}
                              </span>
                              {task.agent && (
                                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                                  {task.agent}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded ${
                                task.status === "active" ? "bg-green-900 text-green-200" :
                                task.status === "paused" ? "bg-yellow-900 text-yellow-200" :
                                "bg-gray-800 text-gray-300"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-1">{task.name}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-400">{task.description}</p>
                            )}
                            {task.schedule && (
                              <p className="text-xs text-gray-600 mt-2">Schedule: {task.schedule}</p>
                            )}
                            {task.lastRun && (
                              <p className="text-xs text-gray-600">
                                Last run: {new Date(task.lastRun).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">{time.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
            <p className="text-gray-500">No upcoming scheduled tasks</p>
          </div>
        )}
      </div>

      {/* All Scheduled Tasks */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">All Scheduled Tasks</h2>
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {allTasks && allTasks.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {allTasks.map((task) => (
                <div key={task._id} className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{task.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.status === "active" ? "bg-green-900 text-green-200" :
                        task.status === "paused" ? "bg-yellow-900 text-yellow-200" :
                        task.status === "completed" ? "bg-blue-900 text-blue-200" :
                        "bg-red-900 text-red-200"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{task.schedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Next: {new Date(task.nextRun).toLocaleString()}</p>
                    {task.agent && (
                      <p className="text-xs text-gray-500">{task.agent}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-gray-500">No scheduled tasks</p>
          )}
        </div>
      </div>
    </div>
  );
}
