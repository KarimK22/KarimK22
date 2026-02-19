// Quick script to populate agent data via Convex HTTP API
const agents = [
  {
    agentId: "main",
    name: "APEX",
    role: "Chief Executive Officer",
    avatar: "🏴",
    status: "working",
    currentTask: "Strategic planning & delegation",
    lastActivity: Date.now(),
    skills: ["Leadership", "Strategy", "Decision Making"]
  },
  {
    agentId: "insight",
    name: "INSIGHT",
    role: "Chief Marketing & Analytics Officer",
    avatar: "👁️",
    status: "working",
    currentTask: "Analyzing user engagement metrics",
    lastActivity: Date.now(),
    skills: ["Data Analysis", "Marketing", "Metrics"]
  },
  {
    agentId: "vibe",
    name: "VIBE",
    role: "Chief Creative Officer",
    avatar: "🎨",
    status: "idle",
    currentTask: null,
    lastActivity: Date.now(),
    skills: ["Design", "Video", "Creative Direction"]
  }
];

console.log(JSON.stringify(agents, null, 2));
