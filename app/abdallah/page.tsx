"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function AbdallahPage() {
  const memories = useQuery(api.memories.getRecent, { limit: 200 });
  const documents = useQuery(api.contentPipeline.getByStage, {});

  // Filter content related to Abdallah
  const abdallahMemories = memories?.filter(m =>
    m.content?.toLowerCase().includes("abdallah") ||
    m.tags?.some((t: string) => t.toLowerCase().includes("abdallah"))
  ) || [];

  const abdallahDocs = documents?.filter(d =>
    d.title?.toLowerCase().includes("abdallah") ||
    d.content?.toLowerCase().includes("abdallah")
  ) || [];

  const [activeTab, setActiveTab] = useState<"overview" | "memory" | "documents">("overview");

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start gap-6 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-2 border-amber-500/50 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/10">
          👤
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Abdallah</h1>
          <p className="text-gray-400 mt-1">Team Member</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300 border border-amber-700/40">
              Human
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-gray-900/50 rounded-xl w-fit border border-gray-800/50">
        {(["overview", "memory", "documents"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
            {tab === "memory" && abdallahMemories.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                {abdallahMemories.length}
              </span>
            )}
            {tab === "documents" && abdallahDocs.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                {abdallahDocs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="rounded-xl p-6 bg-gray-900/60 border border-gray-800/50 backdrop-blur">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-gray-500 text-sm">Name</span>
                <span className="text-white font-medium">Abdallah</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                <span className="text-gray-500 text-sm">Type</span>
                <span className="text-amber-300 font-medium">Human</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">Mentions</span>
                <span className="text-white font-medium">{abdallahMemories.length + abdallahDocs.length}</span>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="rounded-xl p-6 bg-gray-900/60 border border-gray-800/50 backdrop-blur">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-amber-900/10 border border-amber-700/20">
                <div className="text-2xl font-bold text-amber-400">{abdallahMemories.length}</div>
                <div className="text-xs text-gray-500 mt-1">Memory Entries</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-900/10 border border-amber-700/20">
                <div className="text-2xl font-bold text-amber-400">{abdallahDocs.length}</div>
                <div className="text-xs text-gray-500 mt-1">Documents</div>
              </div>
            </div>
          </div>

          {/* Recent Memory */}
          <div className="md:col-span-2 rounded-xl p-6 bg-gray-900/60 border border-gray-800/50 backdrop-blur">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Mentions</h2>
            {abdallahMemories.length === 0 && abdallahDocs.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm">No entries yet. Mentions of Abdallah in memory or documents will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {abdallahMemories.slice(0, 5).map((m: any) => (
                  <div key={m._id} className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/40">
                    <p className="text-sm text-gray-300 line-clamp-2">{m.content}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(m._creationTime).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === "memory" && (
        <div className="space-y-4">
          {abdallahMemories.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">🧠</div>
              <p>No memory entries mentioning Abdallah yet.</p>
            </div>
          ) : (
            abdallahMemories.map((m: any) => (
              <div key={m._id} className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/50 backdrop-blur">
                <p className="text-gray-200 leading-relaxed">{m.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  {m.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700/50">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-600 ml-auto">{new Date(m._creationTime).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {abdallahDocs.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">📄</div>
              <p>No documents mentioning Abdallah yet.</p>
            </div>
          ) : (
            abdallahDocs.map((d: any) => (
              <div key={d._id} className="p-5 rounded-xl bg-gray-900/60 border border-gray-800/50 backdrop-blur">
                <h3 className="font-semibold text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3">{d.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700/50">
                    {d.contentType}
                  </span>
                  <span className="text-xs text-gray-600 ml-auto">{new Date(d._creationTime).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
