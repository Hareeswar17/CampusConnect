import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";
import { formatRelativeTime } from "../utils/time";

const TYPE_STYLES = {
  clarification: "bg-sky-50 text-sky-700",
  question: "bg-slate-100 text-slate-700",
};

const COMMENT_LABELS = {
  clarification: "Clarification",
  question: "Question",
};

function GroupDoubtDetailPage() {
  const { groupId, doubtId } = useParams();
  const {
    groupById,
    fetchGroup,
    fetchDoubtDetail,
    addDoubtComment,
    doubtDetailById,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const [questionText, setQuestionText] = useState("");
  const detail = doubtDetailById[doubtId] || null;
  const doubt = detail?.doubt || null;
  const comments = detail?.comments || [];
  const auditLog = detail?.auditLog || [];

  useEffect(() => {
    fetchGroup(groupId);
    fetchDoubtDetail(groupId, doubtId);
  }, [fetchGroup, fetchDoubtDetail, groupId, doubtId]);

  const threadItems = useMemo(() => {
    const auditItems = auditLog.map((entry) => ({
      id: `audit-${entry.createdAt}-${entry.type}`,
      type: "audit",
      message: entry.message,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      createdAt: entry.createdAt,
    }));
    const commentItems = comments.map((comment) => ({
      id: comment._id,
      type: comment.type,
      text: comment.text,
      authorName: comment.authorName,
      authorRole: comment.authorRole,
      createdAt: comment.createdAt,
    }));
    return [...auditItems, ...commentItems].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [auditLog, comments]);

  const handleAskQuestion = () => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    addDoubtComment(groupId, doubtId, { text: trimmed, type: "question" });
    setQuestionText("");
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-5xl space-y-6">
          {!doubt ? (
            <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
              Loading doubt details...
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--wa-text-secondary)]">
              Groups / {group.title || "Group"} / Doubts
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
                className={`rounded-full px-2 py-1 font-semibold ${
                  doubt?.status === "resolved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {doubt?.status === "resolved" ? "Resolved" : "Unanswered"}
              </span>
              {doubt?.status === "resolved" &&
              doubt?.resolvedByRole === "teacher" ? (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[var(--wa-text-secondary)]">
                  Resolved by teacher
                </span>
              ) : null}
              {doubt?.assignedToTeacher ? (
                <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-1 text-[var(--wa-text-secondary)]">
                  Teacher tagged
                </span>
              ) : null}
              <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-1 text-[var(--wa-text-secondary)]">
                {doubt?.topic || "General"}
              </span>
              <span className="ml-auto text-[11px]">
                {doubt?.createdAt ? formatRelativeTime(doubt.createdAt) : ""}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--wa-text-primary)]">
              {doubt?.title || "Doubt thread"}
            </h2>
            <p className="mt-2 text-sm text-[var(--wa-text-secondary)] whitespace-pre-wrap">
              {doubt?.description || doubt?.summary || ""}
            </p>
            {doubt?.attachmentUrl && (
              <div className="mt-4 overflow-hidden rounded-lg border border-[var(--wa-panel-border)] max-w-md">
                {doubt.attachmentUrl.match(/\.(pdf)$/i) ? (
                  <a href={doubt.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 text-sm text-blue-500 hover:underline">
                    <Paperclip className="w-4 h-4" /> View attached PDF
                  </a>
                ) : (
                  <a href={doubt.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    <img src={doubt.attachmentUrl} alt="Attachment" className="w-full object-cover" />
                  </a>
                )}
              </div>
            )}
            {doubt?.assignedToTeacher ? (
              <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                Teacher tagged: only a teacher clarification will resolve this.
              </p>
            ) : null}
            <div className="mt-4 flex items-center gap-3 text-xs text-[var(--wa-text-secondary)]">
              <span>Posted by {doubt?.createdByName || "Unknown"}</span>
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
                {comments.length} posts
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {threadItems.length === 0 ? (
                <p className="text-sm text-[var(--wa-text-secondary)]">
                  No clarifications yet. Be the first to add one.
                </p>
              ) : (
                threadItems.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-3 border-b border-[var(--wa-panel-border)] pb-4 last:border-b-0 last:pb-0"
                  >
                    {item.type === "audit" ? (
                      <div className="rounded-lg border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--wa-panel)] px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
                            Audit
                          </span>
                          {item.actorRole === "teacher" ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Teacher
                            </span>
                          ) : null}
                          <span className="font-semibold text-[var(--wa-text-primary)]">
                            {item.actorName || "System"}
                          </span>
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-[var(--wa-text-primary)]">
                          {item.message}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-[var(--wa-accent-sky)]" />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                TYPE_STYLES[item.type] || "bg-slate-100"
                              }`}
                            >
                              {COMMENT_LABELS[item.type] || "Post"}
                            </span>
                            {item.authorRole === "teacher" ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Teacher
                              </span>
                            ) : null}
                            <span className="font-semibold text-[var(--wa-text-primary)]">
                              {item.authorName || "User"}
                            </span>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--wa-text-primary)]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
