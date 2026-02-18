import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mission Control - APEX AI Company",
  description: "Command center for APEX, INSIGHT, and VIBE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>
          <div className="flex h-screen">
            {/* Sidebar */}
            <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">🏴 Mission Control</h1>
                <p className="text-sm text-gray-400">APEX AI Company</p>
              </div>
              
              <div className="space-y-2">
                <NavLink href="/" icon="📊">Dashboard</NavLink>
                <NavLink href="/memory" icon="🧠">Memory</NavLink>
                <NavLink href="/calendar" icon="📅">Calendar</NavLink>
                <NavLink href="/tasks" icon="✅">Tasks</NavLink>
                <NavLink href="/content" icon="📝">Content Pipeline</NavLink>
                <NavLink href="/office" icon="🏢">Office</NavLink>
                <NavLink href="/team" icon="👥">Team</NavLink>
              </div>
            </nav>
            
            {/* Main content */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
