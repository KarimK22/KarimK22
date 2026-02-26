"use client";

import { useEffect, useState } from "react";

export default function OfficePage() {
  const agents = [
    {
      _id: "apex-001",
      agentId: "main",
      name: "APEX",
      role: "Chief Executive Officer",
      avatar: "🏴",
      status: "working",
      currentTask: "Strategic planning & coordination",
      lastActivity: Date.now(),
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.5)",
      deskItem: "📱",
      screenType: "executive",
    },
    {
      _id: "insight-001",
      agentId: "insight",
      name: "INSIGHT",
      role: "Chief Marketing & Analytics Officer",
      avatar: "👁️",
      status: "working",
      currentTask: "Analyzing user metrics & trends",
      lastActivity: Date.now(),
      color: "#3b82f6",
      glowColor: "rgba(59, 130, 246, 0.5)",
      deskItem: "📊",
      screenType: "analytics",
    },
    {
      _id: "vibe-001",
      agentId: "vibe",
      name: "VIBE",
      role: "Chief Creative Officer",
      avatar: "🎨",
      status: "working",
      currentTask: "Designing luxury office upgrade",
      lastActivity: Date.now(),
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.5)",
      deskItem: "🎨",
      screenType: "creative",
    },
    {
      _id: "mission-001",
      agentId: "mission",
      name: "MISSION",
      role: "Chief of Operations",
      avatar: "📊",
      status: "working",
      currentTask: "Monitoring systems & operations",
      lastActivity: Date.now(),
      color: "#06b6d4",
      glowColor: "rgba(6, 182, 212, 0.5)",
      deskItem: "🖥️",
      screenType: "monitoring",
    },
  ];

  const [time, setTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const isEvening = hour >= 18 && hour < 22;

  // Diamond layout — APEX top, MISSION left, INSIGHT right, VIBE bottom
  const officeLayout = [
    { id: "main",    x: 42, y: 14,  desk: "Executive Suite",    z: 2 },
    { id: "mission", x: 13, y: 50,  desk: "Command Center",     z: 1 },
    { id: "insight", x: 72, y: 50,  desk: "Analytics Station",  z: 1 },
    { id: "vibe",    x: 42, y: 76,  desk: "Creative Studio",    z: 0 },
  ];

  // Screen content per agent type
  const getScreenContent = (screenType: string, color: string, isWorking: boolean) => {
    if (!isWorking) return (
      <div className="w-full h-full rounded flex items-center justify-center bg-gray-900/80">
        <div className="text-xs text-gray-600 animate-pulse">💤</div>
      </div>
    );

    if (screenType === "executive") return (
      <div className="w-full h-full rounded relative overflow-hidden bg-gray-950">
        <div className="absolute inset-1 space-y-0.5 p-0.5">
          {[80, 60, 90, 45, 70].map((w, i) => (
            <div key={i} className="h-0.5 rounded animate-pulse"
                 style={{ width: `${w}%`, background: color, opacity: 0.7, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(to top, ${color}15, transparent)` }} />
      </div>
    );

    if (screenType === "analytics") return (
      <div className="w-full h-full rounded relative overflow-hidden bg-gray-950">
        <div className="absolute bottom-1 left-1 right-1 flex items-end gap-0.5 h-3/4">
          {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm animate-pulse"
                 style={{ height: `${h}%`, background: color, opacity: 0.6, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(to top, ${color}15, transparent)` }} />
      </div>
    );

    if (screenType === "monitoring") return (
      <div className="w-full h-full rounded relative overflow-hidden bg-gray-950">
        <div className="absolute inset-1 space-y-0.5">
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />
            <div className="flex-1 h-0.5 rounded" style={{ background: color, opacity: 0.4 }} />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="flex-1 h-0.5 rounded bg-green-400 opacity-40" />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
            <div className="w-3/4 h-0.5 rounded bg-amber-400 opacity-40" />
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color, animationDelay: '0.9s' }} />
            <div className="flex-1 h-0.5 rounded" style={{ background: color, opacity: 0.4 }} />
          </div>
        </div>
        <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(to top, ${color}15, transparent)` }} />
      </div>
    );

    // creative
    return (
      <div className="w-full h-full rounded relative overflow-hidden bg-gray-950">
        <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
          {[color, '#ec4899', '#8b5cf6', '#f59e0b', color, '#ec4899'].map((c, i) => (
            <div key={i} className="rounded-sm animate-pulse"
                 style={{ background: c, opacity: 0.5, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(to top, ${color}15, transparent)` }} />
      </div>
    );
  };

  return (
    <div className="p-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">🏛️ The Office</h1>
          <p className="text-sm mt-0.5" style={{ color: '#b8a070' }}>APEX AI Company — Executive Headquarters</p>
        </div>
        <div className="text-sm px-4 py-2 rounded-full border"
             style={{ color: '#b8a070', borderColor: '#b8a07040', background: 'rgba(184,160,112,0.06)' }}>
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          OFFICE FLOOR PLAN — Luxury Executive HQ
          ───────────────────────────────────────── */}
      <div className="rounded-xl border mb-8 relative overflow-hidden shadow-2xl"
           style={{
             borderColor: '#b8a07030',
             background: '#0d0c08',
             boxShadow: '0 25px 80px rgba(0,0,0,0.8), inset 0 0 120px rgba(184,160,112,0.03)',
           }}>

        {/* ── CITY SKYLINE BACKDROP ── */}
        <div className="absolute inset-x-0 top-0 h-56 overflow-hidden pointer-events-none"
             style={{ opacity: 0.35 }}>
          {/* Sky gradient */}
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to bottom, #070508 0%, #0e0a14 60%, transparent 100%)' }} />
          {/* Building silhouettes */}
          <svg viewBox="0 0 1200 220" className="absolute bottom-0 w-full h-full" preserveAspectRatio="xMidYMax meet">
            {/* Far buildings — darker */}
            <rect x="0"   y="100" width="60"  height="120" fill="#1a1520" />
            <rect x="50"  y="60"  width="45"  height="160" fill="#1a1520" />
            <rect x="90"  y="80"  width="70"  height="140" fill="#1a1520" />
            <rect x="150" y="40"  width="55"  height="180" fill="#1a1520" />
            <rect x="200" y="90"  width="40"  height="130" fill="#1a1520" />
            <rect x="230" y="50"  width="80"  height="170" fill="#1a1520" />
            <rect x="300" y="70"  width="50"  height="150" fill="#1a1520" />
            <rect x="345" y="30"  width="65"  height="190" fill="#1a1520" />
            <rect x="400" y="85"  width="45"  height="135" fill="#1a1520" />
            <rect x="440" y="55"  width="70"  height="165" fill="#1a1520" />
            <rect x="505" y="20"  width="55"  height="200" fill="#1a1520" />
            <rect x="555" y="75"  width="60"  height="145" fill="#1a1520" />
            <rect x="610" y="45"  width="80"  height="175" fill="#1a1520" />
            <rect x="685" y="65"  width="50"  height="155" fill="#1a1520" />
            <rect x="730" y="35"  width="65"  height="185" fill="#1a1520" />
            <rect x="790" y="80"  width="45"  height="140" fill="#1a1520" />
            <rect x="830" y="50"  width="75"  height="170" fill="#1a1520" />
            <rect x="900" y="25"  width="60"  height="195" fill="#1a1520" />
            <rect x="955" y="70"  width="50"  height="150" fill="#1a1520" />
            <rect x="1000" y="45" width="80"  height="175" fill="#1a1520" />
            <rect x="1075" y="60" width="55"  height="160" fill="#1a1520" />
            <rect x="1125" y="90" width="75"  height="130" fill="#1a1520" />
            {/* Glowing windows — amber/gold */}
            {[
              [55,70],[56,82],[57,94],[70,65],[72,77],[91,90],[92,105],[160,52],[161,65],[162,78],
              [235,62],[236,75],[237,88],[238,101],[310,82],[311,95],[350,40],[351,55],[352,68],
              [445,65],[446,78],[510,28],[511,42],[512,55],[513,68],[560,82],[561,95],[615,53],
              [616,68],[617,83],[690,72],[691,85],[735,42],[736,57],[737,70],[795,88],[795,100],
              [835,58],[836,72],[837,85],[905,32],[906,48],[907,62],[908,75],[960,78],[961,90],
              [1005,52],[1006,68],[1007,83],[1080,65],[1081,80],[1130,95],[1131,108],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="3" height="3" fill="#d4af37" opacity="0.6"
                    style={{ animation: `windowFlicker ${2 + (i % 5) * 0.7}s ease-in-out infinite`, animationDelay: `${(i * 0.3) % 3}s` }} />
            ))}
          </svg>
        </div>

        {/* ── GLASS WALL FRAME ── */}
        <div className="absolute inset-x-0 top-0 h-56 pointer-events-none border-b"
             style={{ borderColor: '#b8a07018', background: 'linear-gradient(to bottom, rgba(184,160,112,0.02), transparent)' }} />

        {/* ── MARBLE FLOOR ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ top: '180px' }}>
          {/* Base charcoal */}
          <div className="absolute inset-0" style={{ background: '#111008' }} />
          {/* Marble tile grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(184,160,112,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(184,160,112,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
          {/* Gold veining — diagonal streaks */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0,80 Q200,60 400,100 T800,80 T1200,90" stroke="#b8a070" strokeWidth="0.4" fill="none" opacity="0.15" />
            <path d="M0,180 Q300,150 600,200 T1200,170" stroke="#b8a070" strokeWidth="0.3" fill="none" opacity="0.12" />
            <path d="M100,0 Q150,100 180,300 T220,600" stroke="#b8a070" strokeWidth="0.4" fill="none" opacity="0.1" />
            <path d="M400,0 Q430,120 450,280 T480,600" stroke="#b8a070" strokeWidth="0.3" fill="none" opacity="0.1" />
            <path d="M700,0 Q740,150 760,320 T790,600" stroke="#b8a070" strokeWidth="0.4" fill="none" opacity="0.1" />
            <path d="M1000,0 Q1020,100 1040,300 T1080,600" stroke="#b8a070" strokeWidth="0.3" fill="none" opacity="0.1" />
            <path d="M0,320 Q400,280 700,340 T1200,310" stroke="#c9a227" strokeWidth="0.5" fill="none" opacity="0.08" />
          </svg>
          {/* Warm ambient glow from floor */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 42% 50%, rgba(184,160,112,0.04), transparent 60%)' }} />
        </div>

        {/* ── GOLD PERIMETER TRIM ── */}
        <div className="absolute inset-4 rounded-lg pointer-events-none"
             style={{ border: '1px solid rgba(184,160,112,0.15)', boxShadow: 'inset 0 0 80px rgba(184,160,112,0.02)' }} />

        {/* ── WALL ART — top-left, gold-framed abstract ── */}
        <div className="absolute pointer-events-none"
             style={{ top: '24px', left: '24px', width: '72px', height: '60px' }}>
          <div className="w-full h-full rounded-sm relative overflow-hidden"
               style={{ border: '2px solid #b8a070', background: '#1a1510', boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px #b8a07030' }}>
            {/* Abstract art */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2d1c4a 0%, #0d1a2e 50%, #1a0d0a 100%)' }} />
            <div className="absolute" style={{ top: '30%', left: '10%', width: '40%', height: '3px', background: '#d4af37', opacity: 0.6, borderRadius: '2px' }} />
            <div className="absolute" style={{ top: '50%', left: '25%', width: '60%', height: '1px', background: '#b8a070', opacity: 0.4 }} />
            <div className="absolute" style={{ top: '20%', left: '55%', width: '2px', height: '50%', background: '#8b5cf6', opacity: 0.5, borderRadius: '1px' }} />
            {/* Gold frame edge accent */}
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 8px rgba(184,160,112,0.15)' }} />
          </div>
          <div className="text-center text-xs mt-1" style={{ color: '#b8a07060', fontSize: '9px' }}>Art Collection</div>
        </div>

        {/* ── WALL ART — top-right ── */}
        <div className="absolute pointer-events-none"
             style={{ top: '24px', right: '24px', width: '72px', height: '60px' }}>
          <div className="w-full h-full rounded-sm relative overflow-hidden"
               style={{ border: '2px solid #b8a070', background: '#1a1510', boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px #b8a07030' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #0d1f1a 0%, #1a1020 50%, #1f1a00 100%)' }} />
            <div className="absolute" style={{ top: '35%', left: '15%', width: '70%', height: '2px', background: '#06b6d4', opacity: 0.5, borderRadius: '2px' }} />
            <div className="absolute" style={{ top: '55%', left: '20%', width: '50%', height: '1px', background: '#10b981', opacity: 0.4 }} />
            <div className="absolute" style={{ top: '15%', left: '65%', width: '2px', height: '40%', background: '#d4af37', opacity: 0.6, borderRadius: '1px' }} />
            <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 8px rgba(184,160,112,0.15)' }} />
          </div>
          <div className="text-center text-xs mt-1" style={{ color: '#b8a07060', fontSize: '9px' }}>Art Collection</div>
        </div>

        {/* ── HQ TITLE ── */}
        <div className="absolute pointer-events-none" style={{ top: '28px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="text-center">
            <div className="text-lg font-bold tracking-[0.3em] uppercase"
                 style={{ color: '#b8a07080', textShadow: '0 0 30px rgba(184,160,112,0.2)' }}>
              AI Company HQ
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #b8a070)' }} />
              <div className="w-1 h-1 rounded-full" style={{ background: '#d4af37' }} />
              <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #b8a070)' }} />
            </div>
          </div>
        </div>

        {/* ── TIME / LIGHTING INDICATOR ── */}
        <div className="absolute z-20 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
             style={{ top: '16px', right: '110px', background: 'rgba(13,12,8,0.8)', border: '1px solid rgba(184,160,112,0.2)', color: '#b8a070', backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: isDaytime ? '#fcd34d' : isEvening ? '#fb923c' : '#818cf8' }} />
          {isDaytime ? '☀️ Day' : isEvening ? '🌆 Evening' : '🌙 Night'}
        </div>

        {/* ── OFFICE FLOOR ── */}
        <div className="relative" style={{ height: '760px' }}>

          {/* ── CONFERENCE TABLE — center diamond ── */}
          <div className="absolute z-10"
               style={{ left: '42%', top: '48%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative flex flex-col items-center">
              {/* Table shadow */}
              <div className="absolute rounded-full blur-xl" style={{ bottom: '-12px', width: '180px', height: '30px', background: 'rgba(0,0,0,0.7)' }} />
              {/* Table surface */}
              <div className="rounded-xl flex items-center justify-center relative overflow-hidden"
                   style={{
                     width: '160px', height: '100px',
                     background: 'linear-gradient(145deg, #2d1c0e 0%, #1a0f07 60%, #231508 100%)',
                     border: '2px solid #b8a070',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(184,160,112,0.15), 0 0 0 1px rgba(184,160,112,0.05)',
                   }}>
                {/* Gold inlay pattern */}
                <div className="absolute inset-3 rounded-lg" style={{ border: '1px solid rgba(184,160,112,0.2)' }} />
                <div className="text-center z-10 relative">
                  <div className="text-base">📋</div>
                  <div className="text-xs mt-0.5" style={{ color: '#b8a07080' }}>Board Room</div>
                </div>
                {/* Reflection */}
                <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(145deg, rgba(184,160,112,0.05) 0%, transparent 50%)' }} />
              </div>
              {/* Ghost chairs around table */}
              {[
                { top: '-18px', left: '50%', transform: 'translateX(-50%)' },
                { bottom: '-18px', left: '50%', transform: 'translateX(-50%)' },
                { left: '-18px', top: '50%', transform: 'translateY(-50%)' },
                { right: '-18px', top: '50%', transform: 'translateY(-50%)' },
              ].map((pos, i) => (
                <div key={i} className="absolute w-7 h-7 rounded-full"
                     style={{ ...pos, background: 'rgba(30,20,10,0.8)', border: '1px solid rgba(184,160,112,0.15)' }} />
              ))}
            </div>
          </div>

          {/* ── ARCHITECTURAL PLANTS ── */}
          {/* Bottom-left */}
          <div className="absolute flex flex-col items-center pointer-events-none"
               style={{ bottom: '28px', left: '28px' }}>
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))', animation: 'sway 4s ease-in-out infinite' }}>🌿</div>
            <div className="text-4xl -mt-2" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))', animation: 'sway 3.8s ease-in-out infinite', animationDelay: '0.3s' }}>🪴</div>
          </div>
          {/* Bottom-right */}
          <div className="absolute flex flex-col items-center pointer-events-none"
               style={{ bottom: '28px', right: '28px' }}>
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))', animation: 'sway 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>🌿</div>
            <div className="text-4xl -mt-2" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))', animation: 'sway 4.2s ease-in-out infinite', animationDelay: '0.8s' }}>🪴</div>
          </div>
          {/* Coffee station */}
          <div className="absolute flex flex-col items-center"
               style={{ top: '120px', left: '28px' }}>
            <div className="text-3xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>☕</div>
            <div className="text-xs mt-1" style={{ color: '#b8a07050', fontSize: '10px' }}>Coffee</div>
          </div>
          {/* Frosted exit door */}
          <div className="absolute flex flex-col items-center"
               style={{ bottom: '28px', right: '50%', transform: 'translateX(50%)' }}>
            <div className="text-3xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>🚪</div>
            <div className="text-xs mt-1" style={{ color: '#b8a07050', fontSize: '10px' }}>Exit</div>
          </div>

          {/* ── AGENT WORKSTATIONS ── */}
          {officeLayout.map((station) => {
            const agent = agents.find(a => a.agentId === station.id);
            if (!agent) return null;

            const isWorking = agent.status === "working";
            const isIdle = agent.status === "idle";
            const isSelected = selectedAgent === station.id;

            return (
              <div key={station.id}
                   className="absolute cursor-pointer group"
                   style={{
                     left: `${station.x}%`,
                     top: `${station.y}%`,
                     transform: 'translate(-50%, -50%)',
                     zIndex: isSelected ? 50 : 10 + station.z,
                   }}
                   onClick={() => setSelectedAgent(isSelected ? null : station.id)}>

                <div className="relative transition-all duration-500 ease-out group-hover:-translate-y-2"
                     style={{ transform: isSelected ? 'scale(1.08) translateY(-8px)' : undefined }}>

                  {/* Ceiling spotlight / ambient pool */}
                  <div className="absolute rounded-full blur-2xl pointer-events-none transition-all duration-500"
                       style={{
                         width: '140px', height: '140px',
                         top: '-30px', left: '-20px',
                         background: isWorking
                           ? `radial-gradient(circle, ${agent.glowColor} 0%, transparent 70%)`
                           : 'radial-gradient(circle, rgba(184,160,112,0.06) 0%, transparent 70%)',
                         opacity: isSelected ? 1 : isWorking ? 0.7 : 0.3,
                       }} />

                  {/* ── GLASS DESK ── */}
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden mb-1"
                       style={{
                         background: 'linear-gradient(145deg, rgba(8,18,28,0.92) 0%, rgba(4,10,18,0.95) 100%)',
                         border: `1.5px solid ${isWorking ? agent.color : '#b8a070'}`,
                         borderOpacity: 0.6,
                         boxShadow: isWorking
                           ? `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(184,160,112,0.1), 0 0 20px ${agent.glowColor}40`
                           : '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(184,160,112,0.1)',
                         perspective: '600px',
                       }}>

                    {/* Gold trim line at top */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                         style={{ background: `linear-gradient(to right, transparent, ${isWorking ? agent.color : '#b8a070'}, transparent)`, opacity: 0.7 }} />

                    {/* Glass reflection */}
                    <div className="absolute inset-0 rounded-lg pointer-events-none"
                         style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />

                    {/* Monitor bezel */}
                    <div className="absolute w-24 h-[52px] rounded-sm"
                         style={{ top: '6px', left: '50%', transform: 'translateX(-50%)', background: '#0a0a0a', border: '1.5px solid #1a1a1a', boxShadow: isWorking ? `0 0 12px ${agent.glowColor}` : 'none' }}>
                      {/* Screen */}
                      <div className="absolute inset-0.5 rounded-sm overflow-hidden">
                        {getScreenContent(agent.screenType, agent.color, isWorking)}
                      </div>
                    </div>

                    {/* Keyboard */}
                    <div className="absolute bottom-3 left-1/2 rounded-sm"
                         style={{ transform: 'translateX(-50%)', width: '68px', height: '10px', background: '#0d1218', border: '1px solid #1a2030', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                      <div className="absolute inset-1 grid grid-cols-6 gap-px opacity-40">
                        {Array(6).fill(0).map((_,i) => <div key={i} className="rounded-sm" style={{ background: '#2a3040', height: '3px' }} />)}
                      </div>
                    </div>

                    {/* Mouse */}
                    <div className="absolute bottom-3 right-3 rounded-sm"
                         style={{ width: '8px', height: '12px', background: '#0d1218', border: '1px solid #1a2030' }} />

                    {/* Desk item (agent-specific prop) */}
                    <div className="absolute top-1.5 right-2 text-sm leading-none">
                      {agent.deskItem}
                    </div>

                    {/* Gold nameplate at bottom */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-sm"
                         style={{ background: 'rgba(184,160,112,0.08)', border: '1px solid rgba(184,160,112,0.2)', whiteSpace: 'nowrap' }}>
                      <div className="text-center" style={{ fontSize: '7px', color: '#b8a070', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        {station.desk}
                      </div>
                    </div>
                  </div>

                  {/* ── LEATHER CHAIR (visual) ── */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
                       style={{ width: '50px', height: '12px', background: '#1a1008', border: '1px solid rgba(184,160,112,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />

                  {/* ── AGENT AVATAR ── */}
                  <div className="flex flex-col items-center mt-1">
                    {/* Avatar ring */}
                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                         style={{
                           background: `radial-gradient(circle at 30% 30%, ${agent.color}20, rgba(13,12,8,0.8))`,
                           border: `2px solid ${agent.color}`,
                           boxShadow: isWorking ? `0 0 0 3px ${agent.glowColor}30, 0 0 20px ${agent.glowColor}40, 0 8px 24px rgba(0,0,0,0.5)` : '0 8px 24px rgba(0,0,0,0.5)',
                           transition: 'all 0.5s ease',
                         }}>

                      {/* Pulsing aura */}
                      {isWorking && (
                        <div className="absolute inset-0 rounded-full animate-ping"
                             style={{ background: `${agent.color}10`, animationDuration: '2s' }} />
                      )}

                      {agent.avatar}

                      {/* Status dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full"
                           style={{
                             background: isWorking ? agent.color : isIdle ? '#f59e0b' : '#4b5563',
                             border: '2px solid #0d0c08',
                             boxShadow: isWorking ? `0 0 8px ${agent.color}` : 'none',
                           }} />
                    </div>

                    {/* Name + role */}
                    <div className="text-center mt-2">
                      <div className="font-bold text-sm text-white tracking-wide drop-shadow-lg">
                        {agent.name}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#c9b090' }}>{agent.role}</div>

                      {/* Task bubble */}
                      {agent.currentTask && (
                        <div className="mt-2 px-3 py-1.5 rounded-lg text-xs max-w-[160px] mx-auto"
                             style={{
                               background: 'rgba(13,12,8,0.9)',
                               border: `1px solid ${agent.color}30`,
                               color: '#d1d5db',
                               backdropFilter: 'blur(8px)',
                               boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${agent.color}10`,
                             }}>
                          💭 {agent.currentTask}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── SELECTED DETAIL PANEL ── */}
                  {isSelected && (
                    <div className="absolute z-50 mt-4 w-64 rounded-xl p-4"
                         style={{
                           top: '100%',
                           left: '50%',
                           transform: 'translateX(-50%)',
                           background: 'rgba(13,12,8,0.97)',
                           border: `1px solid ${agent.color}40`,
                           boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,160,112,0.1), 0 0 30px ${agent.glowColor}20`,
                           backdropFilter: 'blur(20px)',
                         }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                               style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}50` }}>
                            {agent.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{agent.name}</div>
                            <div className="text-xs" style={{ color: '#b8a070' }}>{agent.role}</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedAgent(null); }}
                                className="text-gray-600 hover:text-white transition-colors text-lg leading-none">
                          ✕
                        </button>
                      </div>
                      {/* Divider */}
                      <div className="h-px mb-4" style={{ background: `linear-gradient(to right, transparent, ${agent.color}40, transparent)` }} />
                      {/* Details */}
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span style={{ color: '#b8a07080' }}>Status</span>
                          <span className="font-medium capitalize" style={{ color: agent.color }}>{agent.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: '#b8a07080' }}>Workstation</span>
                          <span className="text-gray-300">{station.desk}</span>
                        </div>
                        {agent.currentTask && (
                          <div>
                            <div className="mb-1" style={{ color: '#b8a07080' }}>Current Task</div>
                            <div className="text-gray-200 leading-relaxed">{agent.currentTask}</div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span style={{ color: '#b8a07080' }}>Last Active</span>
                          <span className="text-gray-300">{new Date(agent.lastActivity).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button className="w-full mt-4 py-2 rounded-lg text-xs font-medium transition-all"
                              style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}40`, color: agent.color }}
                              onMouseEnter={e => (e.currentTarget.style.background = `${agent.color}25`)}
                              onMouseLeave={e => (e.currentTarget.style.background = `${agent.color}15`)}>
                        View Full Profile →
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          TEAM STATUS — Luxury Cards
          ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Live Activity */}
        <div className="rounded-xl p-6" style={{ background: '#0d0c08', border: '1px solid rgba(184,160,112,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="tracking-wide" style={{ color: '#e2d4b8' }}>Live Activity</span>
          </h3>
          <div className="py-8 text-center" style={{ color: '#b8a07040', fontSize: '13px' }}>
            Activity feed connected to Convex
          </div>
        </div>

        {/* Team Status */}
        <div className="rounded-xl p-6" style={{ background: '#0d0c08', border: '1px solid rgba(184,160,112,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
            <span className="text-xl">👥</span>
            <span className="tracking-wide" style={{ color: '#e2d4b8' }}>Executive Team</span>
          </h3>
          <div className="space-y-3">
            {agents.map((agent) => {
              const isWorking = agent.status === "working";
              const isIdle = agent.status === "idle";
              return (
                <div key={agent._id} className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300"
                     style={{
                       background: 'rgba(184,160,112,0.03)',
                       border: '1px solid rgba(184,160,112,0.08)',
                       cursor: 'pointer',
                     }}
                     onMouseEnter={e => (e.currentTarget.style.borderColor = `${agent.color}30`)}
                     onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(184,160,112,0.08)')}
                     onClick={() => setSelectedAgent(agent.agentId)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                         style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}40` }}>
                      {agent.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">{agent.name}</div>
                      <div className="text-xs" style={{ color: '#b8a07070' }}>{agent.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full"
                         style={{
                           background: isWorking ? agent.color : isIdle ? '#f59e0b' : '#4b5563',
                           boxShadow: isWorking ? `0 0 6px ${agent.color}` : 'none',
                           animation: isWorking ? 'pulse 2s ease-in-out infinite' : 'none',
                         }} />
                    <span className="text-xs capitalize" style={{ color: '#b8a07070' }}>{agent.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid rgba(184,160,112,0.1)' }}>
            {[
              { label: 'Active', count: agents.filter(a => a.status === 'working').length, color: '#10b981' },
              { label: 'Idle', count: agents.filter(a => a.status === 'idle').length, color: '#f59e0b' },
              { label: 'Offline', count: agents.filter(a => a.status === 'offline').length, color: '#4b5563' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center py-2 rounded-lg"
                   style={{ background: 'rgba(184,160,112,0.03)', border: '1px solid rgba(184,160,112,0.07)' }}>
                <div className="text-2xl font-bold" style={{ color }}>{count}</div>
                <div className="text-xs mt-0.5" style={{ color: '#b8a07060' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Keyframe Styles ── */}
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg) translateY(0px); }
          50% { transform: rotate(2deg) translateY(-3px); }
        }
        @keyframes windowFlicker {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
