import {
  Mail,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

function GroupRosterPage() {
  const { groupId } = useParams();
  const { authUser } = useAuthStore();
  const {
    groupById,
    rosterByGroup,
    fetchGroup,
    fetchRoster,
    searchUsersForGroup,
    addMember,
    removeMember,
  } = useGroupStore();
  const group = groupById[groupId] || {};
  const isTeacher = authUser?.role === "teacher" || (group.teachers && group.teachers.includes(authUser?._id));
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchGroup(groupId);
    fetchRoster(groupId);
    getAllContacts();
    getFriendRequests();
  }, [fetchGroup, fetchRoster, getAllContacts, getFriendRequests, groupId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roster = rosterByGroup[groupId] || { teachers: [], students: [] };
  const teachers = useMemo(() => roster.teachers || [], [roster]);
  const students = useMemo(() => roster.students || [], [roster]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const normalizeId = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return normalizeId(value._id);
    return value.toString ? value.toString() : "";
  };

  const contactIds = new Set(
    allContacts.map((contact) => normalizeId(contact?._id))
  );
  const outgoingIds = new Set(
    outgoingRequests.map((user) => normalizeId(user?._id))
  );
  const incomingIds = new Set(
    incomingRequests.map((user) => normalizeId(user?._id))
  );

  const handleSearchInput = useCallback(
    (value) => {
      setAddQuery(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      if (value.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      searchTimerRef.current = setTimeout(async () => {
        const results = await searchUsersForGroup(groupId, value);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    },
    [groupId, searchUsersForGroup]
  );

  const handleSelectUser = async (user) => {
    setIsAdding(true);
    const result = await addMember(groupId, user._id);
    if (result) {
      setAddQuery("");
      setSearchResults([]);
    }
    setIsAdding(false);
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this group?`)) return;
    await removeMember(groupId, memberId);
  };

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
                {group.title || "Group"}
              </h2>
              <p className="text-sm text-[var(--wa-text-secondary)]">
                {group.subtitle || ""}
              </p>
            </div>
            <span className="rounded-full bg-[var(--wa-panel-active)] px-4 py-1 text-xs font-semibold text-[var(--wa-text-secondary)]">
              {group.membersCount != null
                ? `${group.membersCount} Members`
                : ""}
            </span>
          </div>

          {/* Instructors */}
          <section className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
              Instructors
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {teachers.map((member) => (
                <div
                  key={member._id}
                  className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5 flex items-start justify-between gap-4"
                  style={{ borderLeftColor: accentSky }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full border border-[var(--wa-panel-border)] overflow-hidden bg-[var(--wa-panel-active)]">
                      <img
                        src={member.profilePic || "/avatar.png"}
                        alt={member.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-[var(--wa-text-primary)]">
                          {member.fullName}
                        </div>
                        <span className="rounded-full bg-[var(--wa-panel-active)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--wa-text-secondary)]">
                          Teacher
                        </span>
                      </div>
                      <div className="text-xs text-[var(--wa-text-secondary)]">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    {member._id !== authUser?._id && (
                      <>
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
                      </>
                    )}
                    {member._id === authUser?._id && (
                      <span className="text-xs font-semibold text-[var(--wa-text-secondary)] text-center py-2">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Members */}
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--wa-text-primary)]">
                Members
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[var(--wa-search-bg)] px-3 py-2">
                  <Search className="w-[16px] h-[16px] text-[var(--wa-icon)]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-transparent text-sm text-[var(--wa-text-primary)] outline-none"
                  />
                </div>
                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm((prev) => !prev);
                      setAddQuery("");
                      setSearchResults([]);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {showAddForm ? (
                      <>
                        <X className="w-3.5 h-3.5" /> Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add Member
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Add Member Form with Autocomplete */}
            {isTeacher && showAddForm && (
              <div
                ref={dropdownRef}
                className="relative mt-4 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4"
              >
                <div className="text-xs font-semibold text-[var(--wa-text-secondary)] mb-2">
                  Search for a user by name or email
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2">
                    <Search className="w-4 h-4 text-[var(--wa-icon)] shrink-0" />
                    <input
                      type="text"
                      value={addQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Type a name or email (min 2 characters)..."
                      autoFocus
                      className="flex-1 bg-transparent text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                    {isSearching && (
                      <div className="w-4 h-4 border-2 border-[var(--wa-text-secondary)] border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] shadow-lg max-h-64 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          disabled={isAdding}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--wa-panel-hover)] transition-colors text-left disabled:opacity-50"
                        >
                          <div className="h-9 w-9 rounded-full border border-[var(--wa-panel-border)] overflow-hidden bg-[var(--wa-panel-active)] shrink-0">
                            <img
                              src={user.profilePic || "/avatar.png"}
                              alt={user.fullName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[var(--wa-text-primary)] truncate">
                              {user.fullName}
                            </div>
                            <div className="text-xs text-[var(--wa-text-secondary)] truncate">
                              {user.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)] uppercase">
                              {user.role || "student"}
                            </span>
                            <UserPlus className="w-4 h-4 text-[var(--wa-green)]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {addQuery.trim().length >= 2 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] shadow-lg p-4 text-center text-xs text-[var(--wa-text-secondary)]">
                        No users found matching "{addQuery}"
                      </div>
                    )}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) =>
                (() => {
                  const normalizedId = normalizeId(student._id);
                  const isFriend = contactIds.has(normalizedId);
                  const hasPending =
                    outgoingIds.has(normalizedId) ||
                    incomingIds.has(normalizedId);
                  const canRequest = !isFriend && !hasPending;

                  return (
                    <div
                      key={student._id}
                      className="group/card rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-4 py-3 flex items-center gap-3"
                      style={{ borderLeftColor: accentGray }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-full border border-[var(--wa-panel-border)] overflow-hidden bg-[var(--wa-panel-active)]">
                          <img
                            src={student.profilePic || "/avatar.png"}
                            alt={student.fullName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--wa-text-primary)] truncate">
                            {student.fullName}
                          </div>
                          <div className="text-xs text-[var(--wa-text-secondary)] truncate">
                            {student.email || ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!isFriend ? (
                          <button
                            type="button"
                            disabled={!canRequest}
                            onClick={() => {
                              if (canRequest) sendFriendRequest(student._id);
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
                        {isTeacher && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(student._id, student.fullName)
                            }
                            className="p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
                            title="Remove from group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
              {filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
                  {searchQuery
                    ? "No members match your search."
                    : "No student members yet."}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupRosterPage;
