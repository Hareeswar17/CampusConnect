import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOutIcon, MoonIcon, SunIcon, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useState, useRef, useEffect } from "react";

function ProfileHeader() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { authUser, clearAuth } = useAuthStore();
  const { themeMode, toggleThemeMode } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    user?.fullName?.trim() ||
    authUser?.fullName?.trim() ||
    "Chat User";

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div className="h-[59px] px-4 flex items-center justify-between shrink-0 bg-[var(--wa-panel-header)]">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-[40px] h-[40px] rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--wa-green)] rounded-full border-[2px] border-[var(--wa-panel-header)]" />
        </div>
        <span className="text-[15px] font-normal text-[var(--wa-text-primary)] truncate">
          {displayName}
        </span>
      </div>

      {/* Right: Action icons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] active:bg-[var(--wa-panel-active)] transition-colors"
          onClick={toggleThemeMode}
          aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={themeMode === "dark" ? "Light mode" : "Dark mode"}
        >
          {themeMode === "dark" ? (
            <SunIcon className="w-[20px] h-[20px]" />
          ) : (
            <MoonIcon className="w-[20px] h-[20px]" />
          )}
        </button>

        {/* Menu dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] active:bg-[var(--wa-panel-active)] transition-colors"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <MoreVertical className="w-[20px] h-[20px]" />
          </button>

          {menuOpen ? (
            <div
              className="absolute right-0 top-[44px] w-[200px] rounded-md py-2 z-50 bg-[var(--wa-dropdown-bg)]"
              style={{ boxShadow: "var(--wa-dropdown-shadow)" }}
            >
              <button
                className="w-full text-left px-6 py-2.5 text-[14.5px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut({ redirectUrl: "/login" });
                  clearAuth();
                }}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
