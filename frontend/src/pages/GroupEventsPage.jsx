import { CalendarDays, Clock, Filter, MapPin, Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const EVENTS = [
  {
    id: "e1",
    type: "Exam",
    title: "Midterm Exam",
    time: "Nov 3, 2023 · 9:00 AM - 11:00 AM",
    location: "Lecture Hall A",
    badgeClass: "bg-red-50 text-red-600",
    accent: "var(--wa-accent-sky)",
  },
  {
    id: "e2",
    type: "Study Session",
    title: "Graph Theory Review",
    time: "Nov 11, 2023 · 4:00 PM - 6:00 PM",
    location: "Library Study Room 3",
    badgeClass: "bg-emerald-50 text-emerald-700",
    accent: "var(--wa-accent-gray)",
  },
  {
    id: "e3",
    type: "Project Deadline",
    title: "Dijkstra Implementation Due",
    time: "Nov 14, 2023 · 11:59 PM",
    location: "Submit via Portal",
    badgeClass: "bg-blue-50 text-blue-600",
    accent: "var(--wa-accent-sky)",
  },
];

const CALENDAR_DAYS = [
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
];

const HIGHLIGHTED_DAYS = {
  3: "bg-red-50 text-red-600",
  11: "bg-emerald-50 text-emerald-600",
  14: "bg-[var(--wa-green)] text-white",
};

function GroupEventsPage() {
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
            Groups / {group.title} / Events
          </div>
          <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="wa-sidebar-enter">
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                {group.title} Events
              </h2>
              <p className="mt-2 text-sm text-[var(--wa-text-secondary)]">
                Manage critical milestones, project deadlines, and collaborative
                study sessions.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>

              <div
                className="mt-6 rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 wa-chat-enter"
                style={{ borderLeftColor: "var(--wa-accent-sky)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-[var(--wa-text-primary)]">
                      November 2023
                    </div>
                    <div className="text-xs text-[var(--wa-text-secondary)]">
                      Advanced Algorithms
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-7 w-7 rounded-full border border-[var(--wa-panel-border)] text-[var(--wa-text-secondary)]"
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      className="h-7 w-7 rounded-full border border-[var(--wa-panel-border)] text-[var(--wa-text-secondary)]"
                    >
                      {">"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div key={day} className="text-center py-1">
                        {day}
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
                  {CALENDAR_DAYS.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} />;
                    }
                    const highlight = HIGHLIGHTED_DAYS[day];
                    return (
                      <div
                        key={day}
                        className={[
                          "h-10 rounded-xl flex items-center justify-center text-[13px]",
                          highlight
                            ? highlight
                            : "text-[var(--wa-text-primary)]",
                        ].join(" ")}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-4 wa-chat-enter">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[var(--wa-text-primary)]">
                  Upcoming Events
                </h3>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)]"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {EVENTS.map((event, index) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 wa-chat-enter"
                  style={{
                    borderLeftColor: event.accent,
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

              <div className="rounded-2xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wa-panel-active)] text-[var(--wa-text-secondary)]">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="text-sm text-[var(--wa-text-secondary)]">
                  No more events this month.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupEventsPage;
