import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ClassShell from "../components/ClassShell";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { formatDateTime } from "../utils/time";

function GroupProjectsPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const {
    groupById,
    fetchGroup,
    projectsByGroup,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const projects = projectsByGroup[groupId] || [];
  const [tab, setTab] = useState("upcoming");
  const [submittedIds, setSubmittedIds] = useState(() => {
    try {
      const uid = authUser?._id || "anon";
      const raw = localStorage.getItem(`submitted:${uid}:projects`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState("Team");
  const [maxMembers, setMaxMembers] = useState(4);
  const [description, setDescription] = useState("");
  const isTeacher = authUser?.role === "teacher" || group?.isTeacher || (group.teachers && group.teachers.includes(authUser?._id));

  useEffect(() => {
    fetchGroup(groupId);
    fetchProjects(groupId, tab, 200);
  }, [fetchGroup, fetchProjects, groupId, tab]);

  const saveSubmitted = (next) => {
    try {
      const uid = authUser?._id || "anon";
      localStorage.setItem(`submitted:${uid}:projects`, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const markSubmitted = (projectId) => {
    if (!projectId) return;
    const next = Array.from(new Set([...(submittedIds || []), projectId]));
    setSubmittedIds(next);
    saveSubmitted(next);
  };

  const resetForm = () => {
    setTitle("");
    setDeadline("");
    setType("Team");
    setMaxMembers(4);
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setTitle(project.title || "");
    setDeadline(project.deadline ? new Date(project.deadline).toISOString().slice(0, 16) : "");
    setType(project.type || "Team");
    setMaxMembers(project.maxMembers || 4);
    setDescription(project.description || "");
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(groupId, projectId);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!deadline) {
      toast.error("Deadline is required");
      return;
    }
    const payload = {
      title: title.trim(),
      deadline,
      type,
      maxMembers,
      description: description.trim(),
    };

    if (editingId) {
      const updated = await updateProject(groupId, editingId, payload);
      if (updated) resetForm();
    } else {
      const created = await createProject(groupId, payload);
      if (created) resetForm();
    }
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title || "Group"} / Projects
          </div>

          <div className="mt-4">
            <div className="inline-flex rounded-md bg-[var(--wa-panel)] border border-[var(--wa-panel-border)]">
              {[
                { key: "upcoming", label: "Upcoming" },
                { key: "completed", label: "Completed" },
                { key: "all", label: "All" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1 text-sm font-semibold ${tab === t.key ? "bg-[var(--wa-green)] text-white" : "text-[var(--wa-text-secondary)]"} rounded-md`}
                >
                  {t.label}
                </button>
              ))}
            </div>
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
            {isTeacher ? (
              <button
                type="button"
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap rounded-full bg-[var(--wa-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--wa-green-deep)] transition-colors"
              >
                {showForm ? (
                  <>
                    <X className="w-4 h-4" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Project
                  </>
                )}
              </button>
            ) : null}
          </div>

          {isTeacher && showForm ? (
            <div className="mt-4 rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 space-y-3">
              {editingId && (
                <div className="text-xs font-semibold text-[var(--wa-green)]">
                  ✏️ Editing Project
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-xs text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-secondary)]"
                  >
                    <option value="Team">Team</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Max members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxMembers}
                    onChange={(e) =>
                      setMaxMembers(Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-xs font-semibold text-[var(--wa-text-secondary)]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-xs font-semibold text-white"
                >
                  {editingId ? "Update Project" : "Save Project"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="group/card rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
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
                        Deadline · {formatDateTime(project.deadline)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            className="p-1.5 rounded-lg hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-text-secondary)]">
                        {project.type || "Team"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[var(--wa-text-secondary)]">
                    {project.type === "Team"
                      ? `Up to ${project.maxMembers || 1} members per team.`
                      : "Individual submission only."}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {submittedIds.includes(project._id) ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-panel-active)] px-3 py-2 text-xs font-semibold text-[var(--wa-text-secondary)]">
                        Submitted
                      </span>
                    ) : (
                      !isTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            markSubmitted(project._id);
                            toast.success("Marked project as submitted");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-3 py-2 text-xs font-semibold text-white"
                        >
                          Mark Submitted
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}

              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
                  No projects posted yet.
                </div>
              ) : null}
            </div>
            <aside className="space-y-4">
              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-gray)" }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Team Notes
                </h3>
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                  Team formation and member requests will appear here once
                  enabled.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupProjectsPage;
