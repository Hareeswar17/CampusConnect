import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { CheckCheck } from "lucide-react";

function ChatsList({ searchQuery = "" }) {
  const {
    getMyChatPartners,
    getAllContacts,
    chats,
    allContacts,
    isUsersLoading,
    setSelectedUser,
    selectedUser,
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
    <div>
      {mergedList.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        const isSelected = selectedUser?._id === chat._id;
        const hasUnread = (chat.unreadCount || 0) > 0;

        return (
          <div
            key={`${chat.source}-${chat._id}`}
            className={`wa-chat-item flex items-center gap-[13px] px-3 py-[10px] cursor-pointer
              ${isSelected ? "bg-[var(--wa-panel-active)]" : "hover:bg-[var(--wa-panel-hover)]"}
            `}
            onClick={() => setSelectedUser(chat)}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={chat.profilePic || "/avatar.png"}
                alt={chat.fullName}
                className="w-[49px] h-[49px] rounded-full object-cover"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-[13px] h-[13px] bg-[var(--wa-green)] rounded-full border-[2.5px] border-[var(--wa-panel)]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 border-b border-[var(--wa-divider)] pb-[10px] pt-[2px]">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={`text-[16.5px] truncate leading-tight ${
                  hasUnread ? "font-medium text-[var(--wa-text-primary)]" : "font-normal text-[var(--wa-text-primary)]"
                }`}>
                  {chat.fullName}
                </h3>
                <span className={`text-[12px] shrink-0 tabular-nums leading-none ${
                  hasUnread ? "text-[var(--wa-unread-badge)] font-medium" : "text-[var(--wa-text-secondary)]"
                }`}>
                  {chat.lastMessageTime
                    ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-[3px]">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  {chat.source === "chat" && !hasUnread && (
                    <CheckCheck className="w-[16px] h-[16px] text-[var(--wa-read)] shrink-0" strokeWidth={2} />
                  )}
                  <p className={`text-[13.5px] truncate leading-snug ${
                    hasUnread ? "text-[var(--wa-text-primary)] font-medium" : "text-[var(--wa-text-secondary)]"
                  }`}>
                    {chat.lastMessage || (chat.source === "chat" ? "Tap to continue" : "Start a conversation")}
                  </p>
                </div>
                {hasUnread && (
                  <span className="inline-flex min-w-[20px] h-[20px] items-center justify-center rounded-full bg-[var(--wa-unread-badge)] px-[5px] text-[11px] font-bold text-white shrink-0 leading-none">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ChatsList;
