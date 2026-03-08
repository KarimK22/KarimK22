import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";


const http = httpRouter();

// Add memory from OpenClaw
http.route({
  path: "/api/memory",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const memoryId = await ctx.runMutation(api.memories.add, {
      type: body.type || "conversation",
      content: body.content,
      agent: body.agent,
      session: body.session,
      tags: body.tags,
      metadata: body.metadata,
    });
    
    return new Response(JSON.stringify({ success: true, id: memoryId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Create task from OpenClaw
http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const taskId = await ctx.runMutation(api.tasks.create, {
      title: body.title,
      description: body.description,
      status: body.status,
      assignee: body.assignee,
      priority: body.priority,
      dueDate: body.dueDate,
      tags: body.tags,
    });
    
    return new Response(JSON.stringify({ success: true, id: taskId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Update agent status from OpenClaw
http.route({
  path: "/api/agents/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    await ctx.runMutation(api.agents.updateStatus, {
      agentId: body.agentId || body.id, // Support both field names
      status: body.status,
      currentTask: body.currentTask,
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Sync cron jobs from OpenClaw
http.route({
  path: "/api/calendar/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const result = await ctx.runMutation(api.calendar.syncFromCron, {
      jobs: body.jobs,
    });
    
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Add content to pipeline from OpenClaw
http.route({
  path: "/api/content",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const contentId = await ctx.runMutation(api.contentPipeline.create, {
      title: body.title,
      stage: body.stage,
      contentType: body.contentType,
      content: body.content,
      platform: body.platform,
      assignee: body.assignee,
    });
    
    return new Response(JSON.stringify({ success: true, id: contentId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Update content stage
http.route({
  path: "/api/content/stage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    await ctx.runMutation(api.contentPipeline.moveStage, {
      id: body.id,
      stage: body.stage,
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Add agent
http.route({
  path: "/api/agents/add",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const result = await ctx.runMutation(api.agents.addAgent, {
      agentId: body.agentId,
      name: body.name,
      role: body.role,
      avatar: body.avatar,
      skills: body.skills,
    });

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Log staking metrics
http.route({
  path: "/api/staking",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.stakingMetrics.upsert, {
      date: body.date,
      starts: body.starts,
      completions: body.completions,
      completionRate: body.completionRate,
      source: body.source || "mixpanel",
      notes: body.notes,
    });
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Log activity feed entry
http.route({
  path: "/api/activity",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.activityLog.add, {
      agent: body.agent,
      action: body.action,
      description: body.description,
      metadata: body.metadata,
    });
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// GET rejected twitter drafts (for scout learning loop)
http.route({
  path: "/api/twitter/feedback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const allDraft = await ctx.runQuery(api.contentPipeline.getByStage, { stage: "draft" });
    const twitterRejected = allDraft.filter((c: any) => c.platform === "twitter");
    return new Response(JSON.stringify(twitterRejected), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// Upsert daily token usage snapshot (called by daily_usage.py at 1am CET)
http.route({
  path: "/api/tokens",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // body.snapshots = [{ date, periodStart, agent, inputTokens, outputTokens,
    //                     cacheRead, cacheWrite, totalTokens, cost, turns }, ...]
    const snapshots: any[] = body.snapshots || [];
    const ids: string[] = [];
    for (const snap of snapshots) {
      const id = await ctx.runMutation(api.tokenUsage.upsert, {
        date: snap.date,
        periodStart: snap.periodStart,
        agent: snap.agent,
        inputTokens: snap.inputTokens ?? 0,
        outputTokens: snap.outputTokens ?? 0,
        cacheRead: snap.cacheRead ?? 0,
        cacheWrite: snap.cacheWrite ?? 0,
        totalTokens: snap.totalTokens ?? 0,
        cost: snap.cost ?? 0,
        turns: snap.turns ?? 0,
      });
      ids.push(id as string);
    }
    return new Response(JSON.stringify({ success: true, count: ids.length, ids }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Health check
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
