import { FileText, Link2, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const TASKS = [
  {
    id: "t1",
    title: "Homework 3: Shortest Paths",
    due: "Due Nov 9, 2023 · 11:59 PM",
    points: "20 points",
    formUrl: "https://forms.gle/placeholder-homework3",
    status: "Open",
  },
  {
    id: "t2",
    title: "Quiz Prep Reflection",
    due: "Due Nov 11, 2023 · 6:00 PM",
    points: "10 points",
    formUrl: "https://forms.gle/placeholder-quizprep",
    status: "Open",
  },
];

const FORMS = [
  {
    id: "f1",
    title: "Project Check-in Form",
    url: "https://forms.gle/placeholder-project-checkin",
  },
  {
    id: "f2",
    title: "Peer Feedback Form",
    url: "https://forms.gle/placeholder-peer-feedback",
  },
];

function GroupTasksPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title} / Tasks
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              Post Task
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {TASKS.map((task, index) => (
                <div
                  key={task.id}
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
                        {task.title}
                      </h3>
                      <p className="text-xs text-[var(--wa-text-secondary)]">
                        {task.points} · {task.due}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-text-secondary)]">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={task.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-xs font-semibold text-[var(--wa-text-secondary)]"
                    >
                      <Link2 className="w-4 h-4" />
                      Open Google Form
                    </a>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <FileText className="w-4 h-4" />
                      Submit Task
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div
                className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-gray)" }}
              >
                <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Instructor Forms
                </h3>
                <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
                  Attachments and forms from your teacher appear here for quick
                  access.
                </p>
                <div className="mt-4 space-y-3">
                  {FORMS.map((form) => (
                    <a
                      key={form.id}
                      href={form.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]"
                    >
                      <span>{form.title}</span>
                      <Link2 className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

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
