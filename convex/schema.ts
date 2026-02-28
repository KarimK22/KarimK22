import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Memory System - searchable conversation/memory logs
  memories: defineTable({
    timestamp: v.number(),
    type: v.string(), // "conversation", "decision", "learning", "note"
    content: v.string(),
    agent: v.optional(v.string()), // "APEX", "INSIGHT", "VIBE"
    session: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      channel: v.optional(v.string()),
      user: v.optional(v.string()),
      importance: v.optional(v.string()), // "low", "medium", "high", "critical"
    })),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_agent", ["agent"])
    .index("by_type", ["type"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["agent", "type"],
    }),

  // Calendar & Scheduled Tasks
  scheduledTasks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    schedule: v.string(), // cron expression or ISO timestamp
    type: v.string(), // "recurring", "one-time", "reminder"
    status: v.string(), // "active", "paused", "completed", "failed"
    agent: v.optional(v.string()), // who's responsible
    nextRun: v.number(), // timestamp
    lastRun: v.optional(v.number()),
    createdAt: v.number(),
    cronJobId: v.optional(v.string()), // OpenClaw cron job ID
  })
    .index("by_nextRun", ["nextRun"])
    .index("by_agent", ["agent"])
    .index("by_status", ["status"]),

  // Task Board - Kanban style
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "backlog", "in-progress", "review", "done", "blocked"
    assignee: v.string(), // "APEX", "INSIGHT", "VIBE", "user"
    priority: v.optional(v.string()), // "low", "medium", "high", "critical"
    createdAt: v.number(),
    updatedAt: v.number(),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      sessionId: v.optional(v.string()),
      relatedMemoryId: v.optional(v.id("memories")),
    })),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_priority", ["priority"]),

  // Content Pipeline - for VIBE's work
  contentPipeline: defineTable({
    title: v.string(),
    stage: v.string(), // "ideas", "scripting", "thumbnail", "filming", "editing", "published"
    contentType: v.string(), // "tweet", "thread", "video", "article"
    content: v.optional(v.string()), // script, draft, final text
    thumbnail: v.optional(v.string()), // image URL or path
    platform: v.optional(v.string()), // "twitter", "youtube", "blog"
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    assignee: v.optional(v.string()),
    metadata: v.optional(v.object({
      attachments: v.optional(v.array(v.string())),
      analytics: v.optional(v.object({
        views: v.optional(v.number()),
        engagement: v.optional(v.number()),
      })),
    })),
  })
    .index("by_stage", ["stage"])
    .index("by_platform", ["platform"])
    .index("by_scheduledFor", ["scheduledFor"]),

  // Team/Agents - track who's doing what
  agents: defineTable({
    agentId: v.string(), // "main", "insight", "vibe"
    name: v.string(), // "APEX", "INSIGHT", "VIBE"
    role: v.string(), // "CEO", "Marketing/Analytics", "Designer/Video"
    status: v.string(), // "idle", "working", "offline"
    currentTask: v.optional(v.string()),
    lastActivity: v.number(),
    avatar: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"]),

  // Staking Metrics - daily tracking
  stakingMetrics: defineTable({
    date: v.string(), // "YYYY-MM-DD"
    starts: v.number(),
    completions: v.number(),
    completionRate: v.number(), // percentage 0-100
    source: v.optional(v.string()), // "mixpanel", "manual"
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_date", ["date"]),

  // Activity Log - real-time feed
  activityLog: defineTable({
    timestamp: v.number(),
    agent: v.string(),
    action: v.string(), // "created_task", "completed_query", "posted_content"
    description: v.string(),
    metadata: v.optional(v.object({
      taskId: v.optional(v.id("tasks")),
      contentId: v.optional(v.id("contentPipeline")),
      memoryId: v.optional(v.id("memories")),
    })),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_agent", ["agent"]),
});
