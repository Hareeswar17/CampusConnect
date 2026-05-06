import { useEffect, useMemo } from "react";
import AppShell from "../components/AppShell";
import { useChatStore } from "../store/useChatStore";



import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

function RequestsPage() {
  const {
    incomingRequests,
    outgoingRequests,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useChatStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  const { incoming, outgoing } = useMemo(() => {
    const normalizedIncoming = incomingRequests.map((user) => ({
      _id: user._id,
      fullName: user.fullName || "New student",
      detail: user.email || "",
      tags: user.commonClasses || [],
      profilePic: user.profilePic || "/avatar.png",
      timeLabel: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "",
    }));

    const normalizedOutgoing = outgoingRequests.map((user) => ({
      _id: user._id,
      fullName: user.fullName || "New student",
      detail: user.email || "",
      profilePic: user.profilePic || "/avatar.png",
    }));

    return {
      incoming: normalizedIncoming,
      outgoing: normalizedOutgoing,
    };
  }, [incomingRequests, outgoingRequests]);

  return (
    <AppShell
      title="Requests"
      searchPlaceholder="Search friends, groups, or resources..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
                Manage Requests
              </h2>
              <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                Review incoming friend requests and manage those you've sent to
                other students.
              </p>
            </div>
            <Link
              to="/find-friends"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Find Friends
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--wa-text-primary)]">
                Incoming Requests
                <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-0.5 text-xs text-[var(--wa-text-secondary)]">
                  {incoming.length}
                </span>
              </div>

              {incoming.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-center text-sm text-[var(--wa-text-secondary)]">
                  No incoming friend requests.
                </div>
              ) : (
                incoming.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.profilePic || "/avatar.png"}
                          alt={request.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[var(--wa-text-primary)]">
                            {request.fullName}
                          </p>
                          <p className="text-xs text-[var(--wa-text-secondary)]">
                            {request.detail}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--wa-text-secondary)]">
                        {request.timeLabel}
                      </span>
                    </div>

                    {request.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="rounded-lg bg-[var(--wa-green)] py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors disabled:opacity-60"
                        onClick={() => acceptFriendRequest(request._id)}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[var(--wa-panel-border)] py-2 text-sm font-semibold text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors disabled:opacity-60"
                        onClick={() => rejectFriendRequest(request._id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--wa-text-primary)]">
                Sent Requests
                <span className="rounded-full bg-[var(--wa-panel-active)] px-2 py-0.5 text-xs text-[var(--wa-text-secondary)]">
                  {outgoing.length}
                </span>
              </div>

              {outgoing.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6 text-center text-sm text-[var(--wa-text-secondary)]">
                  No sent friend requests.
                </div>
              ) : (
                outgoing.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={request.profilePic || "/avatar.png"}
                        alt={request.fullName}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[var(--wa-text-primary)]">
                          {request.fullName}
                        </p>
                        <p className="text-xs text-[var(--wa-text-secondary)]">
                          {request.detail}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default RequestsPage;
