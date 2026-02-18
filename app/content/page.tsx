"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const STAGES = [
  { id: "ideas", label: "Ideas", color: "bg-gray-700" },
  { id: "scripting", label: "Scripting", color: "bg-blue-700" },
  { id: "thumbnail", label: "Thumbnail", color: "bg-purple-700" },
  { id: "filming", label: "Filming", color: "bg-yellow-700" },
  { id: "editing", label: "Editing", color: "bg-orange-700" },
  { id: "published", label: "Published", color: "bg-green-700" },
];

export default function ContentPage() {
  const content = useQuery(api.contentPipeline.getByStage, {});
  const stats = useQuery(api.contentPipeline.getStats, {});

  const contentByStage = STAGES.map(stage => ({
    ...stage,
    items: content?.filter(c => c.stage === stage.id) ?? [],
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">📝 Content Pipeline</h1>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        {STAGES.map(stage => (
          <div key={stage.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2 capitalize">{stage.label}</h3>
            <p className="text-2xl font-bold">{stats?.[stage.id as keyof typeof stats] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-6 gap-4">
        {contentByStage.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`${column.color} rounded-t-lg px-4 py-3 font-semibold text-center`}>
              <span>{column.label}</span>
            </div>
            <div className="flex-1 bg-gray-900 rounded-b-lg p-3 space-y-3 min-h-[400px] border-x border-b border-gray-800">
              {column.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded capitalize">
                    {item.contentType}
                  </span>
                  {item.platform && (
                    <p className="text-xs text-gray-500 mt-2">{item.platform}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
