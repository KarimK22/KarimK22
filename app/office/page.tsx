"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function OfficePage() {
  const agents = useQuery(api.agents.getAll, {});
  const recentActivity = useQuery(api.agents.getActivityFeed, { limit: 5 });
  const [time, setTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-based lighting
  const hour = time.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const isEvening = hour >= 18 && hour < 22;
  const isNight = hour >= 22 || hour < 6;

  const getLightingClass = () => {
    if (isDaytime) return "from-blue-900/20 via-gray-900 to-gray-950";
    if (isEvening) return "from-orange-900/30 via-gray-900 to-gray-950";
    return "from-indigo-950/40 via-gray-950 to-black";
  };

  const getAmbientLight = () => {
    if (isDaytime) return "rgba(147, 197, 253, 0.05)"; // blue
    if (isEvening) return "rgba(251, 146, 60, 0.08)"; // orange
    return "rgba(99, 102, 241, 0.04)"; // indigo
  };

  const officeLayout = [
    { id: "main", x: 20, y: 30, desk: "Executive Desk", z: 0 },
    { id: "insight", x: 60, y: 30, desk: "Analytics Station", z: 0 },
    { id: "vibe", x: 40, y: 60, desk: "Creative Studio", z: 1 },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🏢 The Office</h1>
        <div className="text-sm text-gray-400">
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Office Floor Plan */}
      <div className={`rounded-lg border border-gray-800 p-8 mb-8 relative overflow-hidden
                     bg-gradient-to-br ${getLightingClass()}
                     shadow-2xl`}
           style={{
             boxShadow: `inset 0 0 100px ${getAmbientLight()}`
           }}>
        {/* Time indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400
                      bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-full border border-gray-700/50">
          <span className={`w-2 h-2 rounded-full ${
            isDaytime ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
            isEvening ? 'bg-orange-400 shadow-lg shadow-orange-400/50' :
            'bg-indigo-400 shadow-lg shadow-indigo-400/50'
          }`} />
          {isDaytime ? '☀️ Day' : isEvening ? '🌆 Evening' : '🌙 Night'}
        </div>

        {/* Background Grid with isometric perspective */}
        <div 
          className="absolute inset-0 opacity-10 transition-opacity duration-1000"
          style={{
            backgroundImage: `
              linear-gradient(to right, #444 1px, transparent 1px),
              linear-gradient(to bottom, #444 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(1200px) rotateX(60deg) rotateZ(-45deg) scale(1.5)',
            transformOrigin: 'center center'
          }}
        />

        {/* Office Space with isometric view */}
        <div className="relative" style={{ 
          height: '700px',
          perspective: '1200px'
        }}>
          {/* Room Outline - isometric */}
          <div className="absolute inset-4 border-4 border-gray-700/50 rounded-lg 
                        bg-gradient-to-br from-gray-800/30 to-gray-900/50
                        transition-all duration-1000"
               style={{
                 transform: 'rotateX(5deg)',
                 boxShadow: `
                   0 20px 60px rgba(0,0,0,0.5),
                   inset 0 -20px 40px ${getAmbientLight()}
                 `
               }}>
            
            {/* Ambient lighting overlay */}
            <div className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-1000"
                 style={{
                   background: `radial-gradient(ellipse at 50% 30%, ${getAmbientLight()}, transparent 70%)`
                 }} />

            {/* Title on floor */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                          text-2xl font-bold text-gray-700/50
                          transition-all duration-1000"
                 style={{
                   textShadow: `0 0 20px ${getAmbientLight()}`
                 }}>
              AI COMPANY HQ
            </div>

            {/* Conference Table in center with shadow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-48 h-32 bg-gradient-to-br from-gray-700/60 to-gray-800/60 
                          rounded-lg border-2 border-gray-600/50
                          flex items-center justify-center text-xs text-gray-500
                          transition-all duration-1000"
                 style={{
                   transform: 'translate(-50%, -50%) rotateX(2deg)',
                   boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                 }}>
              <div className="text-center">
                <div className="text-sm mb-1">📋</div>
                Meeting Table
              </div>
            </div>

            {/* Agent Workstations */}
            {officeLayout.map((station) => {
              const agent = agents?.find(a => a.agentId === station.id);
              if (!agent) return null;

              const isWorking = agent.status === "working";
              const isIdle = agent.status === "idle";
              const isSelected = selectedAgent === station.id;

              return (
                <div
                  key={station.id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${station.x}%`,
                    top: `${station.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 50 : 10 + station.z
                  }}
                  onClick={() => setSelectedAgent(isSelected ? null : station.id)}
                >
                  {/* Desk with 3D depth */}
                  <div className="relative transition-all duration-500 ease-out 
                                group-hover:scale-110 group-hover:-translate-y-2"
                       style={{
                         transform: isSelected ? 'scale(1.15) translateY(-8px)' : undefined,
                         filter: `drop-shadow(0 ${station.z * 10 + 10}px ${station.z * 15 + 20}px rgba(0,0,0,0.5))`
                       }}>
                    
                    {/* Enhanced Status Glow */}
                    <div className={`
                      absolute inset-0 rounded-lg blur-2xl 
                      transition-all duration-500
                      ${isSelected ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-60'}
                      ${isWorking ? 'bg-green-500/40' : 
                        isIdle ? 'bg-amber-500/40' : 
                        'bg-gray-500/20'}
                    `} />
                    
                    {/* Desk surface with depth */}
                    <div className="w-36 h-28 bg-gradient-to-br from-amber-900/50 to-amber-950/50 
                                  rounded-lg border-2 border-amber-800/60 mb-2
                                  shadow-2xl relative overflow-visible
                                  transition-all duration-500 ease-out
                                  backdrop-blur-sm
                                  group-hover:border-amber-700/80 group-hover:from-amber-900/60"
                         style={{
                           transform: 'perspective(600px) rotateX(3deg)',
                           boxShadow: `
                             0 ${station.z * 5 + 10}px ${station.z * 10 + 30}px rgba(0,0,0,0.4),
                             inset 0 2px 4px rgba(255,255,255,0.05)
                           `
                         }}>
                      
                      {/* Computer monitor with screen flicker */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 
                                    w-18 h-14 bg-gray-900 rounded border-2 border-gray-700
                                    transition-all duration-500 shadow-lg"
                           style={{
                             transform: 'translateX(-50%) perspective(300px) rotateX(-2deg)',
                             boxShadow: isWorking ? '0 0 20px rgba(34, 197, 94, 0.3)' : undefined
                           }}>
                        
                        {/* Screen content with flicker */}
                        {isWorking && (
                          <div className="w-full h-full bg-gradient-to-b from-blue-400/40 to-green-400/40 
                                        rounded relative overflow-hidden">
                            {/* Code lines animation */}
                            <div className="absolute inset-1 space-y-1 p-1">
                              <div className="h-0.5 bg-green-400/60 rounded animate-pulse" 
                                   style={{ width: '70%', animationDelay: '0s' }} />
                              <div className="h-0.5 bg-blue-400/60 rounded animate-pulse" 
                                   style={{ width: '50%', animationDelay: '0.3s' }} />
                              <div className="h-0.5 bg-green-400/60 rounded animate-pulse" 
                                   style={{ width: '80%', animationDelay: '0.6s' }} />
                              <div className="h-0.5 bg-cyan-400/60 rounded animate-pulse" 
                                   style={{ width: '60%', animationDelay: '0.9s' }} />
                            </div>
                            {/* Screen glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-green-400/20 to-transparent 
                                          animate-pulse" />
                          </div>
                        )}
                        {isIdle && (
                          <div className="w-full h-full bg-gray-800/60 rounded flex items-center justify-center">
                            <div className="text-xs text-gray-600 animate-pulse">💤</div>
                          </div>
                        )}
                        {!isWorking && !isIdle && (
                          <div className="w-full h-full bg-gray-900/80 rounded" />
                        )}
                      </div>
                      
                      {/* Keyboard with subtle animation */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                                    w-16 h-3 bg-gray-800 rounded-sm border border-gray-700
                                    shadow-md transition-all duration-300"
                           style={{
                             animation: isWorking ? 'subtle-bounce 2s ease-in-out infinite' : undefined
                           }} />
                      
                      {/* Mouse */}
                      <div className="absolute bottom-2 right-2 w-2 h-3 bg-gray-700 rounded-sm
                                    border border-gray-600 shadow-sm" />
                      
                      {/* Desk items */}
                      {station.id === 'main' && (
                        <div className="absolute top-2 right-2 text-xs">📱</div>
                      )}
                      {station.id === 'insight' && (
                        <div className="absolute top-2 right-2 text-xs">📊</div>
                      )}
                      {station.id === 'vibe' && (
                        <div className="absolute top-2 right-2 text-xs">🎨</div>
                      )}
                    </div>

                    {/* Chair with Agent */}
                    <div className="w-36 flex flex-col items-center">
                      <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center text-4xl
                        relative transition-all duration-500 ease-out
                        ${isWorking ? 'bg-green-900/40 border-3 border-green-500 shadow-2xl shadow-green-500/50' : 
                          isIdle ? 'bg-amber-900/40 border-3 border-amber-500 shadow-2xl shadow-amber-500/50' :
                          'bg-gray-800/60 border-3 border-gray-600 shadow-2xl shadow-gray-500/20'}
                      `}
                           style={{
                             transform: isSelected ? 'scale(1.1)' : undefined
                           }}>
                        
                        {/* Animated glow ring */}
                        <div className={`
                          absolute inset-0 rounded-full transition-all duration-500
                          ${isWorking ? 'ring-6 ring-green-500/30 animate-pulse' : 
                            isIdle ? 'ring-6 ring-amber-500/30' :
                            'ring-0'}
                        `} />
                        
                        {/* Pulsing aura for working state */}
                        {isWorking && (
                          <div className="absolute inset-0 rounded-full bg-green-500/10 
                                        animate-ping" />
                        )}
                        
                        {agent.avatar}
                        
                        {/* Enhanced status indicator */}
                        <div className={`
                          absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-gray-900
                          transition-all duration-500
                          ${isWorking ? 'bg-green-500 shadow-lg shadow-green-500/70 animate-pulse' : 
                            isIdle ? 'bg-amber-500 shadow-lg shadow-amber-500/70' : 
                            'bg-gray-500'}
                        `} />

                        {/* Enhanced working animation */}
                        {isWorking && (
                          <>
                            <div className="absolute -bottom-3 text-sm animate-bounce"
                                 style={{ animationDuration: '1s' }}>
                              ⌨️
                            </div>
                            <div className="absolute -top-3 text-xs opacity-0 group-hover:opacity-100
                                          transition-opacity duration-300">
                              💡
                            </div>
                          </>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="mt-3 text-center">
                        <div className="font-bold text-sm transition-all duration-300 
                                      group-hover:text-white group-hover:scale-105">
                          {agent.name}
                        </div>
                        <div className="text-xs text-gray-400 transition-colors duration-300
                                      group-hover:text-gray-300">{agent.role}</div>
                        <div className="text-xs text-gray-500 mt-1">{station.desk}</div>
                        
                        {agent.currentTask && (
                          <div className="mt-2 px-3 py-1.5 
                                        bg-gray-800/95 backdrop-blur-md rounded-lg text-xs max-w-[160px] 
                                        border border-gray-700/60 
                                        transition-all duration-500 ease-out
                                        group-hover:bg-gray-800 group-hover:border-gray-600
                                        shadow-xl group-hover:shadow-2xl">
                            💭 {agent.currentTask}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Detail Panel */}
                    {isSelected && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4
                                    w-64 bg-gray-900/95 backdrop-blur-xl rounded-lg
                                    border border-gray-700 shadow-2xl p-4
                                    animate-in fade-in slide-in-from-bottom-4 duration-300"
                           style={{ zIndex: 100 }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{agent.avatar}</span>
                            <div>
                              <div className="font-bold text-sm">{agent.name}</div>
                              <div className="text-xs text-gray-400">{agent.role}</div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgent(null);
                            }}
                            className="text-gray-400 hover:text-white transition-colors">
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-2 border-t border-gray-800">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-medium ${
                              isWorking ? 'text-green-400' :
                              isIdle ? 'text-amber-400' :
                              'text-gray-400'
                            }`}>
                              {agent.status}
                            </span>
                          </div>
                          
                          {agent.currentTask && (
                            <div className="py-2 border-t border-gray-800">
                              <div className="text-gray-400 mb-1">Current Task</div>
                              <div className="text-white">{agent.currentTask}</div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-800">
                            <span className="text-gray-400">Last Active</span>
                            <span className="text-white">
                              {agent.lastActivity ? new Date(agent.lastActivity).toLocaleTimeString() : 'Never'}
                            </span>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-800">
                            <button className="w-full py-2 bg-gray-800 hover:bg-gray-700
                                             rounded transition-colors text-white text-xs">
                              View Full Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Office Furniture/Decorations with Ambient Animations */}
            
            {/* Plants with sway animation */}
            <div className="absolute top-8 right-8 text-5xl transition-transform duration-1000"
                 style={{
                   animation: 'sway 4s ease-in-out infinite',
                   filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                 }}>
              🪴
            </div>
            <div className="absolute bottom-8 left-8 text-5xl transition-transform duration-1000"
                 style={{
                   animation: 'sway 3.5s ease-in-out infinite',
                   animationDelay: '0.5s',
                   filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                 }}>
              🪴
            </div>
            
            {/* Coffee station with steam */}
            <div className="absolute top-8 left-8 flex flex-col items-center group cursor-pointer
                          transition-transform duration-300 hover:scale-110">
              <div className="relative">
                {/* Steam animation */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                              flex flex-col items-center gap-1 opacity-60">
                  <div className="text-xs opacity-0 animate-steam" 
                       style={{ animationDelay: '0s' }}>💨</div>
                  <div className="text-xs opacity-0 animate-steam" 
                       style={{ animationDelay: '0.5s' }}>💨</div>
                  <div className="text-xs opacity-0 animate-steam" 
                       style={{ animationDelay: '1s' }}>💨</div>
                </div>
                <div className="text-4xl filter drop-shadow-lg">☕</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">
                Coffee
              </div>
            </div>

            {/* Window with time-based lighting */}
            <div className="absolute top-12 right-1/4 flex flex-col items-center">
              <div className={`
                text-6xl transition-all duration-1000
                ${isDaytime ? 'brightness-100' : isEvening ? 'brightness-75' : 'brightness-50'}
              `}
                   style={{
                     filter: `drop-shadow(0 0 ${isDaytime ? '20px' : isEvening ? '15px' : '10px'} ${
                       isDaytime ? 'rgba(251, 191, 36, 0.3)' :
                       isEvening ? 'rgba(251, 146, 60, 0.3)' :
                       'rgba(99, 102, 241, 0.2)'
                     })`
                   }}>
                🪟
              </div>
              <div className="text-xs text-gray-600 mt-1">View</div>
            </div>

            {/* Exit door */}
            <div className="absolute bottom-8 right-8 flex flex-col items-center
                          transition-transform duration-300 hover:scale-110 cursor-pointer group">
              <div className="text-4xl filter drop-shadow-lg group-hover:brightness-110 transition-all">
                🚪
              </div>
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">
                Exit
              </div>
            </div>

            {/* Bookshelf */}
            <div className="absolute top-1/4 left-8 text-4xl transition-transform duration-300
                          hover:scale-105 cursor-pointer"
                 style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              📚
            </div>

            {/* Clock showing actual time */}
            <div className="absolute top-12 left-1/4 flex flex-col items-center group">
              <div className="text-3xl filter drop-shadow-lg">🕐</div>
              <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 
                            transition-opacity bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded">
                {time.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-6
                      shadow-xl transition-all duration-300 hover:border-gray-700/70">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Live Activity
          </h3>
          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const agent = agents?.find(a => a.agentId === activity.agent);
                
                return (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 text-sm 
                             bg-gray-800/50 backdrop-blur-sm rounded-lg p-3
                             border border-gray-700/50 
                             hover:border-gray-600 hover:bg-gray-800/70
                             transition-all duration-300 ease-out
                             shadow-lg hover:shadow-xl"
                  >
                    <span className="text-2xl">{agent?.avatar ?? "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.agent}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-300 truncate">{activity.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-6">No recent activity</p>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-6
                      shadow-xl transition-all duration-300 hover:border-gray-700/70">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Team Status
          </h3>
          <div className="space-y-4">
            {agents?.map((agent) => {
              const isWorking = agent.status === "working";
              const isIdle = agent.status === "idle";
              
              return (
                <div key={agent._id} 
                     className="flex items-center justify-between
                              bg-gray-800/30 backdrop-blur-sm rounded-lg p-3
                              border border-gray-700/30
                              hover:border-gray-600/50 hover:bg-gray-800/50
                              transition-all duration-300 ease-out
                              shadow-md hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent.avatar}</span>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-xs text-gray-400">{agent.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full transition-all duration-300
                      ${isWorking ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' :
                        isIdle ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                        'bg-gray-500'}
                    `} />
                    <span className="text-sm capitalize text-gray-400">{agent.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3
                            border border-gray-700/20
                            transition-all duration-300 hover:border-gray-600/30">
                <div className="text-2xl font-bold text-green-400 
                              transition-all duration-300 hover:text-green-300">
                  {agents?.filter(a => a.status === "working").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Working</div>
              </div>
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3
                            border border-gray-700/20
                            transition-all duration-300 hover:border-gray-600/30">
                <div className="text-2xl font-bold text-amber-400
                              transition-all duration-300 hover:text-amber-300">
                  {agents?.filter(a => a.status === "idle").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Idle</div>
              </div>
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3
                            border border-gray-700/20
                            transition-all duration-300 hover:border-gray-600/30">
                <div className="text-2xl font-bold text-gray-400
                              transition-all duration-300 hover:text-gray-300">
                  {agents?.filter(a => a.status === "offline").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Offline</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
