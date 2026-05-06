import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { SearchIcon } from "lucide-react";

const getDisplayName = (user) => {
  const cleanFullName = user?.fullName?.trim();
  if (cleanFullName && cleanFullName.toLowerCase() !== "user") {
    return cleanFullName;
  }
  const usernameFromEmail = user?.email?.split("@")[0]?.trim();
  if (usernameFromEmail) return usernameFromEmail;
  return "Unknown user";
};

function UserRow({ user, onlineUsers, actions }) {
  const displayName = useMemo(() => getDisplayName(user), [user]);

  return (
    <div className="wa-chat-item flex items-center gap-[13px] px-3 py-[10px] hover:bg-[var(--wa-panel-hover)]">
      <div className="relative shrink-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.fullName}
          className="w-[49px] h-[49px] rounded-full object-cover"
        />
        {onlineUsers.includes(user._id) && (
          <span className="absolute bottom-0 right-0 w-[13px] h-[13px] bg-[var(--wa-green)] rounded-full border-[2.5px] border-[var(--wa-panel)]" />
        )}
      </div>

      <div className="flex-1 min-w-0 border-b border-[var(--wa-divider)] pb-[10px] pt-[2px]">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[16px] text-[var(--wa-text-primary)] truncate leading-tight">
            {displayName}
          </h4>
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        </div>
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

  const SectionHeader = ({ title, count }) => (
    <div className="px-4 py-[10px] sticky top-0 bg-[var(--wa-panel)] z-10 border-b border-[var(--wa-divider)]">
      <p className="text-[12.5px] text-[var(--wa-green)] font-medium uppercase tracking-wider">
        {title}
        <span className="ml-1 text-[var(--wa-text-secondary)] font-normal">({count})</span>
      </p>
    </div>
  );

  return (
    <div>
      {/* Incoming */}
      <section>
        <SectionHeader title="Incoming Requests" count={incomingRequests.length} />
        {incomingRequests.length === 0 ? (
          <p className="px-4 py-4 text-[13.5px] text-[var(--wa-text-secondary)]">
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
                    className="px-3.5 py-[6px] text-[12.5px] font-medium rounded-md bg-[var(--wa-green)] text-white hover:bg-[var(--wa-green-deep)] active:scale-[0.97] transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(user._id)}
                    className="px-3.5 py-[6px] text-[12.5px] font-medium rounded-md border border-[var(--wa-panel-border)] text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] active:bg-[var(--wa-panel-active)] transition-all"
                  >
                    Reject
                  </button>
                </>
              }
            />
          ))
        )}
      </section>

      {/* Outgoing */}
      <section>
        <SectionHeader title="Sent Requests" count={outgoingRequests.length} />
        {outgoingRequests.length === 0 ? (
          <p className="px-4 py-4 text-[13.5px] text-[var(--wa-text-secondary)]">
            No pending outgoing requests
          </p>
        ) : (
          outgoingRequests.map((user) => (
            <UserRow
              key={`outgoing-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <span className="px-3.5 py-[6px] text-[12.5px] font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50">
                  Pending
                </span>
              }
            />
          ))
        )}
      </section>

      {/* Discover */}
      <section>
        <SectionHeader title="Add New Friends" count={discoverUsers.length} />
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-3 bg-[var(--wa-search-bg)] rounded-lg px-3 py-[7px]">
            <SearchIcon className="w-[16px] h-[16px] text-[var(--wa-icon)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name"
              className="w-full bg-transparent outline-none text-[13.5px] text-[var(--wa-text-primary)] placeholder:text-[var(--wa-text-secondary)]"
            />
          </div>
        </div>

        {effectiveSearchQuery.length === 0 ? (
          <p className="px-4 py-4 text-[13.5px] text-[var(--wa-text-secondary)]">Type a name to search users.</p>
        ) : isDiscoverLoading ? (
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-5 h-5 border-2 border-[var(--wa-green)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13.5px] text-[var(--wa-text-secondary)]">Searching…</span>
          </div>
        ) : discoverUsers.length === 0 ? (
          <p className="px-4 py-4 text-[13.5px] text-[var(--wa-text-secondary)]">No users found</p>
        ) : (
          discoverUsers.map((user) => (
            <UserRow
              key={`discover-${user._id}`}
              user={user}
              onlineUsers={onlineUsers}
              actions={
                <button
                  onClick={() => sendFriendRequest(user._id, searchQuery)}
                  className="px-3.5 py-[6px] text-[12.5px] font-medium rounded-md border border-[var(--wa-green)] text-[var(--wa-green)] hover:bg-[var(--wa-green)] hover:text-white active:scale-[0.97] transition-all"
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
