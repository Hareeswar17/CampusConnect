import { Link, useParams } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const DOUBTS = [
  {
    id: "d1",
    status: "resolved",
    title: "Confusion about solvent effects on SN2 reaction rates",
    summary:
      "Understand that polar aprotic solvents favor SN2 reactions, but I'm confused about why DMSO specifically causes such a rate increase.",
    replies: 5,
    votes: 24,
    author: "Alex C.",
    time: "2 hours ago",
    topic: "SN1/SN2 Reactions",
    assignedToTeacher: false,
  },
  {
    id: "d2",
    status: "unanswered",
    title: "Determining R/S configuration on complex bicyclic systems",
    summary:
      "I'm stuck on problem set 4, question 3. When assigning priorities on a bridged bicyclic compound, how do you trace the path?",
    replies: 0,
    votes: 12,
    author: "Sarah J.",
    time: "5 hours ago",
    topic: "Stereochemistry",
    assignedToTeacher: true,
  },
];

const TOPICS = [
  { label: "Integration", count: 45 },
  { label: "SN1 Reaction", count: 32 },
  { label: "Spectroscopy", count: 28 },
  { label: "Resonance", count: 15 },
  { label: "Nomenclature", count: 12 },
];

function GroupDoubtsPage() {
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
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Class Doubts
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                Ask questions, share insights, and help your peers master the
                material.
              </p>
            </div>
            <Link
              to={`/groups/${groupId}/doubts/new`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)]"
            >
              Ask a Doubt
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div
                className="flex flex-wrap items-center gap-2 rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-3"
                style={{ borderLeftColor: accentSky }}
              >
                <div className="flex flex-1 items-center gap-2 rounded-lg bg-[var(--wa-search-bg)] px-3 py-2">
                  <Search className="w-[16px] h-[16px] text-[var(--wa-icon)]" />
                  <input
                    placeholder="Search questions..."
                    className="w-full bg-transparent text-sm text-[var(--wa-text-primary)] outline-none placeholder:text-[var(--wa-text-secondary)]"
                  />
                </div>
                <select className="rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                  <option>All Topics</option>
                </select>
                <select className="rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                  <option>Status: All</option>
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--wa-panel-border)] p-2 text-[var(--wa-text-secondary)]"
                >
                  <Filter className="w-[16px] h-[16px]" />
                </button>
              </div>

              {DOUBTS.map((doubt) => {
                const statusLabel =
                  doubt.status === "resolved" ? "Resolved" : "Unanswered";
                const statusClasses =
                  doubt.status === "resolved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600";

                return (
                  <article
                    key={doubt.id}
                    className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                    style={{ borderLeftColor: accentSky }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 text-[var(--wa-text-secondary)]">
                        <span className="text-xs font-semibold">
                          {doubt.votes}
                        </span>
                        <span className="text-[11px]">votes</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2 py-1 font-semibold ${statusClasses}`}
                          >
                            {statusLabel}
                          </span>
                          {doubt.assignedToTeacher ? (
                            <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-1 text-[var(--wa-text-secondary)]">
                              Assigned to teacher
                            </span>
                          ) : null}
                          <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-1 text-[var(--wa-text-secondary)]">
                            {doubt.topic}
                          </span>
                          <span className="ml-auto text-[11px] text-[var(--wa-text-secondary)]">
                            {doubt.time}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-[var(--wa-text-primary)]">
                          <Link
                            to={`/groups/${groupId}/doubts/${doubt.id}`}
                            className="hover:text-[var(--wa-green)]"
                          >
                            {doubt.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                          {doubt.summary}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--wa-text-secondary)]">
                          <span>{doubt.author}</span>
                          <span>{doubt.replies} Replies</span>
                          {doubt.status !== "resolved" ? (
                            <Link
                              to={`/groups/${groupId}/doubts/${doubt.id}/clarify`}
                              className="ml-auto rounded-full border border-[var(--wa-green)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-green)] transition-colors hover:bg-[var(--wa-green)] hover:text-white focus:outline-none focus-visible:outline-none"
                            >
                              Clarify
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="space-y-4">
              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: accentGray }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Group Activity
                </h3>
                <div className="mt-4 grid gap-3">
                  <div
                    className="rounded-lg border border-l-4 border-[var(--wa-panel-border)] p-4"
                    style={{ borderLeftColor: accentGray }}
                  >
                    <div className="text-xs text-[var(--wa-text-secondary)]">
                      Total Doubts
                    </div>
                    <div className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                      142
                    </div>
                  </div>
                  <div
                    className="rounded-lg border border-l-4 border-[var(--wa-panel-border)] p-4"
                    style={{ borderLeftColor: accentGray }}
                  >
                    <div className="text-xs text-[var(--wa-text-secondary)]">
                      Resolved Rate
                    </div>
                    <div className="text-2xl font-semibold text-emerald-600">
                      89%
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: accentGray }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Popular Topics
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOPICS.map((topic) => (
                    <span
                      key={topic.label}
                      className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] text-[var(--wa-text-secondary)]"
                    >
                      {topic.label} ({topic.count})
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupDoubtsPage;
