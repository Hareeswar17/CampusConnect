import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import AppShell from "../components/AppShell";
import SearchBar from "../components/SearchBar";
import ChatsList from "../components/ChatsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();
  const { authUser, checkAuth, isCheckingAuth, authError, socket } =
    useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (selectedUser) setShowChat(true);
  }, [selectedUser]);

  useEffect(() => {
    if (!authUser) checkAuth();
  }, [authUser, checkAuth]);

  useEffect(() => {
    if (!authUser || !socket) return;
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [authUser, socket, subscribeToMessages, unsubscribeFromMessages]);

  // ── Loading ──
  if (!authUser && isCheckingAuth) {
    return (
      <div
        className="w-full h-[100dvh] flex items-center justify-center"
        style={{ background: "var(--wa-page-bg)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-[var(--wa-green)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--wa-text-secondary)] text-sm font-medium tracking-wide">
            Loading your chats…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (!authUser && authError) {
    return (
      <div
        className="w-full h-[100dvh] flex items-center justify-center px-6"
        style={{ background: "var(--wa-page-bg)" }}
      >
        <div className="max-w-sm text-center space-y-4 bg-[var(--wa-panel)] p-8 rounded-xl shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-[var(--wa-text-primary)] font-semibold">
            Connection failed
          </p>
          <p className="text-sm text-[var(--wa-text-secondary)] leading-relaxed">
            Could not reach the backend server. Please check your connection and
            try again.
          </p>
          <button
            className="w-full py-2.5 rounded-lg bg-[var(--wa-green)] text-white font-medium hover:bg-[var(--wa-green-deep)] active:scale-[0.98] transition-all"
            onClick={checkAuth}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const handleBackToSidebar = () => setShowChat(false);

  return (
    <AppShell title="Chats">
      <div className="flex h-full">
        {/* ═══ LEFT PANE — Lists ═══ */}
        <div
          className={`
            flex flex-col h-full border-r border-[var(--wa-panel-border)] bg-[var(--wa-panel)]
            w-full md:w-[30%] lg:w-[35%] md:min-w-[340px] md:max-w-[520px]
            ${showChat ? "hidden md:flex" : "flex wa-sidebar-enter"}
          `}
        >
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ChatsList searchQuery={searchQuery} />
          </div>
        </div>

        {/* ═══ RIGHT PANE — Active Chat ═══ */}
        <div
          className={`
            flex-1 flex flex-col min-w-0 h-full bg-[var(--wa-panel)]
            ${showChat ? "flex wa-chat-enter" : "hidden md:flex"}
          `}
        >
          {selectedUser ? (
            <ChatContainer onBack={handleBackToSidebar} />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </AppShell>
  );
}
export default ChatPage;
