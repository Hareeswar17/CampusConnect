import { FileText, Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ClassShell from "../components/ClassShell";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { formatDateTime } from "../utils/time";

function GroupTasksPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const {
    groupById,
    fetchGroup,
    tasksByGroup,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const tasks = tasksByGroup[groupId] || [];
  const [tab, setTab] = useState("upcoming");
  const [submittedIds, setSubmittedIds] = useState(() => {
    try {
      const uid = authUser?._id || "anon";
      const raw = localStorage.getItem(`submitted:${uid}:tasks`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [points, setPoints] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [description, setDescription] = useState("");
  const isTeacher = authUser?.role === "teacher" || group?.isTeacher || (group.teachers && group.teachers.includes(authUser?._id));

  useEffect(() => {
    fetchGroup(groupId);
    fetchTasks(groupId, tab, 200);
  }, [fetchGroup, fetchTasks, groupId, tab]);

  const saveSubmitted = (next) => {
    try {
      const uid = authUser?._id || "anon";
      localStorage.setItem(`submitted:${uid}:tasks`, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const markSubmitted = (taskId) => {
    if (!taskId) return;
    const next = Array.from(new Set([...(submittedIds || []), taskId]));
    setSubmittedIds(next);
    saveSubmitted(next);
  };

  const resetForm = () => {
    setTitle("");
    setDueAt("");
    setPoints("");
    setFormUrl("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title || "");
    setDueAt(task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : "");
    setPoints(task.points || "");
    setFormUrl(task.formUrl || "");
    setDescription(task.description || "");
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    await deleteTask(groupId, taskId);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!dueAt) {
      toast.error("Due date is required");
      return;
    }
    const payload = {
      title: title.trim(),
      dueAt,
      points: points.trim(),
      formUrl: formUrl.trim(),
      description: description.trim(),
    };

    if (editingId) {
      const updated = await updateTask(groupId, editingId, payload);
      if (updated) resetForm();
    } else {
      const created = await createTask(groupId, payload);
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
            Groups / {group.title || "Group"} / Tasks
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
                Tasks
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                Track assignments, submissions, and forms shared by instructors.
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
                    <Plus className="w-4 h-4" /> Post Task
                  </>
                )}
              </button>
            ) : null}
          </div>

          {isTeacher && showForm ? (
            <div className="mt-4 rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 space-y-3">
              {editingId && (
                <div className="text-xs font-semibold text-[var(--wa-green)]">
                  ✏️ Editing Task
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
                    Due date
                  </label>
                  <input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-xs text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Points
                  </label>
                  <input
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="e.g. 20 points"
                    className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                    Form URL
                  </label>
                  <input
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://"
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
                  {editingId ? "Update Task" : "Save Task"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task._id}
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
                        {task.title}
                      </h3>
                      <p className="text-xs text-[var(--wa-text-secondary)]">
                        {task.points || ""}
                        {task.points ? " · " : ""}
                        {task.dueAt ? `Due ${formatDateTime(task.dueAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEdit(task)}
                            className="p-1.5 rounded-lg hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                            title="Edit task"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(task._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-text-secondary)]">
                        {task.status || "Open"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={task.formUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-xs font-semibold text-[var(--wa-text-secondary)]"
                    >
                      <Link2 className="w-4 h-4" />
                      Open Google Form
                    </a>
                    {submittedIds.includes(task._id) ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-panel-active)] px-3 py-2 text-xs font-semibold text-[var(--wa-text-secondary)]">
                        <FileText className="w-4 h-4" /> Submitted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (task.formUrl) window.open(task.formUrl, "_blank");
                          markSubmitted(task._id);
                          toast.success("Marked as submitted");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        <FileText className="w-4 h-4" />
                        Submit Task
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
                  No tasks have been posted yet.
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-sky)" }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Submission Tips
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-[var(--wa-text-secondary)]">
                  <li>Use your campus email for Google Forms.</li>
                  <li>Double-check file names before uploading.</li>
                  <li>Submit before the deadline to avoid late penalties.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupTasksPage;
