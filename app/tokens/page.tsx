"use client";

import { useState, useEffect } from "react";

interface FileEntry {
  name: string;
  path: string;
  tokens: number;
  bytes: number;
  lines: number;
  exists?: boolean;
}

interface AgentContext {
  files: FileEntry[];
  totalTokens: number;
}

interface SessionEntry {
  file: string;
  bytes: number;
  kb: number;
  mb: number;
  modified: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  agent: string;
  status: string;
  target: string;
}

interface AuditData {
  generatedAt: string;
  agentsContext: Record<string, AgentContext>;
  fileBrowser: Record<string, FileEntry[]>;
  sessions: Record<string, SessionEntry[]>;
  crons: CronJob[];
}

function TokenBar({ tokens, max }: { tokens: number; max: number }) {
  const pct = Math.min((tokens / max) * 100, 100);
  const color = pct > 75 ? "bg-red-500" : pct > 40 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function formatBytes(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function SessionHealth({ mb }: { mb: number }) {
  if (mb > 10) return <span className="text-red-400 font-bold">🔴 Critical</span>;
  if (mb > 2) return <span className="text-yellow-400 font-bold">🟡 Large</span>;
  if (mb > 0.1) return <span className="text-blue-400">🔵 Active</span>;
  return <span className="text-emerald-400">🟢 Fresh</span>;
}

export default function TokensPage() {
  const [data, setData] = useState<AuditData | null>(null);
  const [activeTab, setActiveTab] = useState<"boot" | "browser" | "sessions" | "crons">("boot");
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/token-audit.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-4">⚡</div>
        <div>Loading token audit...</div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-full text-red-400">
      Failed to load token-audit.json
    </div>
  );

  const maxBootTokens = Math.max(...Object.values(data.agentsContext).map(a => a.totalTokens));
  const totalSessionBytes = Object.values(data.sessions).flat().reduce((s, x) => s + x.bytes, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">⚡ Token Usage Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Last audit: {new Date(data.generatedAt).toLocaleString()} ·{" "}
          Total session storage: {formatBytes(totalSessionBytes)}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(data.agentsContext).map(([agent, ctx]) => (
          <div key={agent} className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{agent}</div>
            <div className="text-2xl font-bold text-white">{ctx.totalTokens.toLocaleString()}</div>
            <div className="text-xs text-gray-500">tokens / boot</div>
            <TokenBar tokens={ctx.totalTokens} max={maxBootTokens} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        {[
          { key: "boot", label: "🚀 Boot Context", desc: "Files loaded on session start" },
          { key: "browser", label: "📁 File Browser", desc: "All .md files by workspace" },
          { key: "sessions", label: "💾 Sessions", desc: "Active session sizes" },
          { key: "crons", label: "⏱ Cron Jobs", desc: "Scheduled tasks" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? "bg-gray-900 text-white border border-b-0 border-gray-700"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Boot Context Tab */}
      {activeTab === "boot" && (
        <div className="space-y-6">
          {Object.entries(data.agentsContext).map(([agent, ctx]) => (
            <div key={agent} className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">{agent}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{ctx.totalTokens.toLocaleString()} tokens total</span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                    ~${((ctx.totalTokens / 1000000) * 3).toFixed(4)}/session
                  </span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left px-4 py-2">File</th>
                    <th className="text-right px-4 py-2">Tokens</th>
                    <th className="text-right px-4 py-2">Size</th>
                    <th className="text-right px-4 py-2">Lines</th>
                    <th className="px-4 py-2 w-48">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.files.map((f, i) => (
                    <tr key={i} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${!f.exists ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-2.5 text-gray-200 font-mono text-xs">
                        {f.name}
                        {!f.exists && <span className="ml-2 text-red-400 text-xs">(missing)</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-white">{f.tokens.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400">{formatBytes(f.bytes)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400">{f.lines}</td>
                      <td className="px-4 py-2.5">
                        <TokenBar tokens={f.tokens} max={Math.max(...ctx.files.map(x => x.tokens))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800/40">
                    <td className="px-4 py-2 text-gray-300 font-semibold">Total</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-400">{ctx.totalTokens.toLocaleString()}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* File Browser Tab */}
      {activeTab === "browser" && (
        <div className="space-y-3">
          {Object.entries(data.fileBrowser).map(([folder, files]) => {
            const totalTokens = files.reduce((s, f) => s + f.tokens, 0);
            const isOpen = expandedFolder === folder;
            return (
              <div key={folder} className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFolder(isOpen ? null : folder)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{isOpen ? "📂" : "📁"}</span>
                    <span className="font-semibold text-white">{folder}</span>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                      {files.length} files
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{totalTokens.toLocaleString()} tokens</span>
                    <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>
                {isOpen && files.length > 0 && (
                  <table className="w-full text-sm border-t border-gray-800">
                    <thead>
                      <tr className="text-gray-500 text-xs border-b border-gray-800">
                        <th className="text-left px-4 py-2">File</th>
                        <th className="text-right px-4 py-2">Tokens</th>
                        <th className="text-right px-4 py-2">Size</th>
                        <th className="text-right px-4 py-2">Lines</th>
                        <th className="px-4 py-2 w-40">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((f, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-2 text-gray-300 font-mono text-xs">{f.path}</td>
                          <td className="px-4 py-2 text-right font-bold text-white">{f.tokens.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-gray-400">{formatBytes(f.bytes)}</td>
                          <td className="px-4 py-2 text-right text-gray-400">{f.lines}</td>
                          <td className="px-4 py-2">
                            <TokenBar tokens={f.tokens} max={files[0]?.tokens || 1} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {isOpen && files.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-sm border-t border-gray-800">No .md files found</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {Object.entries(data.sessions).map(([agent, sessions]) => (
            <div key={agent} className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white capitalize">{agent}</h2>
              </div>
              {sessions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">No sessions found</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-gray-800">
                      <th className="text-left px-4 py-2">Session</th>
                      <th className="text-right px-4 py-2">Size</th>
                      <th className="text-right px-4 py-2">Last Modified</th>
                      <th className="text-right px-4 py-2">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-2.5 text-gray-300 font-mono text-xs">
                          {s.file.replace('.jsonl', '').substring(0, 36)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-white">{formatBytes(s.bytes)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-400">{s.modified}</td>
                        <td className="px-4 py-2.5 text-right"><SessionHealth mb={s.mb} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-sm text-gray-400">
            <strong className="text-gray-300">📌 Sessions archived today:</strong> MISSION (17.6MB), INSIGHT (3.7MB), VIBE (3MB) → <code className="text-xs bg-gray-800 px-1 rounded">/session-archives/</code>
          </div>
        </div>
      )}

      {/* Crons Tab */}
      {activeTab === "crons" && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left px-4 py-3">Job Name</th>
                <th className="text-left px-4 py-3">Schedule</th>
                <th className="text-left px-4 py-3">Agent</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.crons.map((cron, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">{cron.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cron.schedule}</td>
                  <td className="px-4 py-3 text-gray-300">{cron.agent}</td>
                  <td className="px-4 py-3 text-gray-400">{cron.target}</td>
                  <td className="px-4 py-3">
                    {cron.status === "ok" ? (
                      <span className="text-emerald-400 font-semibold">✅ OK</span>
                    ) : cron.status === "skipped" ? (
                      <span className="text-yellow-400 font-semibold">⏭ Skipped</span>
                    ) : (
                      <span className="text-red-400 font-semibold">❌ {cron.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
