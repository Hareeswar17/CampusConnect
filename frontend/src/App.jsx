import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { themeMode } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const isDark = themeMode === "dark";
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [themeMode]);

  if (!isLoaded) return <PageLoader />;

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-200">
      <Routes>
        <Route path="/" element={<Navigate to={"/login"} />} />
        <Route
          path="/chat"
          element={!isSignedIn ? <Navigate to={"/login"} /> : <ChatPage />}
        />
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
      </Routes>

      <Toaster />
    </div>
  );
}
export default App;
