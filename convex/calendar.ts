import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get upcoming scheduled tasks
export const getUpcoming = query({
  args: {
    limit: v.optional(v.number()),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const daysAhead = args.daysAhead ?? 7;
    const maxTime = now + (daysAhead * 24 * 60 * 60 * 1000);
    
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_nextRun")
      .filter((q) => 
        q.and(
          q.gte(q.field("nextRun"), now),
          q.lte(q.field("nextRun"), maxTime)
        )
      )
      .take(args.limit ?? 100);
    
    return tasks;
  },
});

// Get all scheduled tasks
export const getAll = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("scheduledTasks")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    }
    return await ctx.db.query("scheduledTasks").collect();
  },
});

// Create scheduled task
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    schedule: v.string(),
    type: v.string(),
    agent: v.optional(v.string()),
    nextRun: v.number(),
    cronJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("scheduledTasks", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
    return taskId;
  },
});

// Update scheduled task
export const update = mutation({
  args: {
    id: v.id("scheduledTasks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    schedule: v.optional(v.string()),
    status: v.optional(v.string()),
    nextRun: v.optional(v.number()),
    lastRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete scheduled task
export const remove = mutation({
  args: { id: v.id("scheduledTasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Sync from OpenClaw cron jobs
export const syncFromCron = mutation({
  args: {
    jobs: v.array(v.object({
      id: v.string(),
      name: v.string(),
      schedule: v.string(),
      nextRunAtMs: v.number(),
      lastRunAtMs: v.optional(v.number()),
      enabled: v.boolean(),
      agentId: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Get existing tasks with cronJobIds
    const existing = await ctx.db.query("scheduledTasks").collect();
    const existingMap = new Map(
      existing
        .filter(t => t.cronJobId)
        .map(t => [t.cronJobId!, t._id])
    );
    
    // Update or create tasks
    for (const job of args.jobs) {
      const existingId = existingMap.get(job.id);
      
      if (existingId) {
        // Update existing
        await ctx.db.patch(existingId, {
          name: job.name,
          schedule: job.schedule,
          nextRun: job.nextRunAtMs,
          lastRun: job.lastRunAtMs,
          status: job.enabled ? "active" : "paused",
          agent: job.agentId,
        });
      } else {
        // Create new
        await ctx.db.insert("scheduledTasks", {
          name: job.name,
          description: `Synced from OpenClaw`,
          schedule: job.schedule,
          type: "recurring",
          status: job.enabled ? "active" : "paused",
          agent: job.agentId,
          nextRun: job.nextRunAtMs,
          lastRun: job.lastRunAtMs,
          createdAt: Date.now(),
          cronJobId: job.id,
        });
      }
    }
    
    return { synced: args.jobs.length };
  },
});
