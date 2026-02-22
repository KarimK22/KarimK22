"use client";

/**
 * AnimatedBackground - Video background for Mission Control
 * 
 * Features:
 * - Looping video background
 * - Subtle overlay for text readability
 * - Fully responsive
 * - Optimized for performance
 */

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: 0.4 // Subtle so text remains readable
        }}
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text contrast */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"
      />
    </div>
  );
}
