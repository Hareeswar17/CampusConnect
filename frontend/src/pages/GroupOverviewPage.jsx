import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Sparkles,
  Plus,
  CalendarPlus,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatDateTimeRange, formatDateTime } from "../utils/time";

/* ────────── Calendar helpers ────────── */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

/* ────────── Component ────────── */
function GroupOverviewPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const {
    groupById,
    eventsByGroup,
    tasksByGroup,
    projectsByGroup,
    fetchGroup,
    fetchEvents,
    fetchTasks,
    fetchProjects,
  } = useGroupStore();

  const group = groupById[groupId] || {};
  const events = eventsByGroup[groupId] || [];
  const tasks = tasksByGroup[groupId] || [];
  const projects = projectsByGroup[groupId] || [];
  const now = new Date();

  const isTeacher =
    authUser?.role === "teacher" ||
    group?.isTeacher ||
    (group.teachers && group.teachers.includes(authUser?._id));

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const cutoff = event.endAt || event.startAt;
        return cutoff ? new Date(cutoff) >= now : true;
      })
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 3);
  }, [events, now]);
  const recentTasks = tasks.slice(0, 5);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchGroup(groupId);
    fetchEvents(groupId, "upcoming", 20);
    fetchTasks(groupId);
    fetchProjects(groupId);
  }, [fetchGroup, fetchEvents, fetchTasks, fetchProjects, groupId]);

  /* Build a Set of day-numbers that have events or task deadlines */
  const markedDays = useMemo(() => {
    const map = {}; // dayNumber → { events: [], tasks: [] }

    events.forEach((ev) => {
      const d = new Date(ev.startAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const key = d.getDate();
        if (!map[key]) map[key] = { events: [], tasks: [] };
        map[key].events.push(ev);
      }
    });

    tasks.forEach((t) => {
      const d = new Date(t.dueAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const key = d.getDate();
        if (!map[key]) map[key] = { events: [], tasks: [] };
        map[key].tasks.push(t);
      }
    });

    return map;
  }, [events, tasks, calYear, calMonth]);

  const calendarCells = useMemo(
    () => buildCalendarDays(calYear, calMonth),
    [calYear, calMonth],
  );

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const selectedItems = selectedDay ? markedDays[selectedDay] : null;

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

          {/* Header card */}
          <section
            className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 wa-chat-enter relative overflow-hidden"
            style={{ borderLeftColor: "var(--wa-accent-sky)" }}
          >
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 -mt-10 -mr-10 opacity-[0.03] pointer-events-none">
              <Sparkles className="w-64 h-64 text-[var(--wa-text-primary)]" />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)] uppercase tracking-wider font-semibold">
                  <Sparkles className="w-4 h-4 text-[var(--wa-accent-sky)]" />
                  Class Overview
                </div>
                <h2 className="mt-2 text-3xl font-bold text-[var(--wa-text-primary)]">
                  {group.title || "Group"}
                </h2>
                <p className="mt-2 text-sm text-[var(--wa-text-secondary)] max-w-2xl">
                  {group.description ||
                    group.subtitle ||
                    "Welcome to your class hub."}
                </p>
                {group.membersCount != null && (
                  <div className="mt-3 inline-block rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[11px] font-semibold text-[var(--wa-text-secondary)]">
                    {group.membersCount} Members Enrolled
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Main layout: Activity/Actions on Left, Calendar/Events on Right */}
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* LEFT COLUMN: Main Activity Area */}
            <div className="space-y-6 wa-sidebar-enter">
              {/* Teacher Quick Actions */}
              {isTeacher && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--wa-text-primary)] mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Link
                      to={`/groups/${groupId}/events`}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 hover:border-[var(--wa-green)] hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--wa-panel-active)] flex items-center justify-center group-hover:bg-[var(--wa-green)] group-hover:text-white transition-colors text-[var(--wa-text-primary)]">
                        <CalendarPlus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--wa-text-primary)]">
                        Add Event
                      </span>
                    </Link>

                    <Link
                      to={`/groups/${groupId}/tasks`}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 hover:border-amber-500 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--wa-panel-active)] flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors text-[var(--wa-text-primary)]">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--wa-text-primary)]">
                        Assign Task
                      </span>
                    </Link>

                    <Link
                      to={`/groups/${groupId}/projects`}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 hover:border-[var(--wa-accent-sky)] hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--wa-panel-active)] flex items-center justify-center group-hover:bg-[var(--wa-accent-sky)] group-hover:text-white transition-colors text-[var(--wa-text-primary)]">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--wa-text-primary)]">
                        New Project
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Class Activity Feed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
                    Recent Assignments
                  </h3>
                  <Link
                    to={`/groups/${groupId}/tasks`}
                    className="text-xs font-semibold text-[var(--wa-green)]"
                  >
                    View all tasks
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/groups/${groupId}/tasks`}
                      className="block rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 hover:bg-[var(--wa-panel-hover)] transition-colors"
                      style={{ borderLeftColor: "var(--wa-accent-sky)" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-[var(--wa-panel-active)] p-1.5 text-[var(--wa-text-secondary)]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
                              {task.title}
                            </div>
                            <div className="mt-1 text-xs text-[var(--wa-text-secondary)]">
                              {task.points ? `${task.points} • ` : ""}
                              Due {formatDateTime(task.dueAt)}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-[var(--wa-panel-active)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)] uppercase">
                          Task
                        </span>
                      </div>
                    </Link>
                  ))}

                  {recentTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-8 text-center text-sm text-[var(--wa-text-secondary)]">
                      No recent tasks or assignments posted yet.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Calendar & Upcoming Events (Smaller) */}
            <aside className="space-y-4 wa-chat-enter">
              {/* Real Calendar (Compact) */}
              <div className="rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-[var(--wa-text-primary)] uppercase tracking-wide">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={goToToday}
                      className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wide font-bold text-[var(--wa-green)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-md hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-md hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1 text-[9px] font-semibold text-[var(--wa-text-secondary)] text-center uppercase tracking-wide">
                  {DAY_HEADERS.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mt-1">
                  {calendarCells.map((day, i) => {
                    if (day === null) {
                      return <div key={`blank-${i}`} className="h-7" />;
                    }

                    const isToday =
                      calYear === today.getFullYear() &&
                      calMonth === today.getMonth() &&
                      day === today.getDate();
                    const marks = markedDays[day];
                    const hasEvent = marks?.events?.length > 0;
                    const hasTask = marks?.tasks?.length > 0;
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() =>
                          setSelectedDay(selectedDay === day ? null : day)
                        }
                        className={`relative h-7 rounded-md flex flex-col items-center justify-center text-[11px] font-medium transition-all ${
                          isSelected
                            ? "bg-[var(--wa-green)] text-white ring-2 ring-[var(--wa-green)]/30"
                            : isToday
                              ? "bg-[var(--wa-green)]/15 text-[var(--wa-green)] font-bold"
                              : "hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-primary)]"
                        }`}
                      >
                        {day}
                        {(hasEvent || hasTask) && (
                          <div className="absolute bottom-0.5 flex gap-0.5">
                            {hasEvent && (
                              <span
                                className={`w-[3px] h-[3px] rounded-full ${isSelected ? "bg-white" : "bg-[var(--wa-accent-sky)]"}`}
                              />
                            )}
                            {hasTask && (
                              <span
                                className={`w-[3px] h-[3px] rounded-full ${isSelected ? "bg-white" : "bg-amber-400"}`}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected day detail */}
                {selectedItems && (
                  <div className="mt-3 pt-3 border-t border-[var(--wa-panel-border)] space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-[var(--wa-text-secondary)]">
                      {MONTH_NAMES[calMonth]} {selectedDay} Details
                    </div>
                    {selectedItems.events.map((ev) => (
                      <div
                        key={ev._id}
                        className="flex items-start gap-2 rounded-md bg-[var(--wa-panel-active)] px-2 py-1.5"
                      >
                        <CalendarDays className="w-3 h-3 text-[var(--wa-accent-sky)] mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[var(--wa-text-primary)] truncate">
                            {ev.title}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedItems.tasks.map((t) => (
                      <div
                        key={t._id}
                        className="flex items-start gap-2 rounded-md bg-[var(--wa-panel-active)] px-2 py-1.5"
                      >
                        <FileText className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-[var(--wa-text-primary)] truncate">
                            {t.title}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedItems.events.length === 0 &&
                      selectedItems.tasks.length === 0 && (
                        <div className="text-[10px] text-[var(--wa-text-secondary)]">
                          Nothing scheduled
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Upcoming Events (Compact List) */}
              <div className="rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] overflow-hidden">
                <div className="border-b border-[var(--wa-panel-border)] p-4 flex items-center justify-between bg-[var(--wa-panel-active)]/30">
                  <h4 className="text-[13px] font-bold text-[var(--wa-text-primary)] uppercase tracking-wide">
                    Upcoming Events
                  </h4>
                  <Link
                    to={`/groups/${groupId}/events`}
                    className="text-[10px] uppercase font-bold text-[var(--wa-green)]"
                  >
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-[var(--wa-panel-border)]">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="p-3 hover:bg-[var(--wa-panel-hover)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`shrink-0 inline-block whitespace-nowrap text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                            (event.type || "").toLowerCase() === "exam"
                              ? "bg-red-500/10 text-red-500 font-extrabold border border-red-500/20"
                              : "bg-[var(--wa-panel-active)] text-[var(--wa-text-secondary)] font-bold"
                          }`}
                        >
                          {event.type || "Event"}
                        </span>
                        <span className="text-[10px] text-[var(--wa-text-secondary)] font-medium">
                          {new Date(event.startAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[var(--wa-text-primary)] truncate">
                        {event.title}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--wa-text-secondary)]">
                        <Clock className="w-3 h-3" />
                        <span className="truncate">
                          {new Date(event.startAt).toLocaleTimeString(
                            undefined,
                            { hour: "numeric", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <div className="p-6 text-center text-xs text-[var(--wa-text-secondary)]">
                      No upcoming events.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupOverviewPage;
