"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TeamPage() {
  const agents = useQuery(api.agents.getAll, {});

  // Get specific agents
  const apex = agents?.find(a => a.agentId === "main");
  const teamMembers = agents?.filter(a => a.agentId !== "main") || [];

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-12">👥 Team</h1>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {agents?.length || 0} AI agents, each with a unique vibe and set of capabilities.
            <br />
            Together, they run your AI company with precision and creativity.
          </p>
        </div>

        {/* CEO at Top */}
        {apex && (
          <div className="flex flex-col items-center mb-12">
            <AgentCard
              agent={apex}
              skills={apex.skills || []}
              large
            />
            
            {/* Connection Line Down */}
            <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500/50 to-transparent" />
          </div>
        )}

        {/* Divider Line */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <div className="px-4 text-xs text-gray-500 uppercase tracking-wider">Direct Reports</div>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Team Members Row */}
        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((agent) => (
            <div key={agent.agentId} className="flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-gray-700/50 to-transparent mb-4" />
              <AgentCard
                agent={agent}
                skills={agent.skills || []}
              />
            </div>
          ))}
        </div>

        {/* Team Stats */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <StatBox
            icon="⚡"
            value={agents?.filter(a => a.status === "working").length || 0}
            label="Currently Working"
            color="green"
          />
          <StatBox
            icon="🎯"
            value={agents?.length || 0}
            label="Total Agents"
            color="blue"
          />
          <StatBox
            icon="📊"
            value={agents?.reduce((total, agent) => total + (agent.skills?.length || 0), 0) || 0}
            label="Combined Skills"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function AgentCard({ 
  agent, 
  skills,
  large = false 
}: { 
  agent: any; 
  skills: string[];
  large?: boolean;
}) {
  const skillColors: Record<string, string> = {
    // APEX skills
    "strategy": "bg-blue-900/40 text-blue-300 border-blue-700/50",
    "decision-making": "bg-indigo-900/40 text-indigo-300 border-indigo-700/50",
    "coordination": "bg-purple-900/40 text-purple-300 border-purple-700/50",
    
    // INSIGHT skills
    "mixpanel": "bg-orange-900/40 text-orange-300 border-orange-700/50",
    "data-analysis": "bg-green-900/40 text-green-300 border-green-700/50",
    "reporting": "bg-teal-900/40 text-teal-300 border-teal-700/50",
    
    // VIBE skills
    "content-creation": "bg-pink-900/40 text-pink-300 border-pink-700/50",
    "design": "bg-rose-900/40 text-rose-300 border-rose-700/50",
    "social-media": "bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700/50",
    
    // MISSION skills
    "logging": "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
    "tracking": "bg-sky-900/40 text-sky-300 border-sky-700/50",
    "documentation": "bg-blue-900/40 text-blue-300 border-blue-700/50",
    "monitoring": "bg-slate-900/40 text-slate-300 border-slate-700/50",
  };

  return (
    <div className={`
      bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur
      rounded-2xl border border-gray-700/50 
      hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10
      transition-all duration-300
      ${large ? 'p-8 w-full max-w-md' : 'p-6 w-full'}
    `}>
      {/* Avatar & Status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className={`
            ${large ? 'w-20 h-20 text-5xl' : 'w-16 h-16 text-4xl'}
            rounded-2xl bg-gradient-to-br from-gray-700/50 to-gray-800/50
            flex items-center justify-center
            border-2 ${
              agent.status === "working" ? 'border-green-500 ring-4 ring-green-500/20' :
              agent.status === "idle" ? 'border-yellow-500' :
              'border-gray-600'
            }
          `}>
            {agent.avatar}
          </div>
          
          {/* Status Dot */}
          <div className={`
            absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900
            ${agent.status === "working" ? 'bg-green-500 animate-pulse' :
              agent.status === "idle" ? 'bg-yellow-500' :
              'bg-gray-500'}
          `} />
        </div>

        <div className="flex-1">
          <h3 className={`font-bold ${large ? 'text-2xl' : 'text-xl'} mb-1`}>
            {agent.name}
          </h3>
          <p className={`text-gray-400 ${large ? 'text-base' : 'text-sm'}`}>
            {agent.role}
          </p>
          
          {/* Current Task */}
          {agent.currentTask && (
            <div className="mt-2 px-3 py-1.5 bg-gray-700/30 rounded-lg border border-gray-600/50">
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Current:</span> {agent.currentTask}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700/50">
          {skills.map((skill) => (
            <span
              key={skill}
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                border capitalize
                ${skillColors[skill] || 'bg-gray-700/40 text-gray-300 border-gray-600/50'}
              `}
            >
              {skill.replace('-', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: string; 
  value: number; 
  label: string; 
  color: string;
}) {
  const colorClasses = {
    green: 'from-green-900/20 to-green-950/20 border-green-700/30 text-green-400',
    blue: 'from-blue-900/20 to-blue-950/20 border-blue-700/30 text-blue-400',
    purple: 'from-purple-900/20 to-purple-950/20 border-purple-700/30 text-purple-400',
  }[color];

  return (
    <div className={`
      bg-gradient-to-br ${colorClasses}
      rounded-xl border p-6 text-center
      hover:scale-105 transition-transform duration-200
    `}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}
