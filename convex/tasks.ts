import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all tasks grouped by status
export const getByStatus = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      const status = args.status;
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

// Get tasks by assignee
export const getByAssignee = query({
  args: { assignee: v.string() },
  handler: async (ctx, args) => {
    const assignee = args.assignee;
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignee", assignee))
      .collect();
  },
});

// Get task statistics
export const getStats = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === "done").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      backlog: tasks.filter(t => t.status === "backlog").length,
      completionRate: 0,
    };
    
    stats.completionRate = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;
    
    return stats;
  },
});

// Create task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    assignee: v.string(),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status ?? "backlog",
      assignee: args.assignee,
      priority: args.priority,
      dueDate: args.dueDate,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
    
    // Log activity
    await ctx.db.insert("activityLog", {
      timestamp: now,
      agent: args.assignee,
      action: "created_task",
      description: `Created task: ${args.title}`,
      metadata: { taskId },
    });
    
    return taskId;
  },
});

// Update task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    
    if (!task) throw new Error("Task not found");
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Log status changes
    if (updates.status && updates.status !== task.status) {
      await ctx.db.insert("activityLog", {
        timestamp: Date.now(),
        agent: task.assignee,
        action: "updated_task",
        description: `Moved task "${task.title}" from ${task.status} to ${updates.status}`,
        metadata: { taskId: id },
      });
    }
  },
});

// Delete task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
