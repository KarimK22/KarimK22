"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState } from "react";

// ========================================
// ISOMETRIC MATH UTILITIES
// ========================================

const ISO_ANGLE = Math.PI / 6; // 30 degrees
const TILE_WIDTH = 256; // 4x from original 64
const TILE_HEIGHT = 128; // 4x from original 32

/**
 * Easing functions for smooth animations
 */
const easeInOutSine = (t: number): number => {
  return -(Math.cos(Math.PI * t) - 1) / 2;
};

const easeOutQuad = (t: number): number => {
  return 1 - (1 - t) * (1 - t);
};

/**
 * Convert 2D grid coordinates to isometric screen coordinates
 */
function gridToScreen(x: number, y: number, z: number = 0) {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2) - z * (TILE_HEIGHT / 2)
  };
}

/**
 * Convert screen coordinates back to grid coordinates (for click detection)
 */
function screenToGrid(screenX: number, screenY: number) {
  const x = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
  const y = (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;
  return { x, y };
}

// ========================================
// ISOMETRIC RENDERING PRIMITIVES
// ========================================

class IsometricRenderer {
  ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;

  constructor(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    this.ctx = ctx;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  /**
   * Draw an isometric floor tile
   */
  drawFloorTile(x: number, y: number, dark: boolean) {
    const pos = gridToScreen(x, y, 0);
    const screenX = pos.x + this.offsetX;
    const screenY = pos.y + this.offsetY;

    this.ctx.save();
    this.ctx.translate(screenX, screenY);

    // Draw diamond shape
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(TILE_WIDTH / 2, TILE_HEIGHT / 2);
    this.ctx.lineTo(0, TILE_HEIGHT);
    this.ctx.lineTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2);
    this.ctx.closePath();

    // Fill with checkered pattern
    this.ctx.fillStyle = dark ? '#1a1a1a' : '#2a2a2a';
    this.ctx.fill();

    // Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw an isometric box (used for desks, characters, etc.)
   */
  drawBox(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    color: string,
    options: {
      topColor?: string;
      rightColor?: string;
      outline?: boolean;
      shadow?: boolean;
    } = {}
  ) {
    const pos = gridToScreen(x, y, z);
    const screenX = pos.x + this.offsetX;
    const screenY = pos.y + this.offsetY;

    const topColor = options.topColor || this.lightenColor(color, 20);
    const rightColor = options.rightColor || this.darkenColor(color, 30);

    this.ctx.save();

    // Shadow
    if (options.shadow) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(
        screenX,
        screenY + height,
        width * 0.8,
        depth * 0.4,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    // Top face
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + width, screenY + width / 2);
    this.ctx.lineTo(screenX, screenY + width / 2 + depth / 2);
    this.ctx.lineTo(screenX - width, screenY + width / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = topColor;
    this.ctx.fill();
    if (options.outline) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Right face
    this.ctx.beginPath();
    this.ctx.moveTo(screenX + width, screenY + width / 2);
    this.ctx.lineTo(screenX + width, screenY + width / 2 + height);
    this.ctx.lineTo(screenX, screenY + width / 2 + depth / 2 + height);
    this.ctx.lineTo(screenX, screenY + width / 2 + depth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = rightColor;
    this.ctx.fill();
    if (options.outline) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Left face
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX, screenY + height);
    this.ctx.lineTo(screenX, screenY + width / 2 + depth / 2 + height);
    this.ctx.lineTo(screenX - width, screenY + width / 2 + height);
    this.ctx.lineTo(screenX - width, screenY + width / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    if (options.outline) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw a Roblox-style blocky character (ENHANCED V2)
   */
  drawCharacter(
    x: number,
    y: number,
    z: number,
    color: string,
    options: {
      scale?: number;
      animation?: 'idle' | 'working';
      headBob?: number;
    } = {}
  ) {
    const scale = options.scale || 1;
    const headBob = options.headBob || 0;

    // Body proportions (MORE ROBLOX-LIKE: larger head, blockier body)
    const headSize = 10 * scale;        // Increased from 8
    const bodyWidth = 12 * scale;       // Increased from 10
    const bodyHeight = 14 * scale;      // Increased from 12
    const bodyDepth = 8 * scale;        // Increased from 6
    const legWidth = 5 * scale;         // Increased from 4
    const legHeight = 12 * scale;       // Increased from 10
    const armWidth = 4 * scale;         // NEW: arms
    const armLength = 10 * scale;       // NEW: arms

    // Head (lighter color)
    const headColor = this.lightenColor(color, 30);
    this.drawBox(
      x,
      y,
      z + bodyHeight + legHeight - headBob,
      headSize,
      headSize,
      headSize,
      headColor,
      { outline: true, topColor: this.lightenColor(headColor, 15) }
    );

    // Draw enhanced Roblox-style face
    const headPos = gridToScreen(x, y, z + bodyHeight + legHeight - headBob);
    const faceX = headPos.x + this.offsetX;
    const faceY = headPos.y + this.offsetY + headSize / 3;
    
    // Eyes (larger, more defined with white background)
    this.ctx.save();
    
    // Left eye white
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(faceX - 4 * scale, faceY, 3 * scale, 3 * scale);
    // Left pupil
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(faceX - 3.5 * scale, faceY + 0.5 * scale, 2 * scale, 2 * scale);
    
    // Right eye white
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(faceX + 1 * scale, faceY, 3 * scale, 3 * scale);
    // Right pupil
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(faceX + 1.5 * scale, faceY + 0.5 * scale, 2 * scale, 2 * scale);
    
    // Smile (thicker, more defined)
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.lineWidth = 1.5 * scale;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(faceX, faceY + 5 * scale, 3 * scale, 0.2, Math.PI - 0.2);
    this.ctx.stroke();
    
    this.ctx.restore();

    // Torso
    this.drawBox(
      x,
      y,
      z + legHeight,
      bodyWidth,
      bodyHeight,
      bodyDepth,
      color,
      { outline: true }
    );

    // Arms (NEW - positioned at shoulders with eased animation)
    const armColor = this.darkenColor(color, 5);
    const rawSwing = Math.sin(Date.now() / 400);
    const armSwing = options.animation === 'working' ? easeInOutSine((rawSwing + 1) / 2) * 6 - 3 : 0;
    
    // Left arm
    this.drawBox(
      x - (bodyWidth / 2 + armWidth / 2),
      y,
      z + legHeight + bodyHeight - armLength - armSwing,
      armWidth,
      armLength,
      armWidth,
      armColor,
      { outline: true, rightColor: this.darkenColor(armColor, 20) }
    );
    
    // Right arm
    this.drawBox(
      x + (bodyWidth / 2 + armWidth / 2),
      y,
      z + legHeight + bodyHeight - armLength + armSwing,
      armWidth,
      armLength,
      armWidth,
      armColor,
      { outline: true, rightColor: this.darkenColor(armColor, 20) }
    );

    // Legs (with eased walking animation offset if working)
    const walkCycle = (Date.now() / 500) % (Math.PI * 2);
    const leftLegRaw = Math.sin(walkCycle);
    const rightLegRaw = -Math.sin(walkCycle);
    const leftLegOffset = options.animation === 'working' ? easeInOutSine((leftLegRaw + 1) / 2) * 4 - 2 : 0;
    const rightLegOffset = options.animation === 'working' ? easeInOutSine((rightLegRaw + 1) / 2) * 4 - 2 : 0;

    // Left leg
    this.drawBox(
      x - legWidth / 2 + leftLegOffset,
      y,
      z,
      legWidth,
      legHeight,
      legWidth,
      color,
      { outline: true, rightColor: this.darkenColor(color, 20) }
    );

    // Right leg
    this.drawBox(
      x + legWidth / 2 + rightLegOffset,
      y,
      z,
      legWidth,
      legHeight,
      legWidth,
      color,
      { outline: true, rightColor: this.darkenColor(color, 20) }
    );
  }

  /**
   * Draw an isometric desk with monitor (ENHANCED V2)
   */
  drawDesk(
    x: number,
    y: number,
    z: number,
    options: {
      monitorOn?: boolean;
      monitorGlow?: string;
      icon?: string;
    } = {}
  ) {
    const deskWidth = 30;
    const deskHeight = 8;
    const deskDepth = 20;

    // Desk surface with wood grain effect
    this.drawBox(
      x,
      y,
      z,
      deskWidth,
      deskHeight,
      deskDepth,
      '#78350f',
      {
        topColor: '#92400e',
        rightColor: '#451a03',
        outline: true,
        shadow: true
      }
    );
    
    // Add wood grain texture on top
    const deskPos = gridToScreen(x, y, z + deskHeight);
    const deskScreenX = deskPos.x + this.offsetX;
    const deskScreenY = deskPos.y + this.offsetY;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.15;
    this.ctx.strokeStyle = '#451a03';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(deskScreenX - 15 + i * 3, deskScreenY);
      this.ctx.lineTo(deskScreenX + 15 + i * 3, deskScreenY + 10);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Monitor (ENHANCED)
    const monitorWidth = 14;       // Slightly larger
    const monitorHeight = 11;      // Slightly taller
    const monitorDepth = 2.5;

    // Monitor stand (thicker, more realistic)
    this.drawBox(
      x,
      y - 5,
      z + deskHeight,
      5,
      2.5,
      5,
      '#1f2937',
      { outline: true, topColor: '#374151' }
    );

    // Monitor screen bezel
    this.drawBox(
      x,
      y - 5,
      z + deskHeight + 2.5,
      monitorWidth,
      monitorHeight,
      monitorDepth,
      '#1f2937',
      { outline: true, topColor: '#111827' }
    );

    // Screen content (ENHANCED)
    if (options.monitorOn) {
      const screenPos = gridToScreen(x, y - 5, z + deskHeight + 2.5);
      const screenX = screenPos.x + this.offsetX;
      const screenY = screenPos.y + this.offsetY;

      // Enhanced screen glow (larger, more vibrant)
      if (options.monitorGlow) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        const glowGradient = this.ctx.createRadialGradient(
          screenX, screenY + 5, 0,
          screenX, screenY + 5, 25
        );
        glowGradient.addColorStop(0, options.monitorGlow);
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(screenX - 25, screenY - 20, 50, 50);
        this.ctx.restore();
      }

      // Screen content (richer gradient)
      const gradient = this.ctx.createLinearGradient(
        screenX - 7,
        screenY,
        screenX + 7,
        screenY + 11
      );
      gradient.addColorStop(0, this.lightenColor(options.monitorGlow || '#3b82f6', 20));
      gradient.addColorStop(0.5, options.monitorGlow || '#3b82f6');
      gradient.addColorStop(1, this.darkenColor(options.monitorGlow || '#3b82f6', 30));

      // Top face of monitor with content (larger)
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, screenY + 2);
      this.ctx.lineTo(screenX + 7, screenY + 5.5);
      this.ctx.lineTo(screenX, screenY + 9);
      this.ctx.lineTo(screenX - 7, screenY + 5.5);
      this.ctx.closePath();
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.restore();

      // Animated code lines (more detailed)
      if (options.monitorOn) {
        this.ctx.save();
        const time = Date.now();
        const lines = [
          { offset: (time / 100) % 7, width: 10, color: 'rgba(16, 185, 129, 0.7)' },
          { offset: (time / 120 + 2) % 7, width: 7, color: 'rgba(59, 130, 246, 0.6)' },
          { offset: (time / 90 + 4) % 7, width: 12, color: 'rgba(34, 197, 94, 0.5)' }
        ];
        
        lines.forEach(line => {
          this.ctx.fillStyle = line.color;
          this.ctx.fillRect(screenX - line.width / 2, screenY + 3 + line.offset, line.width, 0.8);
        });
        this.ctx.restore();
      }
    }

    // Keyboard (ENHANCED with keys visible)
    this.drawBox(
      x,
      y + 6,
      z + deskHeight,
      10,
      1.2,
      5,
      '#374151',
      { outline: true, topColor: '#4b5563' }
    );
    
    // Keyboard keys (tiny details)
    const keyboardPos = gridToScreen(x, y + 6, z + deskHeight + 1.2);
    const keyX = keyboardPos.x + this.offsetX;
    const keyY = keyboardPos.y + this.offsetY;
    
    this.ctx.save();
    this.ctx.fillStyle = '#1f2937';
    // Draw a few representative keys
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        this.ctx.fillRect(
          keyX - 4 + i * 2,
          keyY + j * 1,
          1.2,
          0.8
        );
      }
    }
    this.ctx.restore();

    // Mouse (NEW - right side of keyboard)
    this.drawBox(
      x + 8,
      y + 8,
      z + deskHeight,
      3,
      1.5,
      2,
      '#4b5563',
      { outline: true, topColor: '#6b7280' }
    );

    // Coffee cup (NEW - left corner)
    const cupX = x - 10;
    const cupY = y + 8;
    
    // Cup body
    this.drawBox(
      cupX,
      cupY,
      z + deskHeight,
      3,
      4,
      3,
      '#dc2626',
      { outline: true, topColor: '#ef4444' }
    );
    
    // Coffee inside (dark circle on top)
    const cupPos = gridToScreen(cupX, cupY, z + deskHeight + 4);
    this.ctx.fillStyle = '#431407';
    this.ctx.beginPath();
    this.ctx.ellipse(
      cupPos.x + this.offsetX,
      cupPos.y + this.offsetY,
      1.5,
      0.8,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    
    // Steam effect (optional, subtle)
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#ffffff';
    const steamOffset = Math.sin(Date.now() / 500) * 2;
    this.ctx.fillText(
      '~',
      cupPos.x + this.offsetX - 1,
      cupPos.y + this.offsetY - 5 + steamOffset
    );
    this.ctx.restore();

    // Papers/documents (NEW - scattered on right side)
    const paper1X = x + 5;
    const paper1Y = y - 6;
    
    // Paper 1
    this.drawBox(
      paper1X,
      paper1Y,
      z + deskHeight,
      6,
      0.2,
      4,
      '#f3f4f6',
      { outline: true, topColor: '#ffffff' }
    );
    
    // Paper 2 (slightly offset)
    this.drawBox(
      paper1X + 1,
      paper1Y + 1,
      z + deskHeight + 0.2,
      6,
      0.2,
      4,
      '#e5e7eb',
      { outline: true, topColor: '#f9fafb' }
    );
    
    // Add tiny text lines on paper
    const paperPos = gridToScreen(paper1X, paper1Y, z + deskHeight + 0.4);
    this.ctx.save();
    this.ctx.strokeStyle = '#6b7280';
    this.ctx.lineWidth = 0.3;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(paperPos.x + this.offsetX - 2, paperPos.y + this.offsetY + i);
      this.ctx.lineTo(paperPos.x + this.offsetX + 2, paperPos.y + this.offsetY + i);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Desk icon/item (moved to back corner)
    if (options.icon) {
      const iconPos = gridToScreen(x - 8, y - 8, z + deskHeight);
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText(
        options.icon,
        iconPos.x + this.offsetX - 7,
        iconPos.y + this.offsetY + 7
      );
    }
  }

  /**
   * Draw text label
   */
  drawLabel(x: number, y: number, z: number, text: string, options: {
    fontSize?: number;
    color?: string;
    bold?: boolean;
  } = {}) {
    const pos = gridToScreen(x, y, z);
    const screenX = pos.x + this.offsetX;
    const screenY = pos.y + this.offsetY;

    this.ctx.save();
    this.ctx.font = `${options.bold ? 'bold ' : ''}${options.fontSize || 12}px sans-serif`;
    this.ctx.fillStyle = options.color || '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // Shadow for readability
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(text, screenX, screenY);
    
    this.ctx.restore();
  }

  /**
   * Color utilities
   */
  lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}

// ========================================
// MAIN OFFICE COMPONENT
// ========================================

export default function OfficeV2Page() {
  const agents = useQuery(api.agents.getAll, {});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  // Agent data
  const agentData = {
    main: { x: 2, y: 2, color: '#10b981', icon: '💻', name: 'APEX', role: 'CEO' },
    insight: { x: 6, y: 2, color: '#3b82f6', icon: '📊', name: 'INSIGHT', role: 'Analyst' },
    vibe: { x: 4, y: 5, color: '#f59e0b', icon: '🎨', name: 'VIBE', role: 'Designer' }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Center offset  
      const offsetX = rect.width / 2;
      const offsetY = rect.height / 2 - 100; // Center vertically with room for labels

      const renderer = new IsometricRenderer(ctx, offsetX, offsetY);

      // Draw floor grid
      for (let x = -4; x <= 8; x++) {
        for (let y = -4; y <= 8; y++) {
          const isDark = (x + y) % 2 === 0;
          renderer.drawFloorTile(x, y, isDark);
        }
      }

      // Draw meeting table (center)
      renderer.drawBox(3.5, 3.5, 0, 24, 6, 16, '#4b5563', {
        topColor: '#6b7280',
        rightColor: '#374151',
        outline: true,
        shadow: true
      });
      renderer.drawLabel(4, 4, 8, '📋 Meeting', { fontSize: 10, color: '#9ca3af' });

      // Draw agents
      Object.entries(agentData).forEach(([agentId, data]) => {
        const agent = agents?.find(a => a.agentId === agentId);
        const isWorking = agent?.status === 'working';
        const isIdle = agent?.status === 'idle';
        const isHovered = hoveredAgent === agentId;

        // Hover highlight (NEW)
        if (isHovered) {
          const hoverPos = gridToScreen(data.x, data.y, 0);
          ctx.save();
          ctx.globalAlpha = 0.2;
          const highlightGradient = ctx.createRadialGradient(
            hoverPos.x + offsetX,
            hoverPos.y + offsetY,
            0,
            hoverPos.x + offsetX,
            hoverPos.y + offsetY,
            40
          );
          highlightGradient.addColorStop(0, data.color);
          highlightGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = highlightGradient;
          ctx.fillRect(
            hoverPos.x + offsetX - 40,
            hoverPos.y + offsetY - 40,
            80,
            80
          );
          ctx.restore();
        }

        // Desk
        renderer.drawDesk(data.x, data.y, 0, {
          monitorOn: isWorking,
          monitorGlow: isWorking ? data.color : undefined,
          icon: data.icon
        });

        // Character (slightly larger when hovered)
        const headBob = isWorking ? Math.sin(Date.now() / 500) * 2 : 0;
        renderer.drawCharacter(data.x, data.y - 1, 25, data.color, {
          scale: isHovered ? 1.05 : 1,
          animation: isWorking ? 'working' : 'idle',
          headBob
        });

        // Name label
        renderer.drawLabel(data.x, data.y, 60, data.name, {
          fontSize: 14,
          bold: true,
          color: '#ffffff'
        });
        renderer.drawLabel(data.x, data.y, 75, data.role, {
          fontSize: 10,
          color: '#9ca3af'
        });

        // Status indicator
        const statusColor = isWorking ? '#10b981' : isIdle ? '#f59e0b' : '#6b7280';
        const statusPos = gridToScreen(data.x, data.y, 80);
        ctx.save();
        ctx.fillStyle = statusColor;
        ctx.shadowColor = statusColor;
        ctx.shadowBlur = isWorking ? 10 : 5;
        ctx.beginPath();
        ctx.arc(statusPos.x + offsetX, statusPos.y + offsetY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Current task
        if (agent?.currentTask) {
          renderer.drawLabel(data.x, data.y, 90, `💭 ${agent.currentTask}`, {
            fontSize: 9,
            color: '#d1d5db'
          });
        }
      });

      // Decorations
      const decorPos1 = gridToScreen(0, 0, 0);
      ctx.font = '24px sans-serif';
      ctx.fillText('🪴', decorPos1.x + offsetX, decorPos1.y + offsetY);

      const decorPos2 = gridToScreen(8, 8, 0);
      ctx.fillText('🚪', decorPos2.x + offsetX, decorPos2.y + offsetY);

      const decorPos3 = gridToScreen(-2, -2, 0);
      ctx.fillText('☕', decorPos3.x + offsetX, decorPos3.y + offsetY);

      requestAnimationFrame(render);
    };

    render();
  }, [agents]);

  // Click detection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const offsetX = rect.width / 2;
    const offsetY = 150;

    const gridPos = screenToGrid(x - offsetX, y - offsetY);

    // Check if click is near any agent
    Object.entries(agentData).forEach(([agentId, data]) => {
      const dist = Math.sqrt(
        Math.pow(gridPos.x - data.x, 2) + Math.pow(gridPos.y - data.y, 2)
      );
      if (dist < 1.5) {
        setSelectedAgent(selectedAgent === agentId ? null : agentId);
      }
    });
  };

  // Hover detection (NEW)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const offsetX = rect.width / 2;
    const offsetY = 150;

    const gridPos = screenToGrid(x - offsetX, y - offsetY);

    // Check if hovering over any agent
    let foundHover = false;
    Object.entries(agentData).forEach(([agentId, data]) => {
      const dist = Math.sqrt(
        Math.pow(gridPos.x - data.x, 2) + Math.pow(gridPos.y - data.y, 2)
      );
      if (dist < 1.5) {
        setHoveredAgent(agentId);
        foundHover = true;
      }
    });
    
    if (!foundHover) {
      setHoveredAgent(null);
    }
  };

  const selectedAgentData = selectedAgent ? agents?.find(a => a.agentId === selectedAgent) : null;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">🏢 The Office V2</h1>
        <div className="text-sm text-gray-400">
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Canvas Office */}
      <div className="relative rounded-lg border border-gray-800 overflow-hidden shadow-2xl bg-gray-950/50">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="w-full cursor-pointer"
          style={{ height: '700px' }}
        />
      </div>

      {/* Agent Detail Panel */}
      {selectedAgent && selectedAgentData && (
        <div className="fixed top-1/2 right-8 transform -translate-y-1/2
                      w-72 bg-gray-900/95 backdrop-blur-xl rounded-lg
                      border border-gray-700 shadow-2xl p-6 z-50
                      animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedAgentData.avatar}</span>
              <div>
                <div className="font-bold text-lg text-white">{selectedAgentData.name}</div>
                <div className="text-sm text-gray-400">{selectedAgentData.role}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-gray-400 hover:text-white transition-colors text-xl">
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-t border-gray-800">
              <span className="text-gray-400">Status</span>
              <span className={`font-medium ${
                selectedAgentData.status === 'working' ? 'text-green-400' :
                selectedAgentData.status === 'idle' ? 'text-amber-400' :
                'text-gray-400'
              }`}>
                {selectedAgentData.status}
              </span>
            </div>

            {selectedAgentData.currentTask && (
              <div className="py-2 border-t border-gray-800">
                <div className="text-gray-400 mb-1">Current Task</div>
                <div className="text-white">{selectedAgentData.currentTask}</div>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-t border-gray-800">
              <span className="text-gray-400">Last Active</span>
              <span className="text-white text-xs">
                {selectedAgentData.lastActivity
                  ? new Date(selectedAgentData.lastActivity).toLocaleTimeString()
                  : 'Never'}
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

      {/* Stats Panel */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {agents?.filter(a => a.status === 'working').length ?? 0}
          </div>
          <div className="text-xs text-gray-500">Working</div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {agents?.filter(a => a.status === 'idle').length ?? 0}
          </div>
          <div className="text-xs text-gray-500">Idle</div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-800/50 p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {agents?.filter(a => a.status === 'offline').length ?? 0}
          </div>
          <div className="text-xs text-gray-500">Offline</div>
        </div>
      </div>
    </div>
  );
}
