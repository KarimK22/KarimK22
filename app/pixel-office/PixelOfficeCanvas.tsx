"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type AgentState = "idle"|"thinking"|"writing"|"reading"|"executing"|"browsing"|"waiting"|"error";

export interface AgentData {
  id: string; label: string; role: string; color: string;
  desk: { x: number; y: number };
  state: AgentState; activity: string; last_tool?: string;
}

interface Character {
  agent: AgentData; pos: Vec2; target: Vec2; path: Vec2[];
  frame: number; direction: "up"|"down"|"left"|"right"; moving: boolean;
}

interface Vec2 { x: number; y: number; }

// ── Config ─────────────────────────────────────────────────────────────────────
const OFFICE_W   = 20;
const OFFICE_H   = 16;
const TILE_SIZE  = 36;
const MOVE_SPEED = 2;
const WANDER_MS  = 8000;

const STATE_COLORS: Record<string, string> = {
  idle: "#666", thinking: "#FFD700", writing: "#00FF88",
  reading: "#00BFFF", executing: "#FF8C00", browsing: "#DA70D6",
  waiting: "#FF4444", error: "#FF0000",
};
const STATE_ICONS: Record<string, string> = {
  idle: "💤", thinking: "💭", writing: "✍️", reading: "📖",
  executing: "⚡", browsing: "🌐", waiting: "⏳", error: "❌",
};

