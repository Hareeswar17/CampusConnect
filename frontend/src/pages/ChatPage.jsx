import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, MessageSquare, UserPlus, Users } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import RequestsList from "../components/RequestsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const {
    activeTab,
    selectedUser,
    setActiveTab,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, checkAuth, isCheckingAuth, authError, socket } =
    useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const savedWidth = Number(localStorage.getItem("chatLeftPanelWidth"));
    return Number.isFinite(savedWidth) && savedWidth >= 280 && savedWidth <= 520
      ? savedWidth
      : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const containerRef = useRef(null);

  const getBoundedWidth = useCallback((rawWidth) => {
    const viewportMax = Math.max(window.innerWidth * 0.6, 320);
    const min = 280;
    const max = Math.min(520, viewportMax);
    return Math.min(Math.max(rawWidth, min), max);
  }, []);

  const updateWidthFromClientX = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const nextWidth = getBoundedWidth(clientX - containerRect.left);
      setLeftPanelWidth(nextWidth);
      localStorage.setItem("chatLeftPanelWidth", String(nextWidth));
    },
    [getBoundedWidth],
  );

  const startResizing = useCallback((event) => {
    event.preventDefault();
    setIsResizing(true);
  }, []);

  const startResizingTouch = useCallback((event) => {
    if (event.touches.length !== 1) return;
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event) => {
      updateWidthFromClientX(event.clientX);
    };

    const handleTouchMove = (event) => {
      if (event.touches.length !== 1) return;
      updateWidthFromClientX(event.touches[0].clientX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isResizing, updateWidthFromClientX]);

  useEffect(() => {
    if (!authUser) {
      checkAuth();
    }
  }, [authUser, checkAuth]);

  useEffect(() => {
    if (!authUser || !socket) return;

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [authUser, socket, subscribeToMessages, unsubscribeFromMessages]);

  if (!authUser && isCheckingAuth) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[var(--app-bg)] flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">
          Loading your chat...
        </p>
      </div>
    );
  }

  if (!authUser && authError) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[var(--app-bg)] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            Could not load your profile from backend.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Backend may be down or not configured.
          </p>
          <button
            className="px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-zinc-100 dark:text-black"
            onClick={checkAuth}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      ref={containerRef}
    >
      <BorderAnimatedContainer fullScreen>
        {/* ICON SIDE PANEL */}
        <div
          className={`hidden md:flex border-r border-[var(--clay-border)] bg-[var(--panel-soft)]/90 backdrop-blur-xl flex-col py-3 gap-3 transition-all duration-200 ${
            isSidebarExpanded
              ? "w-[210px] items-stretch px-3"
              : "w-[72px] items-center"
          }`}
          style={{ boxShadow: "var(--clay-shadow-raised)" }}
        >
          <button
            type="button"
            onClick={() => setIsSidebarExpanded((prev) => !prev)}
            className={`rounded-2xl flex items-center transition-all text-slate-700 dark:text-zinc-200 hover:bg-white/70 dark:hover:bg-black/20 ${
              isSidebarExpanded
                ? "w-full h-11 px-3 justify-start gap-2"
                : "w-11 h-11 justify-center"
            }`}
            aria-label={
              isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
            }
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="h-5 w-5" />
            {isSidebarExpanded ? (
              <span className="text-sm font-medium">Menu</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chats")}
            className={`rounded-2xl flex items-center transition-all ${
              isSidebarExpanded
                ? "w-full h-11 px-3 justify-start gap-2"
                : "w-11 h-11 justify-center"
            } ${
              activeTab === "chats"
                ? "text-white"
                : "text-slate-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-black/20"
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
            aria-label="Chats"
            title="Chats"
          >
            <MessageSquare className="h-5 w-5" />
            {isSidebarExpanded ? (
              <span className="text-sm font-medium">Chats</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`rounded-2xl flex items-center transition-all ${
              isSidebarExpanded
                ? "w-full h-11 px-3 justify-start gap-2"
                : "w-11 h-11 justify-center"
            } ${
              activeTab === "contacts"
                ? "text-white"
                : "text-slate-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-black/20"
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
            aria-label="Contacts"
            title="Contacts"
          >
            <Users className="h-5 w-5" />
            {isSidebarExpanded ? (
              <span className="text-sm font-medium">Contacts</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`rounded-2xl flex items-center transition-all ${
              isSidebarExpanded
                ? "w-full h-11 px-3 justify-start gap-2"
                : "w-11 h-11 justify-center"
            } ${
              activeTab === "requests"
                ? "text-white"
                : "text-slate-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-black/20"
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
            aria-label="Requests"
            title="Requests"
          >
            <UserPlus className="h-5 w-5" />
            {isSidebarExpanded ? (
              <span className="text-sm font-medium">Requests</span>
            ) : null}
          </button>

          <div className="mt-auto mb-1">
            <div
              className={`rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 flex items-center overflow-hidden ${
                isSidebarExpanded
                  ? "w-full h-11 px-2 justify-start gap-2"
                  : "w-11 h-11 justify-center"
              }`}
            >
              <UserButton afterSignOutUrl="/login" />
              {isSidebarExpanded ? (
                <span className="text-sm font-medium text-slate-800 dark:text-zinc-100 truncate">
                  {authUser?.fullName || "You"}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* LEFT SIDE */}
        <div
          className="hidden md:flex bg-[var(--clay-surface)] flex-col backdrop-blur-xl"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <ProfileHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? (
              <ChatsList searchQuery={searchQuery} />
            ) : null}
            {activeTab === "contacts" ? (
              <ContactList searchQuery={searchQuery} />
            ) : null}
            {activeTab === "requests" ? (
              <RequestsList searchQuery={searchQuery} />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onMouseDown={startResizing}
          onTouchStart={startResizingTouch}
          className="hidden md:flex w-3 cursor-col-resize items-center justify-center bg-transparent"
          aria-label="Resize chat sidebar"
          title="Drag to resize"
        >
          <span className="h-full w-px bg-[var(--panel-border)] hover:bg-[var(--clay-border)] transition-colors" />
        </button>

        <div className="md:hidden w-80 border-r border-[var(--clay-border)] bg-[var(--clay-surface)] flex flex-col backdrop-blur-xl">
          <ProfileHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? (
              <ChatsList searchQuery={searchQuery} />
            ) : null}
            {activeTab === "contacts" ? (
              <ContactList searchQuery={searchQuery} />
            ) : null}
            {activeTab === "requests" ? (
              <RequestsList searchQuery={searchQuery} />
            ) : null}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 min-w-0 flex bg-[var(--clay-surface)]">
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
