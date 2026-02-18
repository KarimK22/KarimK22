import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all agents
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Get agent by ID
export const getById = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    return agents;
  },
});

// Initialize agents (run once)
export const initialize = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return { message: "Already initialized" };
    
    const agents = [
      {
        agentId: "main",
        name: "APEX",
        role: "CEO",
        status: "idle",
        lastActivity: Date.now(),
        avatar: "🏴",
        skills: ["strategy", "decision-making", "coordination"],
      },
      {
        agentId: "insight",
        name: "INSIGHT",
        role: "Marketing/Analytics",
        status: "idle",
        lastActivity: Date.now(),
        avatar: "📊",
        skills: ["mixpanel", "data-analysis", "reporting"],
      },
      {
        agentId: "vibe",
        name: "VIBE",
        role: "Designer/Video",
        status: "idle",
        lastActivity: Date.now(),
        avatar: "🎨",
        skills: ["content-creation", "design", "social-media"],
      },
    ];
    
    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }
    
    return { message: "Agents initialized", count: agents.length };
  },
});

// Update agent status
export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.string(),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    
    if (!agent) throw new Error("Agent not found");
    
    await ctx.db.patch(agent._id, {
      status: args.status,
      currentTask: args.currentTask,
      lastActivity: Date.now(),
    });
  },
});

// Get activity feed
export const getActivityFeed = query({
  args: {
    agent: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.agent) {
      return await ctx.db
        .query("activityLog")
        .withIndex("by_agent", (q) => q.eq("agent", args.agent))
        .order("desc")
        .take(args.limit ?? 50);
    }
    
    return await ctx.db
      .query("activityLog")
      .order("desc")
      .take(args.limit ?? 50);
  },
});
