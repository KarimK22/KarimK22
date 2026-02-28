import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get recent activity
export const getRecent = query({
  args: {
    agent: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.agent) {
      return await ctx.db
        .query("activityLog")
        .withIndex("by_agent", (q) => q.eq("agent", args.agent!))
        .order("desc")
        .take(args.limit ?? 50);
    }
    return await ctx.db
      .query("activityLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// Add activity entry
export const add = mutation({
  args: {
    agent: v.string(),
    action: v.string(),
    description: v.string(),
    metadata: v.optional(v.object({
      taskId: v.optional(v.id("tasks")),
      contentId: v.optional(v.id("contentPipeline")),
      memoryId: v.optional(v.id("memories")),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLog", {
      timestamp: Date.now(),
      agent: args.agent,
      action: args.action,
      description: args.description,
      metadata: args.metadata,
    });
  },
});
