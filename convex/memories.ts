import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Search memories
export const search = query({
  args: {
    query: v.string(),
    agent: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("memories")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.query);
        if (args.agent) search = search.eq("agent", args.agent);
        if (args.type) search = search.eq("type", args.type);
        return search;
      })
      .take(args.limit ?? 50);
    
    return results;
  },
});

// Get recent memories
export const getRecent = query({
  args: {
    agent: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("memories").order("desc");
    
    if (args.agent) {
      q = ctx.db.query("memories")
        .withIndex("by_agent", (q) => q.eq("agent", args.agent))
        .order("desc");
    } else if (args.type) {
      q = ctx.db.query("memories")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .order("desc");
    }
    
    return await q.take(args.limit ?? 100);
  },
});

// Add memory
export const add = mutation({
  args: {
    type: v.string(),
    content: v.string(),
    agent: v.optional(v.string()),
    session: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      channel: v.optional(v.string()),
      user: v.optional(v.string()),
      importance: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.db.insert("memories", {
      timestamp: Date.now(),
      ...args,
    });
    return memoryId;
  },
});

// Get memory by ID
export const get = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete memory
export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
