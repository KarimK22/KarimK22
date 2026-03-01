import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get content by platform (e.g., "twitter")
export const getByPlatform = query({
  args: { platform: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentPipeline")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .order("desc")
      .collect();
  },
});

// Get content by stage
export const getByStage = query({
  args: { stage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.stage) {
      const stage = args.stage;
      return await ctx.db
        .query("contentPipeline")
        .withIndex("by_stage", (q) => q.eq("stage", stage))
        .collect();
    }
    return await ctx.db.query("contentPipeline").collect();
  },
});

// Get content statistics
export const getStats = query({
  handler: async (ctx) => {
    const content = await ctx.db.query("contentPipeline").collect();
    
    return {
      ideas: content.filter(c => c.stage === "ideas").length,
      scripting: content.filter(c => c.stage === "scripting").length,
      thumbnail: content.filter(c => c.stage === "thumbnail").length,
      filming: content.filter(c => c.stage === "filming").length,
      editing: content.filter(c => c.stage === "editing").length,
      published: content.filter(c => c.stage === "published").length,
      total: content.length,
    };
  },
});

// Create content
export const create = mutation({
  args: {
    title: v.string(),
    stage: v.optional(v.string()),
    contentType: v.string(),
    content: v.optional(v.string()),
    platform: v.optional(v.string()),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const contentId = await ctx.db.insert("contentPipeline", {
      title: args.title,
      stage: args.stage ?? "ideas",
      contentType: args.contentType,
      content: args.content,
      platform: args.platform,
      assignee: args.assignee,
      createdAt: now,
      updatedAt: now,
    });
    
    return contentId;
  },
});

// Update content
export const update = mutation({
  args: {
    id: v.id("contentPipeline"),
    title: v.optional(v.string()),
    stage: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    platform: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Move content to next stage
export const moveStage = mutation({
  args: {
    id: v.id("contentPipeline"),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (!content) throw new Error("Content not found");
    
    await ctx.db.patch(args.id, {
      stage: args.stage,
      updatedAt: Date.now(),
    });
    
    // Log activity
    await ctx.db.insert("activityLog", {
      timestamp: Date.now(),
      agent: content.assignee ?? "VIBE",
      action: "moved_content",
      description: `Moved "${content.title}" to ${args.stage}`,
      metadata: { contentId: args.id },
    });
  },
});

// Delete content
export const remove = mutation({
  args: { id: v.id("contentPipeline") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
