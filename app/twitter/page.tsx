"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

const MC_API = "https://outstanding-snail-503.eu-west-1.convex.site";

const STAGES = [
  {
    id: "review",
    label: "Pending Review",
    color: "bg-yellow-600",
    icon: "📋",
    description: "Tap ✅ to approve or ❌ to reject with a reason",
  },
  {
    id: "approved",
    label: "Approved",
    color: "bg-green-700",
    icon: "✅",
    description: "Ready to post",
  },
  {
    id: "draft",
    label: "Rejected",
    color: "bg-red-700",
    icon: "❌",
    description: "Feedback logged — scout learns from these",
  },
];

// ── RT Pick Card ───────────────────────────────────────────────────────────────
function RTPickCard({ item }: { item: any }) {
  const lines = item.content?.split("\n") ?? [];
  const get = (prefix: string) =>
    lines.find((l: string) => l.startsWith(prefix))?.replace(prefix, "").trim() ?? "";
  const account = get("Account:");
  const action = get("Action:");
  const author = get("Original:");
  const url = get("URL:");
  const preview = get("Preview:");
  const qt = get("Quote tweet:");
  const why = get("Why:");
  const isQT = action === "quote_tweet";
  const isFounder = account.includes("Adn4n");
  const [copiedQt, setCopiedQt] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isFounder ? "bg-blue-900 text-blue-200" : "bg-purple-900 text-purple-200"}`}>
            {isFounder ? "👤 @Adn4n_0" : "🐦 @lingocoins"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isQT ? "bg-orange-900 text-orange-200" : "bg-teal-900 text-teal-200"}`}>
            {isQT ? "💬 Quote Tweet" : "🔁 Retweet"}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{author}</span>
      </div>
      <div className="bg-gray-900 rounded-lg p-3 mb-3 border border-gray-700">
        <p className="text-sm text-gray-300 leading-relaxed italic">"{preview}"</p>
      </div>
      {isQT && qt && (
        <div className="bg-orange-900/20 border border-orange-800/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-orange-400 font-medium mb-1">Your quote:</p>
          <p className="text-sm text-orange-100">{qt}</p>
          <button
            className="text-xs text-orange-400 hover:text-orange-300 mt-2 transition-colors"
            onClick={() => { navigator.clipboard.writeText(qt); setCopiedQt(true); setTimeout(() => setCopiedQt(false), 2000); }}
          >
            {copiedQt ? "✓ Copied" : "Copy quote text"}
          </button>
        </div>
      )}
      {why && <p className="text-xs text-gray-500 mb-3">↳ {why}</p>}
      {url && url.includes("x.com") ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
          🔗 Open on X →
        </a>
      ) : (
        <p className="text-xs text-gray-600 italic">URL not captured for this pick</p>
      )}
    </div>
  );
}

