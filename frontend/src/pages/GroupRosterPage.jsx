import { Mail, MessageSquare, Search, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";
import { useChatStore } from "../store/useChatStore";

const STAFF = [
  {
    id: "t1",
    name: "Dr. Alan Turing",
    role: "Lead Instructor",
    roleTag: "Lead Instructor",
    profilePic: "/avatar.png",
    email: "alan.turing@university.edu",
    office: "Office Hours: Mon/Wed 2:00 PM - 4:00 PM (Room 404)",
  },
  {
    id: "t2",
    name: "Grace Hopper",
    role: "Teaching Assistant",
    roleTag: "Teaching Assistant",
    profilePic: "/avatar.png",
    email: "grace.hopper@university.edu",
    office: "Virtual Hours: Tue 6:00 PM - 8:00 PM",
  },
];

const STUDENTS = [
  {
    id: "s1",
    name: "Marcus Johnson",
    major: "Computer Science",
    profilePic: "/avatar.png",
  },
  {
    id: "s2",
    name: "Sarah Williams",
    major: "Mathematics",
    profilePic: "/avatar.png",
  },
  {
    id: "s3",
    name: "David Chen",
    major: "Data Science",
    profilePic: "/avatar.png",
  },
  {
    id: "s4",
    name: "Emily Davis",
    major: "Computer Engineering",
    profilePic: "/avatar.png",
  },
  {
    id: "s5",
    name: "James Lee",
    major: "Information Systems",
    profilePic: "/avatar.png",
  },
  {
    id: "s6",
    name: "Michael Brown",
    major: "Computer Science",
    profilePic: "/avatar.png",
  },
];

function GroupRosterPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);
  const accentSky = "var(--wa-accent-sky)";
  const accentGray = "var(--wa-accent-gray)";
  const {
    allContacts,
    outgoingRequests,
    incomingRequests,
    getAllContacts,
    getFriendRequests,
    sendFriendRequest,
  } = useChatStore();

  useEffect(() => {
    getAllContacts();
    getFriendRequests();
  }, [getAllContacts, getFriendRequests]);

  const normalizeId = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return normalizeId(value._id);
    return value.toString ? value.toString() : "";
  };

  const contactIds = new Set(
    allContacts.map((contact) => normalizeId(contact?._id)),
  );
  const outgoingIds = new Set(
    outgoingRequests.map((user) => normalizeId(user?._id)),
  );
  const incomingIds = new Set(
    incomingRequests.map((user) => normalizeId(user?._id)),
  );

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                {group.title}
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                {group.subtitle}
              </p>
            </div>
            <span className="rounded-full bg-[var(--wa-panel-active)] px-4 py-1 text-xs font-semibold text-[var(--wa-text-secondary)]">
              {group.members}
            </span>
          </div>

          <section className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
              Instructors & TAs
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {STAFF.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 flex items-start justify-between gap-4"
                  style={{ borderLeftColor: accentSky }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full border border-[var(--wa-panel-border)] overflow-hidden bg-[var(--wa-panel-active)]">
                      <img
                        src={member.profilePic}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-[var(--wa-text-primary)]">
                          {member.name}
                        </div>
                        <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--wa-text-secondary)]">
                          {member.roleTag}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--wa-text-secondary)]">
                        {member.email}
                      </div>
                      <div className="mt-3 rounded-lg bg-[var(--wa-panel-active)] px-3 py-2 text-xs text-[var(--wa-text-secondary)]">
                        {member.office}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--wa-green)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <MessageSquare className="w-[14px] h-[14px]" />
                      Message
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-xs font-semibold text-[var(--wa-text-primary)]"
                    >
                      <Mail className="w-[14px] h-[14px]" />
                      Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
                Members
              </h3>
              <div className="flex items-center gap-2 rounded-full bg-[var(--wa-search-bg)] px-3 py-2">
                <Search className="w-[16px] h-[16px] text-[var(--wa-icon)]" />
                <input
                  placeholder="Search by name or major..."
                  className="bg-transparent text-sm text-[var(--wa-text-primary)] outline-none"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STUDENTS.map((student) =>
                (() => {
                  const normalizedId = normalizeId(student.id);
                  const isFriend = contactIds.has(normalizedId);
                  const hasPending =
                    outgoingIds.has(normalizedId) ||
                    incomingIds.has(normalizedId);
                  const canRequest = !isFriend && !hasPending;

                  return (
                    <div
                      key={student.id}
                      className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-4 py-3 flex items-center gap-3"
                      style={{ borderLeftColor: accentGray }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-full border border-[var(--wa-panel-border)] overflow-hidden bg-[var(--wa-panel-active)]">
                          <img
                            src={student.profilePic}
                            alt={student.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--wa-text-primary)] truncate">
                            {student.name}
                          </div>
                          <div className="text-xs text-[var(--wa-text-secondary)] truncate">
                            {student.major}
                          </div>
                        </div>
                      </div>
                      {!isFriend ? (
                        <button
                          type="button"
                          disabled={!canRequest}
                          onClick={() => {
                            if (canRequest) sendFriendRequest(student.id);
                          }}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            canRequest
                              ? "border border-[var(--wa-green)] text-[var(--wa-green)] hover:bg-[var(--wa-green)] hover:text-white"
                              : "border border-[var(--wa-panel-border)] text-[var(--wa-text-secondary)] cursor-not-allowed"
                          }`}
                        >
                          <UserPlus className="w-[14px] h-[14px]" />
                          {hasPending ? "Requested" : "Add"}
                        </button>
                      ) : (
                        <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--wa-text-secondary)]">
                          Friend
                        </span>
                      )}
                    </div>
                  );
                })(),
              )}
            </div>
          </section>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupRosterPage;
