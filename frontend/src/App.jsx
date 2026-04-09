import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-black">
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