// ── BFS ────────────────────────────────────────────────────────────────────────
function bfs(start: Vec2, goal: Vec2, blocked: Set<string>): Vec2[] {
  const key = (v: Vec2) => `${v.x},${v.y}`;
  const queue = [start];
  const visited = new Set([key(start)]);
  const parent = new Map<string, Vec2|null>([[key(start), null]]);
  const dirs = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.x === goal.x && cur.y === goal.y) {
      const path: Vec2[] = [];
      let node: Vec2|null = cur;
      while (node) { path.unshift(node); node = parent.get(key(node)) ?? null; }
      return path;
    }
    for (const d of dirs) {
      const next = {x: cur.x+d.x, y: cur.y+d.y};
      const nk = key(next);
      if (next.x>0 && next.x<OFFICE_W-1 && next.y>0 && next.y<OFFICE_H-1 && !visited.has(nk) && !blocked.has(nk)) {
        visited.add(nk); parent.set(nk, cur); queue.push(next);
      }
    }
  }
  return [start];
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function PixelOfficeCanvas({ agents }: { agents: AgentData[] }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const charsRef    = useRef<Map<string, Character>>(new Map());
  const spritesRef  = useRef<Map<string, HTMLImageElement>>(new Map());
  const animRef     = useRef(0);
  const frameRef    = useRef(0);
  const lastWander  = useRef(Date.now());
  const agentsRef   = useRef(agents);
  agentsRef.current = agents;

  const ts = TILE_SIZE;

  const blocked = useCallback((): Set<string> => {
    const s = new Set<string>();
    for (let x = 0; x < OFFICE_W; x++) { s.add(`${x},0`); s.add(`${x},${OFFICE_H-1}`); }
    for (let y = 0; y < OFFICE_H; y++) { s.add(`0,${y}`); s.add(`${OFFICE_W-1},${y}`); }
    for (const a of agentsRef.current) s.add(`${a.desk.x},${a.desk.y}`);
    return s;
  }, []);

  const g2p = (g: Vec2): Vec2 => ({x: g.x*ts + ts/2, y: g.y*ts + ts/2});

  // Init / sync characters when agents prop changes
  useEffect(() => {
    for (const agent of agents) {
      if (!charsRef.current.has(agent.id)) {
        const pos = g2p(agent.desk);
        charsRef.current.set(agent.id, {
          agent, pos, target: pos, path: [],
          frame: Math.floor(Math.random()*60),
          direction: "down", moving: false,
        });
      } else {
        const char = charsRef.current.get(agent.id)!;
        const prevState = char.agent.state;
        char.agent = agent;
        // Send to desk if just became active
        if (prevState === "idle" && agent.state !== "idle") {
          const deskPx = g2p(agent.desk);
          const curGrid = {x: Math.floor(char.pos.x/ts), y: Math.floor(char.pos.y/ts)};
          const path = bfs(curGrid, agent.desk, blocked());
          char.path   = path.slice(1).map(g2p);
          if (char.path.length) { char.target = char.path[0]; char.moving = true; }
        }
      }
    }
  }, [agents]);

  // Load sprites
  useEffect(() => {
    const load = (name: string, url: string) => {
      const img = new Image();
      img.onload = () => spritesRef.current.set(name, img);
      img.src = url;
    };
    load("floor",        "/tiles/floor.png");
    load("wall",         "/tiles/wall.png");
    load("desk_apex",    "/tiles/desk_apex.png");
    load("desk_insight", "/tiles/desk_insight.png");
    load("desk_vibe",    "/tiles/desk_vibe.png");
    load("desk_mission", "/tiles/desk_mission.png");
    load("char_apex",    "/sprites/char_apex.png");
    load("char_insight", "/sprites/char_insight.png");
    load("char_vibe",    "/sprites/char_vibe.png");
    load("char_mission", "/sprites/char_mission.png");
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    canvas.width  = OFFICE_W * ts;
    canvas.height = OFFICE_H * ts;

    const sprites = spritesRef.current;

    function drawFloor() {
      const floorSpr = sprites.get("floor");
      if (floorSpr) {
        for (let y = 1; y < OFFICE_H-1; y++)
          for (let x = 1; x < OFFICE_W-1; x++)
            ctx.drawImage(floorSpr, x*ts, y*ts, ts, ts);
      } else {
        ctx.fillStyle = "#1e1e2e";
        ctx.fillRect(0, 0, OFFICE_W*ts, OFFICE_H*ts);
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        for (let y=0; y<OFFICE_H; y++)
          for (let x=0; x<OFFICE_W; x++)
            if ((x+y)%2===0) ctx.fillRect(x*ts, y*ts, ts, ts);
      }
    }

    function drawWalls() {
      const wallSpr = sprites.get("wall");
      for (let x = 0; x < OFFICE_W; x++) {
        if (wallSpr) {
          ctx.drawImage(wallSpr, x*ts, 0, ts, ts);
          ctx.drawImage(wallSpr, x*ts, (OFFICE_H-1)*ts, ts, ts);
        } else {
          ctx.fillStyle = "#11111b";
          ctx.fillRect(x*ts, 0, ts, ts);
          ctx.fillRect(x*ts, (OFFICE_H-1)*ts, ts, ts);
        }
      }
      for (let y = 0; y < OFFICE_H; y++) {
        if (wallSpr) {
          ctx.drawImage(wallSpr, 0, y*ts, ts, ts);
          ctx.drawImage(wallSpr, (OFFICE_W-1)*ts, y*ts, ts, ts);
        } else {
          ctx.fillStyle = "#11111b";
          ctx.fillRect(0, y*ts, ts, ts);
          ctx.fillRect((OFFICE_W-1)*ts, y*ts, ts, ts);
        }
      }
      ctx.fillStyle = "#FFD700";
      ctx.font = `bold ${ts*0.42}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("🏴 AI COMPANY HEADQUARTERS", OFFICE_W*ts/2, ts*0.68);
    }

    function drawDesks(chars: Character[]) {
      for (const char of chars) {
        const { x, y } = char.agent.desk;
        const px = x*ts, py = y*ts;
        const deskSpr = sprites.get(`desk_${char.agent.id}`);
        if (deskSpr) {
          ctx.drawImage(deskSpr, px - ts*0.8, py - ts*0.6, ts*2, ts*2);
        } else {
          ctx.fillStyle = "#3a2510";
          ctx.fillRect(px - ts*0.5, py - ts*0.15, ts, ts*0.7);
          // Screen
          const stateColor = STATE_COLORS[char.agent.state] || "#003366";
          const pulse = 0.6 + 0.4*Math.sin(frameRef.current/10);
          ctx.fillStyle = char.agent.state === "idle" ? "#003366"
            : stateColor + Math.floor(pulse*180).toString(16).padStart(2,"0");
          ctx.fillRect(px - ts*0.25, py - ts*0.42, ts*0.5, ts*0.35);
        }
        // Name tag
        ctx.fillStyle = char.agent.color;
        ctx.font = `bold ${ts*0.2}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(char.agent.label, px, py + ts*0.85);
      }
    }

    function drawChar(char: Character) {
      const { pos, agent, moving, direction } = char;
      const charSpr = sprites.get(`char_${agent.id}`);

      // State glow
      if (agent.state !== "idle") {
        const sc = STATE_COLORS[agent.state] || "#fff";
        const pulse = 0.25 + 0.15*Math.sin(frameRef.current/8);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = sc;
        ctx.fillRect(pos.x - ts*0.5, pos.y - ts*0.9, ts, ts*1.2);
        ctx.globalAlpha = 1;
      }

      if (charSpr) {
        const SPRITE_W = 32, SPRITE_H = 32;
        const dirRow = {down:0, left:1, right:2, up:3}[direction] ?? 0;
        const frameCol = moving ? Math.floor(char.frame/8) % 4 : 0;
        ctx.drawImage(charSpr,
          frameCol*SPRITE_W, dirRow*SPRITE_H, SPRITE_W, SPRITE_H,
          pos.x - ts*0.5, pos.y - ts*0.85, ts, ts
        );
      } else {
        // Placeholder
        const bob = moving ? Math.sin(frameRef.current/4)*2 : 0;
        const cx = pos.x, cy = pos.y + bob;
        const sz = ts*0.35;
        ctx.fillStyle = agent.color + "44";
        ctx.fillRect(cx - sz*0.3, cy - sz*0.8, sz*0.6, sz*1.6);
        ctx.fillStyle = agent.color;
        ctx.fillRect(cx - sz*0.25, cy - sz*0.65, sz*0.5, sz*0.5);
      }
    }

    function drawHUD(chars: Character[]) {
      for (const char of chars) {
        const { pos, agent } = char;
        if (agent.state !== "idle" && agent.activity) {
          // Speech bubble
          ctx.font = `${ts*0.2}px monospace`;
          const tw = ctx.measureText(agent.activity).width;
          const bw = tw + 8, bh = ts*0.28;
          const bx = pos.x - bw/2, by = pos.y - ts*1.1 - bh;
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = 1;
          ctx.beginPath();
          (ctx as any).roundRect?.(bx, by, bw, bh, 3) || ctx.rect(bx, by, bw, bh);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.fillText(agent.activity, pos.x, by + bh*0.72);
        }
        const icon = STATE_ICONS[agent.state];
        if (icon && agent.state !== "idle") {
          ctx.font = `${ts*0.45}px serif`;
          ctx.textAlign = "center";
          ctx.fillText(icon, pos.x, pos.y - ts*0.95);
        }
      }
    }

    function loop() {
      frameRef.current = (frameRef.current + 1) % 120;

      // Wander logic
      if (Date.now() - lastWander.current > WANDER_MS) {
        lastWander.current = Date.now();
        const bl = blocked();
        for (const char of charsRef.current.values()) {
          if (char.agent.state === "idle" && !char.moving && Math.random() < 0.5) {
            const curGrid = {x: Math.floor(char.pos.x/ts), y: Math.floor(char.pos.y/ts)};
            const dx = Math.floor(Math.random()*5)-2, dy = Math.floor(Math.random()*5)-2;
            const goal = {x: Math.max(1, Math.min(OFFICE_W-2, curGrid.x+dx)),
                          y: Math.max(1, Math.min(OFFICE_H-2, curGrid.y+dy))};
            if (!bl.has(`${goal.x},${goal.y}`)) {
              const path = bfs(curGrid, goal, bl);
              char.path = path.slice(1).map(g2p);
              if (char.path.length) { char.target = char.path[0]; char.moving = true; }
            }
          }
        }
      }

      // Move characters
      for (const char of charsRef.current.values()) {
        if (!char.moving) continue;
        const dx = char.target.x - char.pos.x, dy = char.target.y - char.pos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MOVE_SPEED) {
          char.pos = {...char.target};
          char.path.shift();
          if (char.path.length) {
            char.target = char.path[0];
            const ndx = char.target.x - char.pos.x, ndy = char.target.y - char.pos.y;
            char.direction = Math.abs(ndx)>Math.abs(ndy) ? (ndx>0?"right":"left") : (ndy>0?"down":"up");
          } else { char.moving = false; }
        } else {
          char.pos = {x: char.pos.x + (dx/dist)*MOVE_SPEED, y: char.pos.y + (dy/dist)*MOVE_SPEED};
        }
        char.frame = (char.frame + 1) % 60;
      }

      // Render
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const chars = Array.from(charsRef.current.values()).sort((a,b) => a.pos.y - b.pos.y);
      drawFloor();
      drawWalls();
      drawDesks(chars);
      chars.forEach(drawChar);
      drawHUD(chars);

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated", border: "1px solid #333", borderRadius: 8 }}
    />
  );
}
