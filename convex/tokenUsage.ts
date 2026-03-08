import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert a daily token snapshot for one agent.
// If a record for (date, agent) already exists it is overwritten with the latest count.
export const upsert = mutation({
  args: {
    date: v.string(),
    periodStart: v.string(),
    agent: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheRead: v.number(),
    cacheWrite: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    turns: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tokenUsage")
      .withIndex("by_date_agent", (q) =>
        q.eq("date", args.date).eq("agent", args.agent)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    } else {
      return await ctx.db.insert("tokenUsage", { ...args, updatedAt: Date.now() });
    }
  },
});

// Return all rows for a given billing period, ordered by date.
export const getByPeriod = query({
  args: { periodStart: v.string() },
  handler: async (ctx, { periodStart }) => {
    return await ctx.db
      .query("tokenUsage")
      .withIndex("by_period", (q) => q.eq("periodStart", periodStart))
      .order("asc")
      .collect();
  },
});

// Return the most recent N days of "ALL" aggregate rows (for the dashboard chart).
export const getRecentTotals = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const limit = days ?? 30;
    return await ctx.db
      .query("tokenUsage")
      .withIndex("by_agent", (q) => q.eq("agent", "ALL"))
      .order("desc")
      .take(limit);
  },
});
