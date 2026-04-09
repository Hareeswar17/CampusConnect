import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList({ searchQuery = "" }) {
  const {
    getMyChatPartners,
    getAllContacts,
    chats,
    allContacts,
    isUsersLoading,
    setSelectedUser,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
    getAllContacts();
  }, [getMyChatPartners, getAllContacts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const mergedList = [
    ...chats.map((chat) => ({
      ...chat,
      source: "chat",
      unreadCount: chat.unreadCount || 0,
    })),
    ...allContacts
      .filter((contact) => !chats.some((chat) => chat._id === contact._id))
      .map((contact) => ({
        ...contact,
        source: "contact",
        unreadCount: 0,
      })),
  ].filter((item) => {
    if (!normalizedQuery) return true;
    return (item.fullName || "").toLowerCase().includes(normalizedQuery);
  });

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (mergedList.length === 0) return <NoChatsFound />;

  return (
    <>
      {mergedList.map((chat) => (
        <div
          key={`${chat.source}-${chat._id}`}
          className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 p-4 cursor-pointer hover:bg-[var(--panel-soft)] transition-all duration-200 backdrop-blur-xl"
          style={{ boxShadow: "var(--clay-shadow-raised)" }}
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName}
                  />
                </div>
              </div>
              <h4 className="text-slate-900 dark:text-slate-100 font-medium truncate">
                {chat.fullName}
              </h4>
            </div>

            {(chat.unreadCount || 0) > 0 ? (
              <span className="min-w-6 h-6 px-2 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
