"use client";

import { useEffect, useRef } from 'react';

/**
 * AnimatedBackground - Premium space-themed background for Mission Control
 * 
 * Features:
 * - Rotating 3D-style globe with purple/blue gradient
 * - Dotted data network overlay
 * - Atmospheric glow ring
 * - Twinkling starfield with depth
 * - 60fps smooth animations
 * - Fully responsive
 */

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let globeRotation = 0;

    // Setup canvas size
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      // Regenerate stars on resize
      generateStars();
    };

    // Generate starfield
    const generateStars = () => {
      const rect = canvas.getBoundingClientRect();
      const numStars = Math.floor((rect.width * rect.height) / 8000); // Density based on screen size
      
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.002 + 0.001,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
    };

    // Draw twinkling stars
    const drawStars = (time: number) => {
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = star.opacity * twinkle;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw rotating globe with gradient and dotted overlay
    const drawGlobe = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width * 0.65; // Position centered-right (moved from 0.75)
      const centerY = rect.height * 0.5;
      const radius = Math.min(rect.width, rect.height) * 0.32; // Larger, more prominent (increased from 0.25)

      // Slow rotation
      globeRotation = time * 0.00005; // Very subtle rotation

      // Atmospheric glow (outer ring)
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.9,
        centerX, centerY, radius * 1.5
      );
      glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)'); // Purple
      glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)'); // Blue
      glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Main globe gradient (purple to blue)
      const globeGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      globeGradient.addColorStop(0, 'rgba(167, 139, 250, 0.8)'); // Light purple
      globeGradient.addColorStop(0.4, 'rgba(139, 92, 246, 0.7)'); // Purple
      globeGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.6)'); // Blue
      globeGradient.addColorStop(1, 'rgba(37, 99, 235, 0.5)'); // Dark blue
      
      ctx.fillStyle = globeGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Dotted network overlay (rotating with globe)
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const dots = 24; // Number of latitude lines
      const dotsPerLine = 36; // Dots per line
      
      for (let lat = 0; lat < dots; lat++) {
        const latAngle = (lat / dots) * Math.PI;
        const latRadius = Math.sin(latAngle) * radius;
        const latY = Math.cos(latAngle) * radius - radius;
        
        for (let lon = 0; lon < dotsPerLine; lon++) {
          const lonAngle = (lon / dotsPerLine) * Math.PI * 2 + globeRotation;
          const x = Math.cos(lonAngle) * latRadius;
          const z = Math.sin(lonAngle) * latRadius;
          
          // Simple depth check (only draw front-facing dots)
          if (z > -latRadius * 0.3) {
            const dotOpacity = (z / latRadius + 1) * 0.3; // Fade based on depth
            const dotSize = 1 + (z / latRadius + 1) * 0.5; // Size based on depth
            
            ctx.fillStyle = `rgba(255, 255, 255, ${dotOpacity})`;
            ctx.beginPath();
            ctx.arc(x, latY, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      ctx.restore();

      // Atmospheric rim highlight (top-left light source effect)
      const rimGradient = ctx.createRadialGradient(
        centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.7,
        centerX, centerY, radius
      );
      rimGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      rimGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = rimGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Main animation loop
    const animate = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Deep space background (gradient from top to bottom)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      bgGradient.addColorStop(0, '#000000');
      bgGradient.addColorStop(0.5, '#0a0a1a');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw layers (back to front)
      drawStars(time);
      drawGlobe(time);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    setupCanvas();
    animationFrameId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ 
        background: '#000000',
        opacity: 0.9 // Bold and vibrant (increased from 0.6 to match reference)
      }}
    />
  );
}
