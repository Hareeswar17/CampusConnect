import { useChatStore } from "../store/useChatStore";
import { MessageSquare, Users, UserPlus } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, incomingRequests } = useChatStore();
  const pendingCount = incomingRequests.length;

  return (
    <div
      className="m-3 flex rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-soft)]/90 p-1.5 backdrop-blur-xl"
      style={{ boxShadow: "var(--clay-shadow-raised)" }}
    >
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
          activeTab === "chats"
            ? "text-white"
            : "text-slate-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-black/20"
        }`}
        style={
          activeTab === "chats"
            ? {
                background:
                  "linear-gradient(135deg, var(--neon-accent) 0%, var(--neon-accent-2) 100%)",
                boxShadow: "var(--neon-glow)",
              }
            : undefined
        }
      >
        <span className="inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Chats
        </span>
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
          activeTab === "contacts"
            ? "text-white"
            : "text-slate-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-black/20"
        }`}
        style={
          activeTab === "contacts"
            ? {
                background:
                  "linear-gradient(135deg, var(--neon-accent) 0%, var(--neon-accent-2) 100%)",
                boxShadow: "var(--neon-glow)",
              }
            : undefined
        }
      >
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4" /> Contacts
        </span>
      </button>

      <button
        onClick={() => setActiveTab("requests")}
        className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
          activeTab === "requests"
            ? "text-white"
            : "text-slate-600 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-black/20"
        }`}
        style={
          activeTab === "requests"
            ? {
                background:
                  "linear-gradient(135deg, var(--neon-accent) 0%, var(--neon-accent-2) 100%)",
                boxShadow: "var(--neon-glow)",
              }
            : undefined
        }
      >
        <span className="inline-flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Requests
          {pendingCount > 0 ? (
            <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs text-white">
              {pendingCount}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
