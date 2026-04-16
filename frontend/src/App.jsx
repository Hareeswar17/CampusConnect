import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { setAuthTokenGetter } from "./lib/axios";
import { useAuthStore } from "./store/useAuthStore";

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
        <Route path="/" element={<Navigate to={"/login"} />} />
        <Route
          path="/chat"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <ChatPage />}
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
