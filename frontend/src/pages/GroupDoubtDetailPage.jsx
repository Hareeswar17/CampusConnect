import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const DOUBTS = [
  {
    id: "d1",
    status: "resolved",
    title: "Confusion about solvent effects on SN2 reaction rates",
    summary:
      "Understand that polar aprotic solvents favor SN2 reactions, but I'm confused about why DMSO specifically causes such a rate increase.",
    author: "Alex C.",
    time: "2 hours ago",
    topic: "SN1/SN2 Reactions",
  },
  {
    id: "d2",
    status: "unanswered",
    title: "Determining R/S configuration on complex bicyclic systems",
    summary:
      "I'm stuck on problem set 4, question 3. When assigning priorities on a bridged bicyclic compound, how do you trace the path?",
    author: "Sarah J.",
    time: "5 hours ago",
    topic: "Stereochemistry",
  },
];

const THREADS = {
  d1: [
    {
      id: "c1",
      type: "clarification",
      author: "You",
      time: "45 mins ago",
      text: "DMSO stabilizes the cation poorly, but it strongly solvates the counterion, leaving the nucleophile more reactive.",
      replies: [
        {
          id: "c1-r1",
          type: "question",
          author: "Maya R.",
          time: "30 mins ago",
          text: "Is the rate increase mostly due to desolvation of the nucleophile?",
          replies: [],
        },
      ],
    },
  ],
  d2: [],
};

const TYPE_STYLES = {
  clarification: "bg-sky-50 text-sky-700",
  question: "bg-slate-100 text-slate-700",
};

function addReplyToThread(comments, targetId, reply) {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return { ...comment, replies: comment.replies.concat(reply) };
    }
    return {
      ...comment,
      replies: addReplyToThread(comment.replies, targetId, reply),
    };
  });
}

function ThreadComment({ comment, depth, onReplyClick }) {
  const indent = depth * 22;
  const lineColor =
    depth === 0 ? "var(--wa-accent-sky)" : "var(--wa-accent-gray)";

  return (
    <div className="relative" style={{ marginLeft: indent }}>
      {depth > 0 ? (
        <span
          className="absolute left-[-12px] top-0 bottom-0 w-px"
          style={{ backgroundColor: lineColor }}
        />
      ) : null}
      <div className="flex items-start gap-3">
        <div
          className="mt-1 h-2 w-2 rounded-full"
          style={{ backgroundColor: lineColor }}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                TYPE_STYLES[comment.type] || "bg-slate-100"
              }`}
            >
              {comment.type === "clarification" ? "Clarification" : "Question"}
            </span>
            <span className="font-semibold text-[var(--wa-text-primary)]">
              {comment.author}
            </span>
            <span>{comment.time}</span>
          </div>
          <p className="mt-1 text-sm text-[var(--wa-text-primary)]">
            {comment.text}
          </p>
          <button
            type="button"
            onClick={() => onReplyClick(comment.id)}
            className="mt-2 text-xs font-semibold text-[var(--wa-green)] hover:text-[var(--wa-green-deep)] focus:outline-none focus-visible:outline-none"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupDoubtDetailPage() {
  const { groupId, doubtId } = useParams();
  const group = getGroupById(groupId);
  const [thread, setThread] = useState(THREADS[doubtId] || []);
  const [questionText, setQuestionText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const doubt = useMemo(
    () => DOUBTS.find((item) => item.id === doubtId),
    [doubtId],
  );

  useEffect(() => {
    const pendingKey = `clarify-${groupId}-${doubtId}`;
    const stored = sessionStorage.getItem(pendingKey);
    if (!stored) return;
    try {
      const payload = JSON.parse(stored);
      const newComment = {
        id: `c-${Date.now()}`,
        type: "clarification",
        author: "You",
        time: "Just now",
        text: payload?.text || "",
        replies: [],
      };
      if (newComment.text.trim()) {
        setThread((prev) => [newComment, ...prev]);
      }
      sessionStorage.removeItem(pendingKey);
    } catch {
      sessionStorage.removeItem(pendingKey);
    }
  }, [groupId, doubtId]);

  const handleAskQuestion = () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const newComment = {
      id: `q-${Date.now()}`,
      type: "question",
      author: "You",
      time: "Just now",
      text: trimmed,
      replies: [],
    };
    setThread((prev) => [newComment, ...prev]);
    setQuestionText("");
  };

  const handleReplySubmit = () => {
    const trimmed = replyText.trim();
    if (!trimmed || !activeReplyId) return;
    const reply = {
      id: `r-${Date.now()}`,
      type: "question",
      author: "You",
      time: "Just now",
      text: trimmed,
      replies: [],
    };
    setThread((prev) => addReplyToThread(prev, activeReplyId, reply));
    setReplyText("");
    setActiveReplyId(null);
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--wa-text-secondary)]">
              Groups / {group.title} / Doubts
            </div>
            <Link
              to={`/groups/${groupId}/doubts`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doubts
            </Link>
          </div>

          <div
            className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
            style={{ borderLeftColor: "var(--wa-accent-sky)" }}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
              <span
                className={`rounded-full px-2 py-1 font-semibold ${doubt?.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {doubt?.status === "resolved" ? "Resolved" : "Unanswered"}
              </span>
              <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-1 text-[var(--wa-text-secondary)]">
                {doubt?.topic || "General"}
              </span>
              <span className="ml-auto text-[11px]">{doubt?.time || ""}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--wa-text-primary)]">
              {doubt?.title || "Doubt thread"}
            </h2>
            <p className="mt-2 text-sm text-[var(--wa-text-secondary)]">
              {doubt?.summary || ""}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-[var(--wa-text-secondary)]">
              <span>Posted by {doubt?.author || "Unknown"}</span>
              <Link
                to={`/groups/${groupId}/doubts/${doubtId}/clarify`}
                className="ml-auto rounded-full border border-[var(--wa-green)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-green)] transition-colors hover:bg-[var(--wa-green)] hover:text-white focus:outline-none focus-visible:outline-none"
              >
                Add clarification
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                Thread
              </h3>
              <span className="text-xs text-[var(--wa-text-secondary)]">
                {thread.length} posts
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {thread.length === 0 ? (
                <p className="text-sm text-[var(--wa-text-secondary)]">
                  No clarifications yet. Be the first to add one.
                </p>
              ) : (
                thread.map((comment) => (
                  <div
                    key={comment.id}
                    className="space-y-3 border-b border-[var(--wa-panel-border)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <ThreadComment
                      comment={comment}
                      depth={0}
                      onReplyClick={(id) => setActiveReplyId(id)}
                    />
                    {comment.replies.map((reply) => (
                      <ThreadComment
                        key={reply.id}
                        comment={reply}
                        depth={1}
                        onReplyClick={(id) => setActiveReplyId(id)}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>

            {activeReplyId ? (
              <div className="mt-4 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] p-3">
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Reply
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write a reply..."
                  className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyText("");
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--wa-text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReplySubmit}
                    className="rounded-lg bg-[var(--wa-green)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
            style={{ borderLeftColor: "var(--wa-accent-gray)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                Ask a question
              </h3>
              <span className="text-xs text-[var(--wa-text-secondary)]">
                Threaded like Reddit
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] p-3">
              <textarea
                rows={4}
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                placeholder="Ask a follow-up or request clarification..."
                className="w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--wa-panel-border)] px-3 py-1.5 text-xs text-[var(--wa-text-secondary)]"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach
                </button>
                <button
                  type="button"
                  onClick={handleAskQuestion}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Send className="w-4 h-4" />
                  Post question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupDoubtDetailPage;
