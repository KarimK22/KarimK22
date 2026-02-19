"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Document {
  id: string;
  agent: string;
  agentColor: string;
  type: string;
  typeColor: string;
  priority: string;
  priorityColor: string;
  title: string;
  summary: string;
  tags: string[];
  timestamp: string;
  filename: string;
  size: string;
}

export default function DocumentsPage() {
  const [documents] = useState<Document[]>([
    {
      id: "lingo-x-strategy",
      agent: "VIBE + INSIGHT",
      agentColor: "bg-orange-500",
      type: "Strategy",
      typeColor: "bg-blue-500",
      priority: "High",
      priorityColor: "bg-red-500",
      title: "Lingo X Content Strategy",
      summary: "Comprehensive data-driven content strategy for @Lingocoins X account. Corrects peak posting times (09:00 UTC not 15:00), identifies Twitter underperformance (9% traffic despite 556.9K followers), staking education gap (4.4% conversion), and gaming-first user behavior. Includes 70/20/10 content mix, 30-day execution plan, post templates, and success metrics. Target: 1.1% → 5-8% reach in 30 days.",
      tags: ["#x-strategy", "#content", "#data-validated", "#ceo-ready"],
      timestamp: "2/19/2026, 8:58 PM",
      filename: "lingo-x-strategy.md",
      size: "32KB"
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [docContent, setDocContent] = useState("");

  useEffect(() => {
    if (selectedDoc) {
      const doc = documents.find(d => d.id === selectedDoc);
      if (doc) {
        fetch(`/${doc.filename}`)
          .then(res => res.text())
          .then(content => setDocContent(content))
          .catch(err => console.error('Failed to load:', err));
      }
    }
  }, [selectedDoc, documents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📄 Documents</h1>
            <p className="text-gray-400">Strategic documents and deliverables</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            ← Dashboard
          </Link>
        </div>

        {!selectedDoc ? (
          /* Document List */
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 
                         p-5 hover:bg-slate-800/80 hover:border-slate-600 
                         transition-all duration-200 cursor-pointer group">
                
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Agent Badge */}
                    <span className={`${doc.agentColor} text-white text-xs font-semibold px-3 py-1 rounded`}>
                      {doc.agent}
                    </span>
                    
                    {/* Type Badge */}
                    <span className={`${doc.typeColor} text-white text-xs font-semibold px-3 py-1 rounded`}>
                      {doc.type}
                    </span>
                    
                    {/* Priority Badge */}
                    <span className={`${doc.priorityColor} text-white text-xs font-semibold px-3 py-1 rounded`}>
                      {doc.priority}
                    </span>
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-gray-500 text-sm">
                    {doc.timestamp}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {doc.title}
                </h3>

                {/* Summary */}
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  {doc.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors">
                      {tag}
                    </span>
                  ))}
                  <span className="text-gray-500 text-xs ml-auto">
                    {doc.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Document Viewer */
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => setSelectedDoc(null)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4">
              <span>←</span>
              <span>Back to Documents</span>
            </button>

            {/* Document Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {documents.find(d => d.id === selectedDoc)?.title}
                  </h2>
                  <div className="flex gap-3 text-sm text-gray-400">
                    <span>👤 {documents.find(d => d.id === selectedDoc)?.agent}</span>
                    <span>📊 {documents.find(d => d.id === selectedDoc)?.type}</span>
                    <span>📏 {documents.find(d => d.id === selectedDoc)?.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <span>🖨️</span>
                  Print / Save PDF
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
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
            </div>

            {/* Document Content */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
              <div className="max-h-[700px] overflow-y-auto">
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {docContent || "Loading document..."}
                </pre>
              </div>

              {/* Download Options */}
              <div className="mt-6 pt-6 border-t border-slate-700 flex gap-3">
                <a
                  href={`/${documents.find(d => d.id === selectedDoc)?.filename}`}
                  download={documents.find(d => d.id === selectedDoc)?.filename}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  📥 Download Markdown
                </a>
                <button
                  onClick={() => {
                    const blob = new Blob([docContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${documents.find(d => d.id === selectedDoc)?.filename.replace('.md', '.txt')}`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  📝 Download TXT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