// ── Draft Card ─────────────────────────────────────────────────────────────────
function DraftCard({ item }: { item: any }) {
  const moveStage = useMutation(api.contentPipeline.moveStage);
  const update = useMutation(api.contentPipeline.update);

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const lines = item.content?.split("\n") ?? [];
  const accountLine = lines.find((l: string) => l.startsWith("Account:"));
  const account = accountLine?.replace("Account:", "").trim() ?? "";
  const draftText = lines.slice(accountLine ? 2 : 0).join("\n").trim();

  const rejectionReason = item.stage === "draft"
    ? lines.find((l: string) => l.startsWith("Rejection reason:"))?.replace("Rejection reason:", "").trim()
    : null;

  const isFounder = account.includes("Adn4n");
  const accountColor = isFounder ? "bg-blue-900 text-blue-200" : "bg-purple-900 text-purple-200";
  const accountLabel = isFounder ? "👤 @Adn4n_0" : "🐦 @lingocoins";

  const titleMatch = item.title?.match(/Draft (\d+)/);
  const draftNum = titleMatch?.[1] ?? "?";
  const styleMatch = item.title?.match(/\[([^\]]+)\]\s*\[([^\]]+)\]/);
  const style = styleMatch?.[1]?.replace(/@[^\]]+\]\s*\[/, "") ?? "";
  const engagement = styleMatch?.[2] ?? "";
  const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // ── handlers ──
  const handleApprove = async () => {
    setLoading("approve");
    try {
      await moveStage({ id: item._id as Id<"contentPipeline">, stage: "approved" });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading("reject");
    try {
      // Build updated content with rejection reason appended
      const updatedContent = `${item.content ?? ""}\n\nRejection reason:\n${rejectReason.trim()}`;
      await update({ id: item._id as Id<"contentPipeline">, content: updatedContent });
      await moveStage({ id: item._id as Id<"contentPipeline">, stage: "draft" });

      // Also log to Mission Control memory so scout can pick it up
      await fetch(`${MC_API}/api/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "decision",
          content: `Twitter draft rejected from Mission Control.\nAccount: ${account}\nDraft: ${draftText}\nReason: ${rejectReason.trim()}`,
          agent: "twitter-scout",
          tags: ["twitter-feedback", "rejection"],
        }),
      });

      setShowRejectBox(false);
      setRejectReason("");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      item.stage === "approved"
        ? "bg-green-900/10 border-green-700/50"
        : item.stage === "draft"
        ? "bg-red-900/10 border-red-800/40"
        : "bg-gray-800 border-gray-700 hover:border-gray-500"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">#{draftNum}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accountColor}`}>
            {accountLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>

      {/* Style badges */}
      {(style || engagement) && (
        <div className="flex gap-2 mb-3">
          {style && <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">{style}</span>}
          {engagement && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              engagement === "high" ? "bg-green-900 text-green-300" :
              engagement === "medium" ? "bg-yellow-900 text-yellow-300" :
              "bg-gray-700 text-gray-400"
            }`}>{engagement} engagement</span>
          )}
        </div>
      )}

      {/* Draft text */}
      <div className="bg-gray-900 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
          {draftText || item.content}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{(draftText || item.content)?.length ?? 0} / 280</span>
          <button onClick={() => { navigator.clipboard.writeText(draftText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Rejection reason (if rejected) */}
      {rejectionReason && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-red-400 mb-1">❌ Rejection reason:</p>
          <p className="text-xs text-red-200">{rejectionReason}</p>
          <p className="text-xs text-red-500 mt-1">✓ Scout will learn from this next run</p>
        </div>
      )}

      {/* ── Action buttons (only on pending review) ── */}
      {item.stage === "review" && !showRejectBox && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-green-900 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading === "approve" ? (
              <span className="animate-pulse">Saving…</span>
            ) : (
              <><span>✅</span> Approve</>
            )}
          </button>
          <button
            onClick={() => setShowRejectBox(true)}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-800 hover:bg-red-700 disabled:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>❌</span> Reject
          </button>
        </div>
      )}

      {/* ── Reject reason box ── */}
      {item.stage === "review" && showRejectBox && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-red-400 font-medium">Why are you rejecting this draft?</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Too salesy, wrong tone, off-brand, not relevant to today's trends…"
            rows={3}
            className="w-full bg-gray-900 border border-red-700 rounded-lg p-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || loading !== null}
              className="flex-1 px-3 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading === "reject" ? <span className="animate-pulse">Saving…</span> : "Submit & Train Scout"}
            </button>
            <button
              onClick={() => { setShowRejectBox(false); setRejectReason(""); }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-600">Your reason will be logged and injected into tomorrow's scout prompt.</p>
        </div>
      )}

      {/* Approved badge */}
      {item.stage === "approved" && (
        <div className="mt-3 text-center py-1.5 bg-green-900/40 border border-green-700/50 rounded-lg">
          <span className="text-xs text-green-400 font-medium">✅ Approved — ready to post</span>
        </div>
      )}

      {/* Title details */}
      <div className="mt-3 pt-2 border-t border-gray-700/50">
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-600 hover:text-gray-500 transition-colors">
          {expanded ? "▲ Hide" : "▼ Details"}
        </button>
        {expanded && <p className="text-xs text-gray-600 mt-1 break-all">{item.title}</p>}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TwitterPage() {
  const allContent = useQuery(api.contentPipeline.getByStage, {});
  const content = allContent?.filter((c) => c.platform === "twitter");

  const drafts = content?.filter((c) => !c.title?.startsWith("RT Pick"));
  const rtPicks = content?.filter((c) => c.title?.startsWith("RT Pick")) ?? [];

  const byStage = STAGES.map((stage) => ({
    ...stage,
    items: drafts?.filter((c) => c.stage === stage.id) ?? [],
  }));

  const total = drafts?.length ?? 0;
  const approved = drafts?.filter((c) => c.stage === "approved").length ?? 0;
  const pending = drafts?.filter((c) => c.stage === "review").length ?? 0;
  const rejected = drafts?.filter((c) => c.stage === "draft").length ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🐦 Twitter Drafts</h1>
        <p className="text-gray-400 text-sm">
          Daily drafts from Twitter Scout — approve to queue, reject with feedback to train the next run.
        </p>
        <div className="flex gap-2 mt-3 text-xs text-gray-500">
          <span>Accounts:</span>
          <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full">👤 @Adn4n_0 (founder)</span>
          <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full">🐦 @lingocoins (brand)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-sm text-gray-400 mb-1">Total Drafts</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-yellow-800/50">
          <p className="text-sm text-yellow-400 mb-1">📋 Pending Review</p>
          <p className="text-3xl font-bold text-yellow-300">{pending}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-green-800/50">
          <p className="text-sm text-green-400 mb-1">✅ Approved</p>
          <p className="text-3xl font-bold text-green-300">{approved}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-red-800/50">
          <p className="text-sm text-red-400 mb-1">❌ Rejected</p>
          <p className="text-3xl font-bold text-red-300">{rejected}</p>
          {rejected > 0 && <p className="text-xs text-red-500 mt-1">Feedback training next run</p>}
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-6">
        {byStage.map((col) => (
          <div key={col.id}>
            <div className={`${col.color} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2 font-semibold">
                <span>{col.icon}</span>
                <span>{col.label}</span>
              </div>
              <span className="bg-black/30 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                {col.items.length}
              </span>
            </div>
            <div className="bg-gray-900/30 px-4 py-2 border-x border-gray-800">
              <p className="text-xs text-gray-500">{col.description}</p>
            </div>
            <div className="bg-gray-900/30 rounded-b-xl p-3 space-y-3 min-h-[200px] border-x border-b border-gray-800">
              {allContent === undefined ? (
                <div className="text-center text-gray-600 text-sm pt-8">Loading…</div>
              ) : col.items.length === 0 ? (
                <div className="text-center text-gray-600 text-sm pt-8">No drafts</div>
              ) : (
                col.items.map((item) => <DraftCard key={item._id} item={item} />)
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Retweet Picks */}
      {rtPicks.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-1">🔁 Retweet Picks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Real tweets the scout found worth retweeting or quote-tweeting — click to open on X.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {rtPicks.map((item: any) => <RTPickCard key={item._id} item={item} />)}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="font-semibold text-gray-300 mb-4">⚙️ How the review loop works</h3>
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-400">
          <div>
            <p className="text-white font-medium mb-1">1. Scout runs daily</p>
            <p>7am CET — Grok scans live CT, generates 6 drafts based on what's trending</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">2. Review here or Telegram</p>
            <p>Approve or reject on this page, or tap buttons in the Telegram report</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">3. Feedback logged</p>
            <p>Rejection reasons are saved — visible on the card and in Mission Control memory</p>
          </div>
          <div>
            <p className="text-white font-medium mb-1">4. Scout learns</p>
            <p>Next run, the scout reads your past rejections and avoids those patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
