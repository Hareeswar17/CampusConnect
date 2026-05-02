import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const UPCOMING_EVENTS = [
  {
    id: "e1",
    type: "Exam",
    title: "Midterm Exam",
    time: "Nov 3, 2023 · 9:00 AM - 11:00 AM",
    location: "Lecture Hall A",
    badgeClass: "bg-red-50 text-red-600",
  },
  {
    id: "e2",
    type: "Study Session",
    title: "Graph Theory Review",
    time: "Nov 11, 2023 · 4:00 PM - 6:00 PM",
    location: "Library Study Room 3",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "e3",
    type: "Project Deadline",
    title: "Dijkstra Implementation Due",
    time: "Nov 14, 2023 · 11:59 PM",
    location: "Submit via Portal",
    badgeClass: "bg-blue-50 text-blue-600",
  },
];

function GroupOverviewPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl space-y-6">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title}
          </div>

          <section
            className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 wa-chat-enter"
            style={{ borderLeftColor: "var(--wa-accent-sky)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)]">
                  <Sparkles className="w-4 h-4" />
                  Class Overview
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--wa-text-primary)]">
                  {group.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                  {group.subtitle} · {group.members}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel-active)] px-4 py-3 text-xs text-[var(--wa-text-secondary)]">
                Next up: {UPCOMING_EVENTS[0].title}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4 wa-sidebar-enter">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
                  Current Events
                </h3>
                <a
                  href={`/groups/${groupId}/events`}
                  className="text-xs font-semibold text-[var(--wa-green)]"
                >
                  View all
                </a>
              </div>

              {UPCOMING_EVENTS.map((event, index) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 wa-chat-enter"
                  style={{
                    borderLeftColor:
                      index % 2 === 0
                        ? "var(--wa-accent-sky)"
                        : "var(--wa-accent-gray)",
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${event.badgeClass}`}
                  >
                    {event.type.toUpperCase()}
                  </span>
                  <div className="mt-3 text-lg font-semibold text-[var(--wa-text-primary)]">
                    {event.title}
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-[var(--wa-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-4 wa-chat-enter">
              <div
                className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-gray)" }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                    Calendar Snapshot
                  </h4>
                  <CalendarDays className="w-4 h-4 text-[var(--wa-text-secondary)]" />
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2 text-[11px] text-[var(--wa-text-secondary)]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-center">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div
                      key={`day-${index}`}
                      className={
                        index === 10
                          ? "h-8 rounded-lg bg-[var(--wa-green)] text-white flex items-center justify-center"
                          : "h-8 rounded-lg bg-[var(--wa-panel-active)] flex items-center justify-center"
                      }
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-sky)" }}
              >
                <h4 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Quick Tips
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-[var(--wa-text-secondary)]">
                  <li>Review upcoming milestones each week.</li>
                  <li>Check Events for room or time changes.</li>
                  <li>Use Tasks for submission links.</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupOverviewPage;
