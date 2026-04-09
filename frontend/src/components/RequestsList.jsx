import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const getDisplayName = (user) => {
  const cleanFullName = user?.fullName?.trim();
  if (cleanFullName && cleanFullName.toLowerCase() !== "user") {
    return cleanFullName;
  }

  const usernameFromEmail = user?.email?.split("@")[0]?.trim();
  if (usernameFromEmail) {
    return usernameFromEmail;
  }

  return "Unknown user";
};

function UserRow({ user, onlineUsers, actions }) {
  const displayName = useMemo(() => getDisplayName(user), [user]);

  return (
    <div
      className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 p-4 backdrop-blur-xl"
      style={{ boxShadow: "var(--clay-shadow-raised)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`avatar ${onlineUsers.includes(user._id) ? "online" : "offline"}`}
          >
            <div className="size-12 rounded-full">
              <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-slate-900 dark:text-slate-100 font-medium truncate">
              {displayName}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      </div>
    </div>
  );
}

function RequestsList({ searchQuery: globalSearchQuery = "" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    isDiscoverLoading,
    incomingRequests,
    outgoingRequests,
    discoverUsers,
    getFriendRequests,
    getDiscoverUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  const effectiveSearchQuery = searchQuery.trim() || globalSearchQuery.trim();

  useEffect(() => {
    const trimmedQuery = effectiveSearchQuery;

    const timeoutId = setTimeout(() => {
      getDiscoverUsers(trimmedQuery);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [effectiveSearchQuery, getDiscoverUsers]);

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Incoming Requests
          </h4>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ({incomingRequests.length})
          </span>
        </div>
        {incomingRequests.length === 0 ? (
          <p className="pl-2 text-sm text-slate-500 dark:text-slate-400">
            No incoming requests
          </p>
        ) : (
          incomingRequests.map((user) => (
            <UserRow
              key={`incoming-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <>
                  <button
                    onClick={() => acceptFriendRequest(user._id)}
                    className="px-3 py-1.5 text-xs rounded-lg text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--neon-accent) 0%, var(--neon-accent-2) 100%)",
                      boxShadow: "var(--neon-glow)",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(user._id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[var(--panel-border)] text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-black/20"
                  >
                    Reject
                  </button>
                </>
              }
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Sent Requests
          </h4>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ({outgoingRequests.length})
          </span>
        </div>
        {outgoingRequests.length === 0 ? (
          <p className="pl-2 text-sm text-slate-500 dark:text-slate-400">
            No pending outgoing requests
          </p>
        ) : (
          outgoingRequests.map((user) => (
            <UserRow
              key={`outgoing-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <span className="px-3 py-1.5 text-xs rounded-lg border border-amber-300/70 text-amber-700 dark:border-amber-500/70 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-900/20">
                  Pending
                </span>
              }
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Add New Friends
          </h4>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ({discoverUsers.length})
          </span>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name"
          className="w-full rounded-md border border-slate-300 bg-white/85 dark:border-[var(--panel-border)] dark:bg-[var(--panel-bg)] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />

        {effectiveSearchQuery.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Type a name to search users.
          </p>
        ) : isDiscoverLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Searching users...
          </p>
        ) : discoverUsers.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No users found
          </p>
        ) : (
          discoverUsers.map((user) => (
            <UserRow
              key={`discover-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <button
                  onClick={() => sendFriendRequest(user._id, searchQuery)}
                  className="px-3 py-1.5 text-xs rounded-md border border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50/80 dark:hover:bg-brand-900/30"
                >
                  Add Friend
                </button>
              }
            />
          ))
        )}
      </section>
    </div>
  );
}

export default RequestsList;
