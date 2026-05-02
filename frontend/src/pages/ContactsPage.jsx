import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const SAMPLE_DIRECTORY = [
  {
    _id: "sample-1",
    fullName: "Sarah Jenkins",
    role: "mentor",
    major: "Computer Science, Senior",
    profilePic: "/avatar.png",
    isOnline: true,
  },
  {
    _id: "sample-2",
    fullName: "Michael Chen",
    role: "student",
    major: "Applied Mathematics",
    profilePic: "/avatar.png",
    isOnline: false,
  },
  {
    _id: "sample-3",
    fullName: "Elena Rodriguez",
    role: "student",
    major: "Biology, Junior",
    profilePic: "/avatar.png",
    isOnline: true,
  },
  {
    _id: "sample-4",
    fullName: "David Kim",
    role: "mentor",
    major: "Physics Dept.",
    profilePic: "/avatar.png",
    isOnline: true,
  },
  {
    _id: "sample-5",
    fullName: "Alex Morgan",
    role: "student",
    major: "History, Sophomore",
    profilePic: "/avatar.png",
    isOnline: false,
  },
];

function ContactsPage() {
  const navigate = useNavigate();
  const { onlineUsers } = useAuthStore();
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } =
    useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("recent");

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const directoryData = useMemo(() => {
    const baseList = allContacts.length > 0 ? allContacts : SAMPLE_DIRECTORY;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = baseList.filter((item) =>
      (item.fullName || "").toLowerCase().includes(normalizedQuery),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "alpha") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      }
      const aOnline = onlineUsers.includes(a._id) || a.isOnline;
      const bOnline = onlineUsers.includes(b._id) || b.isOnline;
      return Number(bOnline) - Number(aOnline);
    });

    return sorted;
  }, [allContacts, searchQuery, sortMode, onlineUsers]);

  return (
    <AppShell
      title="Directory"
      searchPlaceholder="Search across StudySync..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="flex flex-col gap-6 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Directory
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                Find mentors and classmates to collaborate with.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[var(--wa-panel)] border border-[var(--wa-panel-border)] p-1">
              <button
                type="button"
                onClick={() => setSortMode("recent")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  sortMode === "recent"
                    ? "bg-[var(--wa-panel-active)] text-[var(--wa-text-primary)]"
                    : "text-[var(--wa-text-secondary)]"
                }`}
              >
                Recently Active
              </button>
              <button
                type="button"
                onClick={() => setSortMode("alpha")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  sortMode === "alpha"
                    ? "bg-[var(--wa-panel-active)] text-[var(--wa-text-primary)]"
                    : "text-[var(--wa-text-secondary)]"
                }`}
              >
                Alphabetical
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isUsersLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="h-[180px] rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] animate-pulse"
                  />
                ))
              : directoryData.map((person) => {
                  const isOnline =
                    onlineUsers.includes(person._id) || person.isOnline;
                  const roleLabel =
                    person.role === "mentor" || person.isMentor
                      ? "Mentor"
                      : "Student";
                  const majorLabel = person.major || person.department || "";

                  return (
                    <div
                      key={person._id}
                      className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <img
                            src={person.profilePic || "/avatar.png"}
                            alt={person.fullName}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--wa-panel)] ${
                              isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-[var(--wa-panel-active)] text-[var(--wa-text-secondary)]">
                          {roleLabel}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-[15px] font-semibold text-[var(--wa-text-primary)]">
                          {person.fullName}
                        </h3>
                        <p className="text-xs text-[var(--wa-text-secondary)]">
                          {majorLabel}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-sm font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)]"
                        onClick={() => {
                          if (person._id.startsWith("sample-")) return;
                          setSelectedUser(person);
                          navigate("/chat");
                        }}
                      >
                        <MessageSquare className="w-[16px] h-[16px]" />
                        Message
                      </button>
                    </div>
                  );
                })}
          </div>

          {directoryData.length === 0 && !isUsersLoading ? (
            <div className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-center text-sm text-[var(--wa-text-secondary)]">
              No contacts found. Try a different search term.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

export default ContactsPage;
