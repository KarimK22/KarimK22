"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function DocumentsPage() {
  const documents = useQuery(api.contentPipeline.getByStage, {});

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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur
                     rounded-xl border border-gray-700/50 p-6
                     hover:border-gray-600 hover:shadow-xl transition-all duration-300"
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
            <p className="text-gray-300 mb-4 line-clamp-3">
              {doc.content?.substring(0, 300)}
              {doc.content && doc.content.length > 300 && '...'}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
              {/* Assignee */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Assignee:</span>
                <span className="text-sm font-medium text-white">{doc.assignee || "Unassigned"}</span>
              </div>

              {/* Platform */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Platform:</span>
                <span className="text-sm font-medium text-white capitalize">{doc.platform}</span>
              </div>
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
    </div>
  );
}
