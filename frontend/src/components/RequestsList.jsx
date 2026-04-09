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
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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

function RequestsList() {
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

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    const timeoutId = setTimeout(() => {
      getDiscoverUsers(trimmedQuery);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getDiscoverUsers]);

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Incoming requests
        </h4>
        {incomingRequests.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    className="px-3 py-1.5 text-xs rounded-md bg-brand-500 text-white hover:opacity-90"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(user._id)}
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
        <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Sent requests
        </h4>
        {outgoingRequests.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No pending outgoing requests
          </p>
        ) : (
          outgoingRequests.map((user) => (
            <UserRow
              key={`outgoing-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <span className="px-3 py-1.5 text-xs rounded-md border border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                  Pending
                </span>
              }
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Add new friends
        </h4>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        {searchQuery.trim().length === 0 ? (
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
                  className="px-3 py-1.5 text-xs rounded-md border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30"
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
