import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import GroupsPage from "./pages/GroupsPage";
import FindFriendsPage from "./pages/FindFriendsPage";
import ContactsPage from "./pages/ContactsPage";
import RequestsPage from "./pages/RequestsPage";
import GroupChatPage from "./pages/GroupChatPage";
import GroupDoubtsPage from "./pages/GroupDoubtsPage";
import GroupAskDoubtPage from "./pages/GroupAskDoubtPage";
import GroupClarifyDoubtPage from "./pages/GroupClarifyDoubtPage";
import GroupDoubtDetailPage from "./pages/GroupDoubtDetailPage";
import GroupResourcesPage from "./pages/GroupResourcesPage";
import GroupRosterPage from "./pages/GroupRosterPage";
import GroupEventsPage from "./pages/GroupEventsPage";
import GroupTasksPage from "./pages/GroupTasksPage";
import GroupProjectsPage from "./pages/GroupProjectsPage";
import GroupOverviewPage from "./pages/GroupOverviewPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { setAuthTokenGetter } from "./lib/axios";
import { useAuthStore } from "./store/useAuthStore";
import { GROUPS } from "./data/groups";

const DEFAULT_GROUP_ID = GROUPS[0]?.id || "physics";

function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { themeMode } = useThemeStore();
  const {
    authUser,
    setClerkTokenGetter,
    connectSocket,
    disconnectSocket,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    const root = document.documentElement;
    const isDark = themeMode === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [themeMode]);

  useEffect(() => {
    const tokenGetter = async () => getToken?.();
    setAuthTokenGetter(tokenGetter);
    setClerkTokenGetter(tokenGetter);
  }, [getToken, setClerkTokenGetter]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      clearAuth();
      disconnectSocket();
      return;
    }

    if (authUser) {
      connectSocket();
    }
  }, [
    isLoaded,
    isSignedIn,
    authUser,
    connectSocket,
    disconnectSocket,
    clearAuth,
  ]);

  if (!isLoaded) return <PageLoader />;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isSignedIn ? "/chat" : "/login"} />}
        />
        <Route
          path="/chat"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <ChatPage />}
        />
        <Route
          path="/groups"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <GroupsPage />}
        />
        <Route
          path="/groups/:groupId"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupOverviewPage />
          }
        />
        <Route
          path="/groups/:groupId/chat"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <GroupChatPage />}
        />
        <Route
          path="/groups/:groupId/doubts"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupDoubtsPage />
          }
        />
        <Route
          path="/groups/:groupId/doubts/new"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupAskDoubtPage />
          }
        />
        <Route
          path="/groups/:groupId/doubts/:doubtId"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupDoubtDetailPage />
          }
        />
        <Route
          path="/groups/:groupId/doubts/:doubtId/clarify"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupClarifyDoubtPage />
          }
        />
        <Route
          path="/groups/:groupId/resources"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupResourcesPage />
          }
        />
        <Route
          path="/groups/:groupId/events"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupEventsPage />
          }
        />
        <Route
          path="/groups/:groupId/tasks"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupTasksPage />
          }
        />
        <Route
          path="/groups/:groupId/projects"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupProjectsPage />
          }
        />
        <Route
          path="/groups/:groupId/roster"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <GroupRosterPage />
          }
        />
        <Route
          path="/groups/doubts"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/doubts`} replace />
          }
        />
        <Route
          path="/groups/doubts/new"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/doubts/new`} replace />
          }
        />
        <Route
          path="/groups/resources"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/resources`} replace />
          }
        />
        <Route
          path="/groups/events"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/events`} replace />
          }
        />
        <Route
          path="/groups/tasks"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/tasks`} replace />
          }
        />
        <Route
          path="/groups/projects"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/projects`} replace />
          }
        />
        <Route
          path="/groups/roster"
          element={
            <Navigate to={`/groups/${DEFAULT_GROUP_ID}/roster`} replace />
          }
        />
        <Route
          path="/find-friends"
          element={
            !isSignedIn ? <Navigate to={"/login"} /> : <FindFriendsPage />
          }
        />
        <Route
          path="/contacts"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <ContactsPage />}
        />
        <Route
          path="/requests"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <RequestsPage />}
        />
        <Route
          path="/settings"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <SettingsPage />}
        />
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--wa-panel)",
            color: "var(--wa-text-primary)",
            border: "1px solid var(--wa-panel-border)",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "var(--wa-dropdown-shadow)",
          },
        }}
      />
    </>
  );
}
export default App;
