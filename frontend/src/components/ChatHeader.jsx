import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="h-[72px] px-4 border-b border-[var(--clay-border)] bg-transparent flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="size-11 rounded-full ring-1 ring-[var(--panel-border)] overflow-hidden">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-sm md:text-base leading-tight truncate">
            {selectedUser.fullName}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs truncate">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="rounded-xl p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-black/25 dark:hover:text-zinc-200 transition-colors duration-150"
      >
        <XIcon className="w-5 h-5 cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;
