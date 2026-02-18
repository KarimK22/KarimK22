"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const STATUSES = [
  { id: "backlog", label: "Backlog", color: "bg-gray-700" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-700" },
  { id: "review", label: "Review", color: "bg-yellow-700" },
  { id: "done", label: "Done", color: "bg-green-700" },
];

export default function TasksPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: "APEX", priority: "medium" });

  const tasks = useQuery(api.tasks.getByStatus);
  const stats = useQuery(api.tasks.getStats);
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    await createTask({
      title: newTask.title,
      assignee: newTask.assignee,
      priority: newTask.priority,
      status: "backlog",
    });

    setNewTask({ title: "", assignee: "APEX", priority: "medium" });
    setIsCreating(false);
  };

  const moveTask = async (taskId: Id<"tasks">, newStatus: string) => {
    await updateTask({ id: taskId, status: newStatus });
  };

  const tasksByStatus = STATUSES.map(status => ({
    ...status,
    tasks: tasks?.filter(t => t.status === status.id) ?? [],
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">✅ Tasks</h1>
          {stats && (
            <p className="text-gray-400 mt-1">
              {stats.completed}/{stats.total} completed ({stats.completionRate}%)
            </p>
          )}
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assign to</label>
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="APEX">APEX</option>
                  <option value="INSIGHT">INSIGHT</option>
                  <option value="VIBE">VIBE</option>
                  <option value="user">Me</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {tasksByStatus.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`${column.color} rounded-t-lg px-4 py-3 font-semibold`}>
              <div className="flex items-center justify-between">
                <span>{column.label}</span>
                <span className="text-sm">{column.tasks.length}</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-900 rounded-b-lg p-4 space-y-3 min-h-[400px] border-x border-b border-gray-800">
              {column.tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-gray-700 rounded">{task.assignee}</span>
                    {task.priority && (
                      <span className={`px-2 py-1 rounded ${
                        task.priority === "critical" ? "bg-red-900 text-red-200" :
                        task.priority === "high" ? "bg-orange-900 text-orange-200" :
                        task.priority === "medium" ? "bg-yellow-900 text-yellow-200" :
                        "bg-gray-700 text-gray-300"
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  {/* Quick move buttons */}
                  <div className="mt-3 flex gap-1">
                    {STATUSES.filter(s => s.id !== task.status).map((status) => (
                      <button
                        key={status.id}
                        onClick={() => moveTask(task._id, status.id)}
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        → {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
