import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ClassShell from "../components/ClassShell";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { formatDateTimeRange } from "../utils/time";

/* ────────── Calendar helpers ────────── */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
function GroupEventsPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const {
    groupById,
    fetchGroup,
    eventsByGroup,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const events = eventsByGroup[groupId] || [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [description, setDescription] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState([]);
  const [coverImage, setCoverImage] = useState("");

  const isTeacher = authUser?.role === "teacher" || group?.isTeacher || (group.teachers && group.teachers.includes(authUser?._id));

  // Calendar State
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchGroup(groupId);
    fetchEvents(groupId);
  }, [fetchGroup, fetchEvents, groupId]);

  /* Build calendar marks */
  const markedDays = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const d = new Date(ev.startAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const key = d.getDate();
        if (!map[key]) map[key] = { events: [] };
        map[key].events.push(ev);
      }
    });
    return map;
  }, [events, calYear, calMonth]);

  const calendarCells = useMemo(
    () => buildCalendarDays(calYear, calMonth),
    [calYear, calMonth]
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

  const resetForm = () => {
    setTitle("");
    setType("");
    setLocation("");
    setStartAt("");
    setEndAt("");
    setDescription("");
    setLinks([]);
    setLinkInput("");
    setCoverImage("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setTitle(event.title || "");
    setType(event.type || "");
    setLocation(event.location || "");
    setStartAt(event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : "");
    setEndAt(event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "");
    setDescription(event.description || "");
    setLinks(event.links || []);
    setLinkInput("");
    setCoverImage(event.coverImage || "");
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    await deleteEvent(groupId, eventId);
  };

  const handleAddLink = () => {
    if (linkInput.trim() && !links.includes(linkInput.trim())) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemoveLink = (indexToRemove) => {
    setLinks(links.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!startAt) {
      toast.error("Start date/time is required");
      return;
    }

    const payload = {
      title: title.trim(),
      type: type.trim(),
      location: location.trim(),
      startAt,
      endAt: endAt || null,
      description: description.trim(),
      links,
      coverImage: coverImage.trim(),
    };

    if (editingId) {
      const updated = await updateEvent(groupId, editingId, payload);
      if (updated) resetForm();
    } else {
      const created = await createEvent(groupId, payload);
      if (created) resetForm();
    }
  };

  // Filter events by selected day if one is picked
  const displayedEvents = useMemo(() => {
    if (selectedDay) {
      return markedDays[selectedDay]?.events || [];
    }
    return events;
  }, [events, markedDays, selectedDay]);

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Groups / {group.title || "Group"} / Events
          </div>
          <div className="mt-2 grid gap-6 lg:grid-cols-[450px_minmax(0,1fr)]">
            
            {/* Left Sidebar: Calendar */}
            <aside className="space-y-4 wa-sidebar-enter">
              <div
                className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5"
                style={{ borderLeftColor: "var(--wa-accent-sky)" }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={goToToday}
                      className="rounded-lg px-2 py-1 text-[10px] font-semibold text-[var(--wa-green)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-lg hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-lg hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1 text-[10px] font-semibold text-[var(--wa-text-secondary)] text-center">
                  {DAY_HEADERS.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mt-1">
                  {calendarCells.map((day, i) => {
                    if (day === null) {
                      return <div key={`blank-${i}`} className="h-14" />;
                    }

                    const isToday =
                      calYear === today.getFullYear() &&
                      calMonth === today.getMonth() &&
                      day === today.getDate();
                    const hasEvent = markedDays[day]?.events?.length > 0;
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        onClick={() =>
                          setSelectedDay(selectedDay === day ? null : day)
                        }
                        className={`relative h-14 rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-[var(--wa-green)] text-white ring-2 ring-[var(--wa-green)]/30"
                            : isToday
                              ? "bg-[var(--wa-green)]/15 text-[var(--wa-green)] font-bold border border-[var(--wa-green)]/30"
                              : "hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-primary)] border border-transparent hover:border-[var(--wa-panel-border)]"
                        }`}
                      >
                        {day}
                        {hasEvent && (
                          <div className="absolute bottom-1.5 flex gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[var(--wa-accent-sky)] shadow-[0_0_4px_var(--wa-accent-sky)]"}`}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedDay && (
                  <div className="mt-4 pt-3 border-t border-[var(--wa-panel-border)] text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(null)}
                      className="text-xs text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Right Main Content */}
            <div className="wa-chat-enter space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                    {selectedDay ? `${MONTH_NAMES[calMonth]} ${selectedDay} Events` : "Upcoming Events"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                    Manage critical milestones, project deadlines, and collaborative sessions.
                  </p>
                </div>
                {isTeacher && !showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap rounded-full bg-[var(--wa-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--wa-green-deep)] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                )}
              </div>

              {/* Event Form */}
              {isTeacher && showForm && (
                <div className="rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[var(--wa-panel-border)] pb-3">
                    <div className="text-sm font-semibold text-[var(--wa-text-primary)] flex items-center gap-2">
                      {editingId ? <Pencil className="w-4 h-4 text-[var(--wa-green)]" /> : <Plus className="w-4 h-4 text-[var(--wa-green)]" />}
                      {editingId ? "Edit Event" : "Create New Event"}
                    </div>
                    <button onClick={resetForm} className="text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Title *</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g. Final Exam Review"
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Starts At *</label>
                      <input
                        type="datetime-local"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Ends At</label>
                      <input
                        type="datetime-local"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Type</label>
                      <input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="Exam / Session / Meeting"
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Location</label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Room 402 or Zoom Link"
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">Description</label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add some details..."
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>

                    {/* NEW: Cover Image */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)] flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
                      </label>
                      <input
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                      />
                    </div>

                    {/* NEW: Links */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-[var(--wa-text-secondary)] flex items-center gap-1 mb-1">
                        <Link2 className="w-3.5 h-3.5" /> Related Links
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                          placeholder="https://docs.google.com/..."
                          className="flex-1 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-[var(--wa-green)] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="rounded-lg bg-[var(--wa-panel-border)] px-4 py-2 text-xs font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)]"
                        >
                          Add
                        </button>
                      </div>
                      {links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {links.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-[var(--wa-panel-active)] px-2 py-1 rounded-md text-xs border border-[var(--wa-panel-border)]">
                              <span className="truncate max-w-[200px] text-[var(--wa-green)]">{link}</span>
                              <button type="button" onClick={() => handleRemoveLink(idx)} className="text-[var(--wa-text-secondary)] hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--wa-panel-border)]">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-lg bg-[var(--wa-green)] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--wa-green)]/20 hover:bg-[var(--wa-green-deep)] transition-colors"
                    >
                      {editingId ? "Update Event" : "Save Event"}
                    </button>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-4">
                {displayedEvents.map((event, index) => (
                  <div
                    key={event._id}
                    className="group/card rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] overflow-hidden wa-chat-enter hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Cover Image Header */}
                    {event.coverImage && (
                      <div className="h-32 w-full relative overflow-hidden">
                        <img 
                          src={event.coverImage} 
                          alt="Cover" 
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--wa-panel)] to-transparent" />
                      </div>
                    )}

                    <div className="p-5 relative">
                      <div className="flex items-start justify-between">
                        <span className={`shrink-0 inline-block whitespace-nowrap rounded-full px-3 py-1 text-[10px] shadow-sm ${
                          (event.type || "").toLowerCase() === "exam"
                            ? "bg-red-500/10 text-red-500 font-extrabold border border-red-500/30"
                            : "bg-[var(--wa-panel-active)] text-[var(--wa-accent-sky)] font-semibold border border-[var(--wa-accent-sky)]/20"
                        }`}>
                          {(event.type || "Event").toUpperCase()}
                        </span>
                        {isTeacher && (
                          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-[var(--wa-panel)] rounded-lg shadow-sm border border-[var(--wa-panel-border)] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(event)}
                              className="p-1.5 rounded-md hover:bg-[var(--wa-panel-hover)] text-[var(--wa-text-secondary)] transition-colors"
                              title="Edit event"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(event._id)}
                              className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xl font-bold text-[var(--wa-text-primary)]">
                        {event.title}
                      </div>
                      
                      {event.description && (
                        <p className="mt-2 text-sm text-[var(--wa-text-secondary)] line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)] bg-[var(--wa-panel-active)] px-3 py-2 rounded-lg border border-[var(--wa-panel-border)] shadow-sm hover:border-[var(--wa-green)] transition-colors">
                          <Clock className="w-4 h-4 text-[var(--wa-green)]" />
                          <span className="font-medium">{formatDateTimeRange(event.startAt, event.endAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--wa-text-secondary)] bg-[var(--wa-panel-active)] px-3 py-2 rounded-lg border border-[var(--wa-panel-border)] shadow-sm hover:border-amber-500 transition-colors">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="font-medium truncate max-w-[200px]">{event.location || "Location TBD"}</span>
                        </div>
                      </div>

                      {/* Links Section */}
                      {event.links && event.links.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--wa-panel-border)]">
                          <div className="text-[10px] font-semibold text-[var(--wa-text-secondary)] uppercase tracking-wider mb-2">Related Links</div>
                          <div className="flex flex-wrap gap-2">
                            {event.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--wa-search-bg)] border border-[var(--wa-panel-border)] rounded-lg text-xs text-[var(--wa-text-primary)] hover:border-[var(--wa-green)] hover:text-[var(--wa-green)] transition-colors group/link"
                              >
                                <Link2 className="w-3.5 h-3.5 text-[var(--wa-text-secondary)] group-hover/link:text-[var(--wa-green)]" />
                                <span className="truncate max-w-[200px]">
                                  {new URL(link).hostname.replace('www.', '')}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {displayedEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-10 text-center animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-[var(--wa-panel-active)] flex items-center justify-center mx-auto mb-3">
                      <CalendarDays className="w-6 h-6 text-[var(--wa-text-secondary)]" />
                    </div>
                    <div className="text-[var(--wa-text-primary)] font-medium">No events found</div>
                    <div className="text-sm text-[var(--wa-text-secondary)] mt-1">
                      {selectedDay ? `Nothing scheduled for ${MONTH_NAMES[calMonth]} ${selectedDay}.` : "No upcoming events yet."}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupEventsPage;
