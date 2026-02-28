import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get recent staking metrics (last N days)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stakingMetrics")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit ?? 30);
  },
});

// Upsert staking metrics for a date
export const upsert = mutation({
  args: {
    date: v.string(),
    starts: v.number(),
    completions: v.number(),
    completionRate: v.number(),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stakingMetrics")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        starts: args.starts,
        completions: args.completions,
        completionRate: args.completionRate,
        source: args.source,
        notes: args.notes,
      });
      return existing._id;
    }

    return await ctx.db.insert("stakingMetrics", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
