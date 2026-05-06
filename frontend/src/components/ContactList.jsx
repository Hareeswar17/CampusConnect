import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { UsersIcon } from "lucide-react";

function ContactList({ searchQuery = "" }) {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, selectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredContacts = allContacts.filter((contact) => {
    if (!normalizedQuery) return true;
    return (contact.fullName || "").toLowerCase().includes(normalizedQuery);
  });

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (filteredContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-[72px] h-[72px] rounded-full bg-[var(--wa-search-bg)] flex items-center justify-center mb-5">
          <UsersIcon className="w-9 h-9 text-[var(--wa-green)] opacity-70" />
        </div>
        <h4 className="text-[var(--wa-text-primary)] text-[16px] font-medium mb-1.5">
          No contacts yet
        </h4>
        <p className="text-[var(--wa-text-secondary)] text-[13.5px] leading-relaxed max-w-[250px]">
          Add friends from the Requests tab. Accepted friends will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-[10px]">
        <p className="text-[12.5px] text-[var(--wa-green)] font-medium uppercase tracking-wider">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""}
        </p>
      </div>
      {filteredContacts.map((contact) => {
        const isOnline = onlineUsers.includes(contact._id);
        const isSelected = selectedUser?._id === contact._id;

        return (
          <div
            key={contact._id}
            className={`wa-chat-item flex items-center gap-[13px] px-3 py-[10px] cursor-pointer
              ${isSelected ? "bg-[var(--wa-panel-active)]" : "hover:bg-[var(--wa-panel-hover)]"}
            `}
            onClick={() => setSelectedUser(contact)}
          >
            <div className="relative shrink-0">
              <img
                src={contact.profilePic || "/avatar.png"}
                alt={contact.fullName}
                className="w-[49px] h-[49px] rounded-full object-cover"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-[13px] h-[13px] bg-[var(--wa-green)] rounded-full border-[2.5px] border-[var(--wa-panel)]" />
              )}
            </div>

            <div className="flex-1 min-w-0 border-b border-[var(--wa-divider)] pb-[10px] pt-[2px]">
              <h3 className="text-[16.5px] font-normal text-[var(--wa-text-primary)] truncate leading-tight">
                {contact.fullName}
              </h3>
              <p className={`text-[13px] mt-[2px] truncate ${
                isOnline ? "text-[var(--wa-green)]" : "text-[var(--wa-text-secondary)]"
              }`}>
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ContactList;
