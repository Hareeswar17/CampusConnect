import { ArrowLeft, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";

function GroupClarifyDoubtPage() {
  const { groupId, doubtId } = useParams();
  const {
    groupById,
    fetchGroup,
    fetchDoubtDetail,
    addDoubtComment,
    doubtDetailById,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const accentSky = "var(--wa-accent-sky)";
  const detail = doubtDetailById[doubtId];
  const doubt = detail?.doubt || null;
  const [clarification, setClarification] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroup(groupId);
    fetchDoubtDetail(groupId, doubtId);
  }, [fetchGroup, fetchDoubtDetail, groupId, doubtId]);

  const handleSubmit = async () => {
    const trimmed = clarification.trim();
    if (!trimmed) return;
    const result = await addDoubtComment(groupId, doubtId, {
      text: trimmed,
      type: "clarification",
    });
    if (result) {
      navigate(`/groups/${groupId}/doubts/${doubtId}`);
    }
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl">
          {!doubt ? (
            <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
              Loading doubt...
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--wa-text-secondary)]">
              Groups / {group.title || "Group"} / Clarify Doubt
            </div>
            <Link
              to={`/groups/${groupId}/doubts/${doubtId}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doubt
            </Link>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--wa-text-primary)]">
            Clarify Doubt
          </h2>
          <p className="text-sm text-[var(--wa-text-secondary)]">
            Share a clarification, extra steps, or resources to help resolve
            this question.
          </p>

          <div
            className="mt-6 rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 space-y-5"
            style={{ borderLeftColor: accentSky }}
          >
            <div>
              <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                Doubt
              </label>
              <div className="mt-2 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] px-3 py-2 text-sm text-[var(--wa-text-primary)]">
                {doubt?.title || "Selected doubt"}
                {doubt?.topic ? (
                  <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
                    {doubt.topic}
                  </span>
                ) : null}
                {doubt?.assignedToTeacher ? (
                  <span className="ml-2 rounded-full bg-[var(--wa-panel)] px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
                    Teacher tagged
                  </span>
                ) : null}
              </div>
              {doubt?.assignedToTeacher ? (
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                  Only a teacher clarification will resolve this doubt.
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                Clarification
              </label>
              <textarea
                rows={6}
                placeholder="Write your clarification here. Include steps, hints, or references..."
                value={clarification}
                onChange={(event) => setClarification(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-3 text-sm text-[var(--wa-text-primary)] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                Attachments
              </label>
              <div className="mt-2 rounded-lg border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--wa-green)]">
                  <Paperclip className="w-5 h-5" />
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--wa-text-primary)]">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-[var(--wa-text-secondary)]">
                  SVG, PNG, JPG, PDF or MP4 (max. 10MB)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Link
                to={`/groups/${groupId}/doubts`}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--wa-text-secondary)]"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
              >
                Submit Clarification
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupClarifyDoubtPage;
