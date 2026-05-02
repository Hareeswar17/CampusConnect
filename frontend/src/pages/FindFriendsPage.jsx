import { Search, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useChatStore } from "../store/useChatStore";

function FindFriendsPage() {
  const [query, setQuery] = useState("");
  const { discoverUsers, getDiscoverUsers, sendFriendRequest, isDiscoverLoading } = useChatStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      getDiscoverUsers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, getDiscoverUsers]);

  return (
    <AppShell title="Find Friends">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4">
            <div className="flex items-center gap-3">
              <Search className="w-[18px] h-[18px] text-[var(--wa-icon)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students or mentors"
                className="w-full bg-transparent text-sm text-[var(--wa-text-primary)] outline-none placeholder:text-[var(--wa-text-secondary)]"
              />
            </div>
          </div>

          <div className="mt-6">
            {isDiscoverLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--wa-text-secondary)]" />
              </div>
            ) : discoverUsers.length === 0 ? (
              <div className="rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-center">
                <h3 className="text-base font-semibold text-[var(--wa-text-primary)]">
                  {query.trim() ? "No matches found" : "Search to find friends"}
                </h3>
                <p className="mt-2 text-sm text-[var(--wa-text-secondary)]">
                  {query.trim() ? "Try searching for a different name or email." : "Type a name or email to find people."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {discoverUsers.map((user) => (
                  <div key={user._id} className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 flex flex-col items-center text-center">
                    <img 
                      src={user.profilePic || "/avatar.png"} 
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full object-cover mb-3"
                    />
                    <h4 className="text-sm font-semibold text-[var(--wa-text-primary)] truncate w-full">
                      {user.fullName}
                    </h4>
                    <p className="text-xs text-[var(--wa-text-secondary)] truncate w-full mb-4">
                      {user.email || "Student"}
                    </p>
                    
                    <button 
                      onClick={() => sendFriendRequest(user._id, query)}
                      className="w-full rounded-lg bg-[var(--wa-green)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors flex justify-center items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default FindFriendsPage;
