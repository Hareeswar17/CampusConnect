import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader({ onBack }) {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
        onBack?.();
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, onBack]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="h-[59px] px-2 md:px-4 flex items-center justify-between gap-2 shrink-0 bg-[var(--wa-panel-header)] border-l border-[var(--wa-panel-border)]">
      {/* Left */}
      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
        <button
          onClick={() => {
            setSelectedUser(null);
            onBack?.();
          }}
          className="md:hidden w-[36px] h-[36px] flex items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors -ml-1"
          aria-label="Back to chats"
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>

        <div className="relative shrink-0 cursor-pointer">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-[40px] h-[40px] rounded-full object-cover"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-[11px] h-[11px] bg-[var(--wa-green)] rounded-full border-[2px] border-[var(--wa-panel-header)]" />
          )}
        </div>

        <div className="min-w-0 cursor-pointer">
          <h2 className="text-[16px] font-normal text-[var(--wa-text-primary)] truncate leading-tight">
            {selectedUser.fullName}
          </h2>
          <p className={`text-[12.5px] leading-tight mt-[1px] ${
            isOnline ? "text-[var(--wa-green)]" : "text-[var(--wa-text-secondary)]"
          }`}>
            {isOnline ? "online" : "offline"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          className="w-[40px] h-[40px] items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors hidden sm:flex"
          aria-label="Video call"
        >
          <Video className="w-[20px] h-[20px]" />
        </button>
        <button
          type="button"
          className="w-[40px] h-[40px] items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors hidden sm:flex"
          aria-label="Voice call"
        >
          <Phone className="w-[18px] h-[18px]" />
        </button>
        <button
          type="button"
          className="w-[40px] h-[40px] items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors hidden sm:flex"
          aria-label="Search"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <MoreVertical className="w-[20px] h-[20px]" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-[44px] w-[200px] rounded-md py-2 z-50 bg-[var(--wa-dropdown-bg)]"
              style={{ boxShadow: "var(--wa-dropdown-shadow)" }}
            >
              <button
                className="w-full text-left px-6 py-2.5 text-[14.5px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
                onClick={() => {
                  setSelectedUser(null);
                  onBack?.();
                  setMenuOpen(false);
                }}
              >
                Close chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ChatHeader;
