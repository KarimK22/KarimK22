"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

// Isometric coordinate helpers
const ISO_ANGLE = 30; // degrees
const ISO_SCALE_X = 0.866; // cos(30°)
const ISO_SCALE_Y = 0.5;  // sin(30°)

function isoX(x: number, y: number): number {
  return (x - y) * ISO_SCALE_X;
}

function isoY(x: number, y: number, z: number = 0): number {
  return (x + y) * ISO_SCALE_Y - z;
}

// Roblox-style 3D Character Component
function RobloxCharacter({ 
  color, 
  status, 
  scale = 1,
  isSelected = false
}: { 
  color: string; 
  status: string;
  scale?: number;
  isSelected?: boolean;
}) {
  const isWorking = status === "working";
  const isIdle = status === "idle";
  
  // Color variants for different parts
  const bodyColor = color;
  const headColor = color === "#10b981" ? "#34d399" : 
                    color === "#f59e0b" ? "#fbbf24" : "#60a5fa";
  
  return (
    <div 
      className="relative transition-all duration-500"
      style={{
        transform: `scale(${scale}) ${isSelected ? 'translateY(-10px)' : ''}`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Glow effect */}
      {isWorking && (
        <div 
          className="absolute inset-0 blur-xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${color}40, transparent)`,
            transform: 'translateZ(-20px) scale(1.5)'
          }}
        />
      )}
      
      {/* Head (cube) */}
      <div 
        className="relative mx-auto transition-all duration-500"
        style={{
          width: '24px',
          height: '24px',
          transformStyle: 'preserve-3d',
          animation: isWorking ? 'head-bob 1s ease-in-out infinite' : undefined
        }}
      >
        {/* Front face */}
        <div 
          className="absolute rounded-sm border border-black/20"
          style={{
            width: '24px',
            height: '24px',
            background: headColor,
            transform: 'translateZ(12px)',
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.3)`
          }}
        >
          {/* Simple face */}
          <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-black/70 rounded-full" />
          <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-black/70 rounded-full" />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-0.5 
                        bg-black/50 rounded-full" />
        </div>
        
        {/* Top face */}
        <div 
          className="absolute"
          style={{
            width: '24px',
            height: '24px',
            background: `linear-gradient(135deg, ${headColor}, ${bodyColor})`,
            transform: 'rotateX(90deg) translateZ(12px)',
            transformOrigin: 'top',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Right face */}
        <div 
          className="absolute"
          style={{
            width: '24px',
            height: '24px',
            background: bodyColor,
            transform: 'rotateY(90deg) translateZ(12px)',
            transformOrigin: 'right',
            border: '1px solid rgba(0,0,0,0.3)',
            filter: 'brightness(0.7)'
          }}
        />
      </div>
      
      {/* Torso (rectangular prism) */}
      <div 
        className="relative mx-auto"
        style={{
          width: '28px',
          height: '32px',
          marginTop: '2px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front face */}
        <div 
          className="absolute rounded-sm"
          style={{
            width: '28px',
            height: '32px',
            background: `linear-gradient(180deg, ${bodyColor}, ${bodyColor}dd)`,
            transform: 'translateZ(14px)',
            border: '1px solid rgba(0,0,0,0.2)',
            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Top face */}
        <div 
          className="absolute"
          style={{
            width: '28px',
            height: '28px',
            background: bodyColor,
            transform: 'rotateX(90deg) translateZ(0px)',
            transformOrigin: 'top',
            border: '1px solid rgba(0,0,0,0.2)',
            filter: 'brightness(1.2)'
          }}
        />
        
        {/* Right face */}
        <div 
          className="absolute"
          style={{
            width: '28px',
            height: '32px',
            background: bodyColor,
            transform: 'rotateY(90deg) translateZ(14px)',
            transformOrigin: 'right',
            border: '1px solid rgba(0,0,0,0.3)',
            filter: 'brightness(0.6)'
          }}
        />
      </div>
      
      {/* Legs */}
      <div className="flex justify-center gap-1 mt-1">
        {/* Left leg */}
        <div 
          className="relative"
          style={{
            width: '10px',
            height: '20px',
            transformStyle: 'preserve-3d',
            animation: isWorking ? 'leg-walk 0.5s ease-in-out infinite' : undefined
          }}
        >
          <div 
            className="absolute rounded-sm"
            style={{
              width: '10px',
              height: '20px',
              background: bodyColor,
              transform: 'translateZ(5px)',
              border: '1px solid rgba(0,0,0,0.2)',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)'
            }}
          />
          <div 
            className="absolute"
            style={{
              width: '10px',
              height: '10px',
              background: bodyColor,
              transform: 'rotateY(90deg) translateZ(5px)',
              transformOrigin: 'right',
              filter: 'brightness(0.6)',
              border: '1px solid rgba(0,0,0,0.3)'
            }}
          />
        </div>
        
        {/* Right leg */}
        <div 
          className="relative"
          style={{
            width: '10px',
            height: '20px',
            transformStyle: 'preserve-3d',
            animation: isWorking ? 'leg-walk 0.5s ease-in-out infinite 0.25s' : undefined
          }}
        >
          <div 
            className="absolute rounded-sm"
            style={{
              width: '10px',
              height: '20px',
              background: bodyColor,
              transform: 'translateZ(5px)',
              border: '1px solid rgba(0,0,0,0.2)',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2)'
            }}
          />
          <div 
            className="absolute"
            style={{
              width: '10px',
              height: '10px',
              background: bodyColor,
              transform: 'rotateY(90deg) translateZ(5px)',
              transformOrigin: 'right',
              filter: 'brightness(0.6)',
              border: '1px solid rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </div>
      
      {/* Status indicator badge */}
      <div 
        className={`
          absolute -top-6 left-1/2 transform -translate-x-1/2
          w-3 h-3 rounded-full border-2 border-gray-900
          transition-all duration-500
          ${isWorking ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' :
            isIdle ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
            'bg-gray-500'}
        `}
      />
      
      {/* Working animation - typing hands */}
      {isWorking && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="text-xs animate-bounce">⌨️</div>
        </div>
      )}
    </div>
  );
}

// Isometric Desk Component
function IsometricDesk({ 
  agentColor,
  isWorking,
  isIdle,
  isSelected,
  deskIcon
}: {
  agentColor: string;
  isWorking: boolean;
  isIdle: boolean;
  isSelected: boolean;
  deskIcon: string;
}) {
  const deskDepth = 60;
  const deskWidth = 80;
  const deskHeight = 40;
  
  return (
    <div 
      className="relative"
      style={{
        transformStyle: 'preserve-3d',
        transform: isSelected ? 'scale(1.1) translateY(-10px)' : undefined,
        transition: 'all 0.5s ease-out'
      }}
    >
      {/* Desk surface (top) */}
      <div 
        className="absolute"
        style={{
          width: `${deskWidth}px`,
          height: `${deskDepth}px`,
          background: 'linear-gradient(135deg, #92400e, #78350f)',
          transform: `rotateX(90deg) translateZ(${deskHeight}px)`,
          transformOrigin: 'top',
          border: '2px solid #451a03',
          borderRadius: '4px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Desk items */}
        <div className="absolute top-2 right-2 text-lg">{deskIcon}</div>
        
        {/* Monitor */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '28px',
            height: '24px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Monitor screen */}
          <div 
            className="absolute rounded-sm"
            style={{
              width: '28px',
              height: '20px',
              background: isWorking ? 
                'linear-gradient(180deg, #3b82f6, #10b981)' :
                isIdle ? '#374151' : '#1f2937',
              transform: 'translateZ(2px) rotateX(-5deg)',
              border: '2px solid #1f2937',
              boxShadow: isWorking ? '0 0 12px rgba(16, 185, 129, 0.5)' : undefined
            }}
          >
            {/* Screen content */}
            {isWorking && (
              <div className="p-0.5 space-y-px">
                <div className="h-px bg-green-400/60 rounded animate-pulse" style={{ width: '70%' }} />
                <div className="h-px bg-blue-400/60 rounded animate-pulse" style={{ width: '50%', animationDelay: '0.3s' }} />
                <div className="h-px bg-cyan-400/60 rounded animate-pulse" style={{ width: '80%', animationDelay: '0.6s' }} />
              </div>
            )}
            {isIdle && (
              <div className="flex items-center justify-center h-full">
                <span className="text-[8px] opacity-50">💤</span>
              </div>
            )}
          </div>
          
          {/* Monitor base */}
          <div 
            className="absolute"
            style={{
              width: '12px',
              height: '4px',
              background: '#1f2937',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: '2px'
            }}
          />
        </div>
        
        {/* Keyboard */}
        <div 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          style={{
            width: '20px',
            height: '8px',
            background: '#374151',
            borderRadius: '2px',
            border: '1px solid #1f2937',
            animation: isWorking ? 'subtle-bounce 2s ease-in-out infinite' : undefined
          }}
        />
        
        {/* Mouse */}
        <div 
          className="absolute bottom-2 right-4"
          style={{
            width: '4px',
            height: '6px',
            background: '#4b5563',
            borderRadius: '2px',
            border: '1px solid #374151'
          }}
        />
      </div>
      
      {/* Desk front face */}
      <div 
        className="absolute"
        style={{
          width: `${deskWidth}px`,
          height: `${deskHeight}px`,
          background: 'linear-gradient(180deg, #78350f, #451a03)',
          border: '2px solid #292524',
          borderRadius: '0 0 4px 4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
      />
      
      {/* Desk right face */}
      <div 
        className="absolute"
        style={{
          width: `${deskDepth}px`,
          height: `${deskHeight}px`,
          background: '#451a03',
          transform: 'rotateY(90deg) translateZ(0)',
          transformOrigin: 'right',
          left: `${deskWidth}px`,
          border: '2px solid #292524',
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Glow effect */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-lg blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${agentColor}40, transparent)`,
            transform: 'translateZ(-30px) scale(1.3)'
          }}
        />
      )}
    </div>
  );
}

