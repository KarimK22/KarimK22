"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const searchResults = searchQuery 
    ? useQuery(api.memories.search, { 
        query: searchQuery,
        agent: selectedAgent || undefined,
        type: selectedType || undefined,
      })
    : null;

  const recentMemories = useQuery(api.memories.getRecent, {
    agent: selectedAgent || undefined,
    type: selectedType || undefined,
    limit: 100,
  });

  const memories = searchQuery ? searchResults : recentMemories;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">🧠 Memory</h1>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500"
        />
        
        <div className="flex gap-4">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Agents</option>
            <option value="APEX">APEX</option>
            <option value="INSIGHT">INSIGHT</option>
            <option value="VIBE">VIBE</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="conversation">Conversation</option>
            <option value="decision">Decision</option>
            <option value="learning">Learning</option>
            <option value="note">Note</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {memories && memories.length > 0 ? (
          memories.map((memory) => (
            <div key={memory._id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {memory.agent && (
                    <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                      {memory.agent}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded capitalize">
                    {memory.type}
                  </span>
                  {memory.metadata?.importance && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      memory.metadata.importance === "critical" ? "bg-red-900 text-red-200" :
                      memory.metadata.importance === "high" ? "bg-orange-900 text-orange-200" :
                      memory.metadata.importance === "medium" ? "bg-yellow-900 text-yellow-200" :
                      "bg-gray-700 text-gray-300"
                    }`}>
                      {memory.metadata.importance}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(memory.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-gray-200 whitespace-pre-wrap">{memory.content}</p>
              
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {memory.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {memory.session && (
                <p className="text-xs text-gray-600 mt-2">Session: {memory.session}</p>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-900 rounded-lg p-12 border border-gray-800 text-center">
            <p className="text-gray-500">
              {searchQuery ? "No memories found matching your search" : "No memories yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
