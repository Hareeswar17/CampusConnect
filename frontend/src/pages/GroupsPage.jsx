import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LogOut, Plus, UserPlus } from "lucide-react";
import AppShell from "../components/AppShell";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";

function GroupsPage() {
  const { authUser } = useAuthStore();
  const { groups, fetchGroups, createGroup, joinGroup, leaveGroup, isLoading } =
    useGroupStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  const isTeacher = authUser?.role === "teacher";
  const userId = authUser?._id;
  const accentPalette = [
    "linear-gradient(140deg, #0f172a 0%, #1e3a8a 50%, #0b1120 100%)",
    "linear-gradient(140deg, #0f172a 0%, #1d4ed8 55%, #1e293b 100%)",
    "linear-gradient(140deg, #1f2937 0%, #0f172a 50%, #111827 100%)",
  ];

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const groupCards = useMemo(() => groups || [], [groups]);
  const myGroups = useMemo(
    () => groupCards.filter((g) => g.isMember),
    [groupCards]
  );
  const availableGroups = useMemo(
    () => groupCards.filter((g) => !g.isMember),
    [groupCards]
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    const created = await createGroup({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
    });
    if (created) {
      setTitle("");
      setSubtitle("");
      setDescription("");
      setShowCreate(false);
    }
  };

  const handleJoin = async (groupId) => {
    setJoiningId(groupId);
    await joinGroup(groupId);
    setJoiningId(null);
  };

  const handleLeave = async (groupId) => {
    if (!window.confirm("Leave this group?")) return;
    setLeavingId(groupId);
    await leaveGroup(groupId);
    setLeavingId(null);
  };

  const renderGroupCard = (group, index, showJoin = false) => {
    const gid = group.id || group._id;
    const isCreator = group.createdBy === userId || group.createdBy?.toString?.() === userId;

    return (
      <div
        key={gid}
        className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] overflow-hidden"
        style={{ borderLeftColor: "var(--wa-accent-sky)" }}
      >
        <div
          className="h-28 relative"
          style={{
            backgroundImage:
              group.cover || accentPalette[index % accentPalette.length],
            backgroundSize: "cover",
          }}
        >
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
            {group.isMember ? "JOINED" : "ACTIVE TERM"}
          </span>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <div className="text-lg font-semibold text-[var(--wa-text-primary)]">
              {group.title}
            </div>
            <div className="text-xs text-[var(--wa-text-secondary)]">
              {group.subtitle || ""}
              {group.membersCount != null
                ? ` · ${group.membersCount} Members`
                : ""}
            </div>
          </div>
          {showJoin ? (
            <button
              type="button"
              onClick={() => handleJoin(gid)}
              disabled={joiningId === gid}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg border-2 border-[var(--wa-green)] px-3 py-2 text-sm font-semibold text-[var(--wa-green)] hover:bg-[var(--wa-green)] hover:text-white transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {joiningId === gid ? "Joining..." : "Join Group"}
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to={`/groups/${gid}`}
                className="inline-flex items-center justify-center gap-2 flex-1 rounded-lg bg-[var(--wa-green)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors"
              >
                Enter Class
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!isCreator && (
                <button
                  type="button"
                  onClick={() => handleLeave(gid)}
                  disabled={leavingId === gid}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--wa-panel-border)] px-3 py-2 text-[var(--wa-text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors disabled:opacity-50"
                  title="Leave group"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell
      title="Groups"
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl space-y-10">
          {/* My Classes */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                  My Classes
                </h2>
                <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                  Access your active study environments and collaborative boards.
                </p>
              </div>
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => setShowCreate((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showCreate ? "Cancel" : "Create Class"}
                </button>
              )}
            </div>

            {isTeacher && showCreate ? (
              <div className="mt-6 rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Advanced Physics"
                      className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                      Subtitle
                    </label>
                    <input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. PHY-301 - Active Term"
                      className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-[var(--wa-text-secondary)]">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description for students"
                      className="mt-2 w-full rounded-lg border border-[var(--wa-panel-border)] bg-transparent px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="rounded-lg bg-[var(--wa-green)] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {myGroups.map((group, index) => renderGroupCard(group, index))}
              {!isLoading && myGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-sm text-[var(--wa-text-secondary)]">
                  You haven't joined any classes yet.{" "}
                  {isTeacher
                    ? "Create the first one."
                    : "Browse available groups below."}
                </div>
              ) : null}
            </div>
          </section>

          {/* Available Groups (for joining) */}
          {availableGroups.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Available Groups
              </h2>
              <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                Discover and join groups created by teachers.
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {availableGroups.map((group, index) =>
                  renderGroupCard(group, index, true)
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default GroupsPage;
