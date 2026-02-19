"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [strategyContent, setStrategyContent] = useState("");

  useEffect(() => {
    fetch('/lingo-x-strategy.md')
      .then(res => res.text())
      .then(content => setStrategyContent(content))
      .catch(err => console.error('Failed to load strategy:', err));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📄 Documents</h1>
            <p className="text-gray-300">Strategic documents and deliverables</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* Document Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🎯 Lingo X Content Strategy
              </h2>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>📅 February 19, 2026</span>
                <span>👤 VIBE + INSIGHT</span>
                <span>📊 Data-Validated</span>
                <span>📏 32KB</span>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <span>🖨️</span>
              Print / Save PDF
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
              ✅ Complete
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
              📊 Data-Driven
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
              🎯 CEO-Ready
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-gray-400 text-sm mb-1">Current Reach</div>
              <div className="text-2xl font-bold text-red-400">1.1%</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-gray-400 text-sm mb-1">Target Reach</div>
              <div className="text-2xl font-bold text-green-400">5-8%</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-gray-400 text-sm mb-1">Followers</div>
              <div className="text-2xl font-bold text-blue-400">556.9K</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-gray-400 text-sm mb-1">Timeline</div>
              <div className="text-2xl font-bold text-purple-400">30 Days</div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-slate-900/80 rounded-lg p-6 border border-slate-700 max-h-[600px] overflow-y-auto">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {strategyContent || "Loading document..."}
            </pre>
          </div>

          {/* Download Options */}
          <div className="mt-6 flex gap-3">
            <a
              href="/lingo-x-strategy.md"
              download="lingo-x-content-strategy.md"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              📥 Download Markdown
            </a>
            <button
              onClick={() => {
                const blob = new Blob([strategyContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lingo-x-strategy.txt';
                a.click();
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              📝 Download TXT
            </button>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">🔑 Key Findings</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="font-semibold text-white">Peak Time Corrected</div>
                <div className="text-sm">Real data shows 09:00-11:00 UTC, not 15:00-19:00 UTC</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐦</span>
              <div>
                <div className="font-semibold text-white">Twitter Underperforming</div>
                <div className="text-sm">Only 9% of traffic despite 556.9K followers (algorithm suppression)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <div className="font-semibold text-white">Staking Education Gap</div>
                <div className="text-sm">Only 4.4% conversion (should be 15-20%) - users don't understand it</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-semibold text-white">Gaming is the Hook</div>
                <div className="text-sm">Power users start as gamers, then stake/raffle - lead with gaming content</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          pre {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
