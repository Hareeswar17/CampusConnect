import { Plus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const PROJECTS = [
  {
    id: "p1",
    title: "Shortest Path Visualizer",
    deadline: "Dec 5, 2023 · 11:59 PM",
    type: "Individual",
    maxMembers: 1,
  },
  {
    id: "p2",
    title: "Graph Theory Toolkit",
    deadline: "Dec 12, 2023 · 11:59 PM",
    type: "Team",
    maxMembers: 4,
  },
];

const MEMBERS = [
  { id: "m1", name: "Sarah Williams", role: "Data Science" },
  { id: "m2", name: "Marcus Johnson", role: "Computer Science" },
  { id: "m3", name: "Emily Davis", role: "Computer Engineering" },
  { id: "m4", name: "David Chen", role: "Mathematics" },
];

function GroupProjectsPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);
  const [teamName, setTeamName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS[1]?.id);
  const [requestedIds, setRequestedIds] = useState(new Set());

  const selectedProject = useMemo(
    () => PROJECTS.find((project) => project.id === selectedProjectId),
    [selectedProjectId],
  );

  const handleRequest = (memberId) => {
    setRequestedIds((prev) => {
      const next = new Set(prev);
      next.add(memberId);
      return next;
    });
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title} / Projects
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Projects
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                Teacher-posted projects with deadlines, formats, and team
                options.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {PROJECTS.map((project, index) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                  style={{
                    borderLeftColor:
                      index % 2 === 0
                        ? "var(--wa-accent-sky)"
                        : "var(--wa-accent-gray)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[var(--wa-text-secondary)]">
                        Deadline · {project.deadline}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-text-secondary)]">
                      {project.type}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-[var(--wa-text-secondary)]">
                    {project.type === "Team"
                      ? `Up to ${project.maxMembers} members per team.`
                      : "Individual submission only."}
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-sky)" }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Create a Team
                </h3>
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                  Pick a team project, name your group, and request members.
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                      Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(event) =>
                        setSelectedProjectId(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-secondary)]"
                    >
                      {PROJECTS.filter(
                        (project) => project.type === "Team",
                      ).map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                      Team Name
                    </label>
                    <input
                      value={teamName}
                      onChange={(event) => setTeamName(event.target.value)}
                      placeholder="e.g. PathFinders"
                      className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                  </div>
                  <div className="rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                    {selectedProject
                      ? `Team size limit: ${selectedProject.maxMembers} members`
                      : "Select a team project to see limits."}
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-gray)" }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Invite Members
                </h3>
                <div className="mt-3 space-y-3">
                  {MEMBERS.map((member) => {
                    const isRequested = requestedIds.has(member.id);
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--wa-panel-border)] px-3 py-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[var(--wa-text-primary)]">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-[var(--wa-text-secondary)]">
                            {member.role}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isRequested}
                          onClick={() => handleRequest(member.id)}
                          className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                            isRequested
                              ? "border border-[var(--wa-panel-border)] text-[var(--wa-text-secondary)] cursor-not-allowed"
                              : "border border-[var(--wa-green)] text-[var(--wa-green)] hover:bg-[var(--wa-green)] hover:text-white"
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {isRequested ? "Requested" : "Send Request"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupProjectsPage;
