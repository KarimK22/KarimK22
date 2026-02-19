"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize Convex client with explicit URL
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://outstanding-snail-503.eu-west-1.convex.cloud";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.warn("NEXT_PUBLIC_CONVEX_URL not found, using fallback URL");
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
