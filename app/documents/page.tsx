"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function DocumentsPage() {
  const documentsRaw = useQuery(api.contentPipeline.getByStage, {});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Sort documents by creation time (newest first)
  const documents = documentsRaw?.sort((a, b) => b._creationTime - a._creationTime);

  const getPriorityColor = (stage: string) => {
    switch (stage) {
      case "published": return "bg-green-500";
      case "approved": return "bg-blue-500";
      case "review": return "bg-orange-500";
      case "draft": return "bg-gray-500";
      default: return "bg-purple-500";
    }
  };

  const getTypeColor = (contentType: string) => {
    switch (contentType) {
      case "report": return "bg-blue-500";
      case "document": return "bg-purple-500";
      case "post": return "bg-pink-500";
      case "video": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📄 Documents</h1>
          <p className="text-gray-400">Strategic documents and deliverables</p>
        </div>
        <Link
          href="/"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-6">
        {documents?.map((doc) => (
          <div
            key={doc._id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur
                     rounded-xl border border-gray-700/50 p-6
                     hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 
                     transition-all duration-300 cursor-pointer"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Type Badge */}
                <span className={`${getTypeColor(doc.contentType)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                  {doc.contentType}
                </span>

                {/* Stage Badge */}
                <span className={`${getPriorityColor(doc.stage)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                  {doc.stage}
                </span>
              </div>

              {/* Timestamp */}
              <span className="text-sm text-gray-400">
                {formatDate(doc._creationTime)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-3 text-white">
              {doc.title}
            </h3>

            {/* Summary/Content Preview */}
            <p className="text-gray-300 mb-4 line-clamp-2">
              {doc.content?.substring(0, 200)}
              {doc.content && doc.content.length > 200 && '...'}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
              {/* Assignee */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Assignee:</span>
                <span className="text-sm font-medium text-white">{doc.assignee || "Unassigned"}</span>
              </div>

              {/* View Button */}
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                View Full Document →
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {documents?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">No Documents Yet</h3>
            <p className="text-gray-400">
              Documents created by agents will appear here
            </p>
          </div>
        )}

        {/* Loading State */}
        {!documents && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading documents...</p>
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedDoc(null)}
        >
          <div 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 
                       max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`${getTypeColor(selectedDoc.contentType)} px-3 py-1.5 rounded-full text-xs font-bold uppercase`}>
                    {selectedDoc.contentType}
                  </span>
                  <span className={`${getPriorityColor(selectedDoc.stage)} px-3 py-1.5 rounded-full text-xs font-bold uppercase`}>
                    {selectedDoc.stage}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedDoc.title}
              </h2>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>📅 {formatDate(selectedDoc._creationTime)}</span>
                <span>👤 {selectedDoc.assignee || "Unassigned"}</span>
                <span>📍 {selectedDoc.platform}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {selectedDoc.content}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-6 flex justify-between">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedDoc.content || '');
                  alert('Content copied to clipboard!');
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                📋 Copy Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
