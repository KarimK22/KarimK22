# Mission Control Setup

## 🚀 Quick Start

### 1. Initialize the Database

Run once to create the initial agents:

```bash
cd /root/.openclaw/workspace/mission-control
npx convex dev
```

In another terminal:
```bash
npm run dev
```

Open http://localhost:3000

### 2. Initialize Agents

The agents (APEX, INSIGHT, VIBE) need to be created. You can do this via the API or directly:

```bash
curl -X POST http://localhost:3000/api/init
```

Or open the Convex dashboard at http://localhost:6790 and run:
```javascript
await api.agents.initialize()
```

## 🔗 OpenClaw Integration

### Environment Variables

Add to OpenClaw workspace (create `.env` if needed):

```bash
MISSION_CONTROL_URL=http://localhost:3000
```

### API Endpoints

**Base URL**: `http://localhost:3000/api`

#### Add Memory
```bash
POST /api/memory
{
  "type": "conversation|decision|learning|note",
  "content": "Memory text content",
  "agent": "APEX|INSIGHT|VIBE",
  "session": "session-id",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "channel": "telegram",
    "user": "user-id",
    "importance": "low|medium|high|critical"
  }
}
```

#### Create Task
```bash
POST /api/tasks
{
  "title": "Task title",
  "description": "Task description",
  "assignee": "APEX|INSIGHT|VIBE|user",
  "priority": "low|medium|high|critical",
  "status": "backlog|in-progress|review|done"
}
```

#### Update Agent Status
```bash
POST /api/agents/status
{
  "id": "main|insight|vibe",
  "status": "idle|working|offline",
  "currentTask": "What the agent is currently doing"
}
```

#### Sync Calendar from Cron
```bash
POST /api/calendar/sync
{
  "jobs": [
    {
      "id": "cron-job-id",
      "name": "Job name",
      "schedule": "0 9 * * *",
      "nextRunAtMs": 1234567890,
      "lastRunAtMs": 1234567890,
      "enabled": true,
      "agentId": "main"
    }
  ]
}
```

#### Add Content to Pipeline
```bash
POST /api/content
{
  "title": "Content title",
  "stage": "ideas|scripting|thumbnail|filming|editing|published",
  "contentType": "tweet|thread|video|article",
  "content": "Content text",
  "platform": "twitter|youtube|blog",
  "assignee": "VIBE"
}
```

## 🛠️ OpenClaw Helper Functions

Create a file in your workspace: `mission-control-helpers.ts`

```typescript
const MC_URL = process.env.MISSION_CONTROL_URL || "http://localhost:3000";

export async function logToMissionControl(
  content: string,
  agent: string,
  type: string = "conversation",
  metadata?: any
) {
  try {
    await fetch(`${MC_URL}/api/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        agent,
        type,
        metadata,
        session: process.env.SESSION_KEY,
        timestamp: Date.now(),
      }),
    });
  } catch (err) {
    console.error("Failed to log to Mission Control:", err);
  }
}

export async function updateAgentStatus(
  agentId: string,
  status: "idle" | "working" | "offline",
  currentTask?: string
) {
  try {
    await fetch(`${MC_URL}/api/agents/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: agentId, status, currentTask }),
    });
  } catch (err) {
    console.error("Failed to update agent status:", err);
  }
}

export async function createTask(
  title: string,
  assignee: string,
  priority: string = "medium",
  description?: string
) {
  try {
    const response = await fetch(`${MC_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        assignee,
        priority,
        description,
        status: "backlog",
      }),
    });
    return await response.json();
  } catch (err) {
    console.error("Failed to create task:", err);
  }
}

export async function syncCronJobs(jobs: any[]) {
  try {
    await fetch(`${MC_URL}/api/calendar/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs }),
    });
  } catch (err) {
    console.error("Failed to sync cron jobs:", err);
  }
}
```

## 🎯 Usage Examples

### In APEX's workflow

```typescript
// Log important decisions
await logToMissionControl(
  "Approved VIBE's content strategy for X campaign",
  "APEX",
  "decision",
  { importance: "high", channel: "telegram" }
);

// Update status when working
await updateAgentStatus("main", "working", "Reviewing analytics reports");

// Create a task for INSIGHT
await createTask(
  "Investigate February MAU decline",
  "INSIGHT",
  "high",
  "MAU dropped 20% vs January, need root cause analysis"
);
```

### In INSIGHT's workflow

```typescript
// Before starting a query
await updateAgentStatus("insight", "working", "Pulling Mixpanel data");

// Log findings
await logToMissionControl(
  "Discovered: 450 power users drive 90% of engagement",
  "INSIGHT",
  "learning",
  { importance: "critical" }
);

// After completing
await updateAgentStatus("insight", "idle");
```

### Auto-sync cron jobs

Add to your heartbeat or startup:

```typescript
import { cron } from "./openclaw-tools";

// Get current cron jobs
const jobs = await cron("list");

// Sync to Mission Control
await syncCronJobs(jobs.jobs.map(job => ({
  id: job.id,
  name: job.name,
  schedule: job.schedule.expr,
  nextRunAtMs: job.state.nextRunAtMs,
  lastRunAtMs: job.state.lastRunAtMs,
  enabled: job.enabled,
  agentId: job.agentId,
})));
```

## 📊 Deployment

### Local Development
```bash
npm run dev          # Next.js on :3000
npx convex dev       # Convex backend
```

### Production (Vercel + Convex Cloud)
1. Push to GitHub
2. Import to Vercel
3. Run `npx convex deploy` and link to production
4. Add `NEXT_PUBLIC_CONVEX_URL` to Vercel env vars
5. Update OpenClaw's `MISSION_CONTROL_URL` to production URL

## 🔒 Security Note

Currently, the API endpoints are **unprotected**. For production:
1. Add API key authentication
2. Use Convex auth or JWT tokens
3. Restrict CORS to your OpenClaw host only

Add to `convex/http.ts`:
```typescript
const API_KEY = process.env.API_KEY;

// In each route handler:
const authHeader = request.headers.get("Authorization");
if (authHeader !== `Bearer ${API_KEY}`) {
  return new Response("Unauthorized", { status: 401 });
}
```
