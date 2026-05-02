import { Navigate, Route, Routes } from "react-router-dom";
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
import RoleSelectionModal from "./components/RoleSelectionModal";
import LandingPage from "./pages/LandingPage";

import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { setAuthTokenGetter } from "./lib/axios";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { themeMode } = useThemeStore();
  const {
    authUser,
    isCheckingAuth,
    setClerkTokenGetter,
    connectSocket,
    disconnectSocket,
    clearAuth,
    checkAuth,
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

    if (!authUser) {
      checkAuth();
    } else {
      connectSocket();
    }
  }, [
    isLoaded,
    isSignedIn,
    authUser,
    checkAuth,
    connectSocket,
    disconnectSocket,
    clearAuth,
  ]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  // Show role selection modal if user is authenticated but hasn't chosen a role yet
  const showRoleModal = isSignedIn && authUser && !authUser.roleSelected;

  return (
    <>
      {showRoleModal && <RoleSelectionModal />}

      {/* Global Background Orbs for Dark Mode */}
      {themeMode === "dark" && (
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/chat" /> : <LandingPage />}
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
        {/* Fallback redirects for bare /groups/* paths → redirect to /groups */}
        <Route
          path="/groups/doubts"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/doubts/new"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/resources"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/events"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/tasks"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/projects"
          element={<Navigate to="/groups" replace />}
        />
        <Route
          path="/groups/roster"
          element={<Navigate to="/groups" replace />}
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
