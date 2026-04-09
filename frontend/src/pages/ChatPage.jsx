import { useEffect } from "react";
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
  const { activeTab, selectedUser } = useChatStore();
  const { authUser, checkAuth, isCheckingAuth, authError } = useAuthStore();

  useEffect(() => {
    if (!authUser) {
      checkAuth();
    }
  }, [authUser, checkAuth]);

  if (!authUser && isCheckingAuth) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-black flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">
          Loading your chat...
        </p>
      </div>
    );
  }

  if (!authUser && authError) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden bg-white dark:bg-black flex items-center justify-center px-6">
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
    <div className="relative w-full h-[100dvh] overflow-hidden">
      <BorderAnimatedContainer fullScreen>
        {/* LEFT SIDE */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col dark:border-zinc-800 dark:bg-zinc-950">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : null}
            {activeTab === "contacts" ? <ContactList /> : null}
            {activeTab === "requests" ? <RequestsList /> : null}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-white dark:bg-black">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
