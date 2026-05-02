import { Paperclip } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

function GroupAskDoubtPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);
  const accentSky = "var(--wa-accent-sky)";
  const accentGray = "var(--wa-accent-gray)";

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title} / Ask a Doubt
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--wa-text-primary)]">
            Ask a Doubt
          </h2>
          <p className="text-sm text-[var(--wa-text-secondary)]">
            Post your question to the {group.title} group. Tutors and peers can
            help you out.
          </p>

          <div
            className="mt-6 rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 space-y-5"
            style={{ borderLeftColor: accentSky }}
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div>
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Question Title
                </label>
                <input
                  placeholder="e.g. How to solve this integration by parts problem?"
                  className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Topic
                </label>
                <select className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-secondary)]">
                  <option>Select topic</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Description
                </label>
                <label className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                  Mark as Urgent
                  <input type="checkbox" className="accent-[var(--wa-green)]" />
                </label>
              </div>
              <div
                className="mt-2 rounded-lg border border-l-4 border-[var(--wa-panel-border)]"
                style={{ borderLeftColor: accentGray }}
              >
                <div className="flex items-center gap-3 border-b border-[var(--wa-panel-border)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                  <button type="button" className="font-semibold">
                    B
                  </button>
                  <button type="button" className="italic">
                    I
                  </button>
                  <button type="button" className="underline">
                    U
                  </button>
                  <span className="text-[var(--wa-text-secondary)]">|</span>
                  <button type="button">\</button>
                  <button type="button">=</button>
                </div>
                <textarea
                  rows={6}
                  placeholder="Describe your doubt in detail. Include what you've tried so far..."
                  className="w-full rounded-b-lg bg-transparent px-3 py-3 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                Attachments
              </label>
              <div
                className="mt-2 rounded-lg border border-l-4 border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] p-6 text-center"
                style={{ borderLeftColor: accentGray }}
              >
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

              <div
                className="mt-3 flex items-center justify-between rounded-lg border border-l-4 border-[var(--wa-panel-border)] px-3 py-2 text-xs"
                style={{ borderLeftColor: accentGray }}
              >
                <div>
                  <p className="font-semibold text-[var(--wa-text-primary)]">
                    equation_screenshot.png
                  </p>
                  <p className="text-[var(--wa-text-secondary)]">1.2 MB</p>
                </div>
                <button
                  type="button"
                  className="text-[var(--wa-text-secondary)]"
                >
                  x
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--wa-text-secondary)]"
              >
                Save Draft
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--wa-panel-active)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupAskDoubtPage;