// Isometric Floor Tile
function FloorTile({ x, y, dark }: { x: number; y: number; dark: boolean }) {
  const tileSize = 40;
  
  return (
    <div 
      className="absolute"
      style={{
        left: `${isoX(x * tileSize, y * tileSize)}px`,
        top: `${isoY(x * tileSize, y * tileSize, 0)}px`,
        transform: 'translateX(-50%) translateY(-50%)'
      }}
    >
      <div 
        className="transition-all duration-300"
        style={{
          width: `${tileSize}px`,
          height: `${tileSize}px`,
          background: dark ? '#1a1a1a' : '#2a2a2a',
          transform: `rotateX(90deg) rotateZ(-45deg) scale(${ISO_SCALE_X})`,
          transformStyle: 'preserve-3d',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
        }}
      />
    </div>
  );
}

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
    if (isDaytime) return "rgba(147, 197, 253, 0.05)";
    if (isEvening) return "rgba(251, 146, 60, 0.08)";
    return "rgba(99, 102, 241, 0.04)";
  };

  // Agent positions in isometric grid coordinates
  const agentPositions = {
    main: { x: 2, y: 2, z: 0 },
    insight: { x: 6, y: 2, z: 0 },
    vibe: { x: 4, y: 5, z: 0 }
  };

  const agentColors = {
    main: "#10b981",    // green
    insight: "#3b82f6", // blue
    vibe: "#f59e0b"     // amber
  };

  const agentIcons = {
    main: "💻",
    insight: "📊",
    vibe: "🎨"
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🏢 Isometric Office</h1>
        <div className="text-sm text-gray-400">
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Office Floor Plan - Isometric View */}
      <div 
        className={`rounded-lg border border-gray-800 p-8 mb-8 relative overflow-hidden
                   bg-gradient-to-br ${getLightingClass()}
                   shadow-2xl`}
        style={{
          boxShadow: `inset 0 0 100px ${getAmbientLight()}`,
          minHeight: '800px'
        }}
      >
        {/* Time indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-400
                      bg-gray-900/80 backdrop-blur-md px-3 py-2 rounded-full border border-gray-700/50 z-50">
          <span className={`w-2 h-2 rounded-full ${
            isDaytime ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
            isEvening ? 'bg-orange-400 shadow-lg shadow-orange-400/50' :
            'bg-indigo-400 shadow-lg shadow-indigo-400/50'
          }`} />
          {isDaytime ? '☀️ Day' : isEvening ? '🌆 Evening' : '🌙 Night'}
        </div>

        {/* Isometric Scene Container */}
        <div 
          className="relative"
          style={{
            width: '100%',
            height: '700px',
            perspective: '2000px',
            perspectiveOrigin: '50% 30%'
          }}
        >
          {/* Scene wrapper with isometric transform */}
          <div 
            className="absolute left-1/2 top-1/2"
            style={{
              transform: 'translate(-50%, -50%) rotateX(60deg) rotateZ(-45deg) scale(0.7)',
              transformStyle: 'preserve-3d',
              width: '600px',
              height: '600px'
            }}
          >
            {/* Checkered Floor */}
            <div className="absolute" style={{ 
              width: '600px',
              height: '600px',
              transform: 'translateZ(-2px)'
            }}>
              {Array.from({ length: 15 }).map((_, x) =>
                Array.from({ length: 15 }).map((_, y) => (
                  <FloorTile 
                    key={`${x}-${y}`}
                    x={x - 7} 
                    y={y - 7} 
                    dark={(x + y) % 2 === 0} 
                  />
                ))
              )}
            </div>

            {/* Office Title */}
            <div 
              className="absolute left-1/2 top-20 transform -translate-x-1/2 text-center"
              style={{
                transform: 'translate(-50%, 0) rotateX(-60deg) rotateZ(45deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="text-2xl font-bold text-gray-700/70"
                   style={{ textShadow: `0 0 20px ${getAmbientLight()}` }}>
                AI COMPANY HQ
              </div>
            </div>

            {/* Meeting Table (center) */}
            <div 
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Table top */}
              <div 
                className="absolute"
                style={{
                  width: '120px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #4b5563, #374151)',
                  transform: 'rotateX(90deg) translateZ(30px)',
                  transformOrigin: 'center',
                  border: '2px solid #1f2937',
                  borderRadius: '40px',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                              text-sm">📋</div>
              </div>
              
              {/* Table front */}
              <div 
                className="absolute"
                style={{
                  width: '120px',
                  height: '30px',
                  background: 'linear-gradient(180deg, #374151, #1f2937)',
                  border: '2px solid #111827',
                  borderRadius: '0 0 40px 40px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  transform: 'translateY(15px)'
                }}
              />
            </div>

            {/* Agent Workstations */}
            {Object.entries(agentPositions).map(([agentId, pos]) => {
              const agent = agents?.find(a => a.agentId === agentId);
              if (!agent) return null;

              const isWorking = agent.status === "working";
              const isIdle = agent.status === "idle";
              const isSelected = selectedAgent === agentId;
              const color = agentColors[agentId as keyof typeof agentColors];

              const screenX = isoX(pos.x * 100, pos.y * 100);
              const screenY = isoY(pos.x * 100, pos.y * 100, pos.z * 50);

              return (
                <div
                  key={agentId}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${300 + screenX}px`,
                    top: `${300 + screenY}px`,
                    transform: 'translate(-50%, -50%)',
                    transformStyle: 'preserve-3d',
                    zIndex: 100 - pos.y * 10 + pos.z * 5
                  }}
                  onClick={() => setSelectedAgent(isSelected ? null : agentId)}
                >
                  {/* Desk */}
                  <div style={{ transformStyle: 'preserve-3d' }}>
                    <IsometricDesk
                      agentColor={color}
                      isWorking={isWorking}
                      isIdle={isIdle}
                      isSelected={isSelected}
                      deskIcon={agentIcons[agentId as keyof typeof agentIcons]}
                    />
                  </div>

                  {/* Character positioned in front of desk */}
                  <div 
                    className="absolute"
                    style={{
                      left: '40px',
                      top: '60px',
                      transformStyle: 'preserve-3d',
                      transform: 'rotateX(-60deg) rotateZ(45deg) scale(1.5)',
                      zIndex: 1
                    }}
                  >
                    <RobloxCharacter
                      color={color}
                      status={agent.status}
                      scale={isSelected ? 1.15 : 1}
                      isSelected={isSelected}
                    />
                  </div>

                  {/* Agent Info Card (2D overlay) */}
                  <div 
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '100px',
                      transform: 'translate(-50%, 0) rotateX(-60deg) rotateZ(45deg)',
                      transformStyle: 'preserve-3d',
                      pointerEvents: 'none'
                    }}
                  >
                    <div className="text-center transition-all duration-300 
                                  group-hover:scale-105">
                      <div className="font-bold text-sm text-white drop-shadow-lg">
                        {agent.name}
                      </div>
                      <div className="text-xs text-gray-300 drop-shadow-md">
                        {agent.role}
                      </div>
                      {agent.currentTask && (
                        <div className="mt-2 px-3 py-1.5 
                                      bg-gray-900/95 backdrop-blur-md rounded-lg text-xs max-w-[160px] 
                                      border border-gray-700/60 
                                      shadow-xl">
                          💭 {agent.currentTask}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Panel when selected */}
                  {isSelected && (
                    <div 
                      className="fixed top-1/2 right-8 transform -translate-y-1/2
                                w-72 bg-gray-900/95 backdrop-blur-xl rounded-lg
                                border border-gray-700 shadow-2xl p-6
                                animate-in fade-in slide-in-from-right-4 duration-300 z-[200]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{agent.avatar}</span>
                          <div>
                            <div className="font-bold text-lg">{agent.name}</div>
                            <div className="text-sm text-gray-400">{agent.role}</div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(null);
                          }}
                          className="text-gray-400 hover:text-white transition-colors text-xl">
                          ✕
                        </button>
                      </div>
                      
                      <div className="space-y-3 text-sm">
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
                          <span className="text-white text-xs">
                            {agent.lastActivity ? new Date(agent.lastActivity).toLocaleTimeString() : 'Never'}
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-800">
                          <button className="w-full py-2.5 bg-gray-800 hover:bg-gray-700
                                           rounded-lg transition-colors text-white text-sm font-medium">
                            View Full Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Office Props */}
            
            {/* Plants */}
            <div 
              className="absolute"
              style={{
                left: `${300 + isoX(100, -200)}px`,
                top: `${300 + isoY(100, -200, 0)}px`,
                transform: 'rotateX(-60deg) rotateZ(45deg) scale(2)',
                transformStyle: 'preserve-3d',
                animation: 'sway 4s ease-in-out infinite'
              }}
            >
              🪴
            </div>
            
            <div 
              className="absolute"
              style={{
                left: `${300 + isoX(-200, 100)}px`,
                top: `${300 + isoY(-200, 100, 0)}px`,
                transform: 'rotateX(-60deg) rotateZ(45deg) scale(2)',
                transformStyle: 'preserve-3d',
                animation: 'sway 3.5s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            >
              🪴
            </div>

            {/* Exit Door */}
            <div 
              className="absolute cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: `${300 + isoX(200, 200)}px`,
                top: `${300 + isoY(200, 200, 0)}px`,
                transform: 'rotateX(-60deg) rotateZ(45deg) scale(2.5)',
                transformStyle: 'preserve-3d'
              }}
            >
              🚪
            </div>

            {/* Coffee Station */}
            <div 
              className="absolute cursor-pointer hover:scale-110 transition-transform group"
              style={{
                left: `${300 + isoX(-200, -200)}px`,
                top: `${300 + isoY(-200, -200, 0)}px`,
                transform: 'rotateX(-60deg) rotateZ(45deg) scale(2)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="relative">
                {/* Steam */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                              flex flex-col items-center gap-1">
                  <div className="text-xs opacity-0 animate-steam" style={{ animationDelay: '0s' }}>💨</div>
                  <div className="text-xs opacity-0 animate-steam" style={{ animationDelay: '0.5s' }}>💨</div>
                </div>
                ☕
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed & Team Status (unchanged) */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-6
                      shadow-xl">
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
                             transition-all"
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

        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-6
                      shadow-xl">
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
                              transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent.avatar}</span>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-xs text-gray-400">{agent.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full transition-all
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

          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <div className="text-2xl font-bold text-green-400">
                  {agents?.filter(a => a.status === "working").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Working</div>
              </div>
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <div className="text-2xl font-bold text-amber-400">
                  {agents?.filter(a => a.status === "idle").length ?? 0}
                </div>
                <div className="text-xs text-gray-500">Idle</div>
              </div>
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20">
                <div className="text-2xl font-bold text-gray-400">
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
