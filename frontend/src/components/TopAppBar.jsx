import {
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useEffect, useRef, useState } from "react";

function TopAppBar({
  searchPlaceholder = "Search friends, groups, or resources...",
  searchValue,
  onSearchChange,
}) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { authUser, clearAuth } = useAuthStore();
  const { themeMode, toggleThemeMode } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const resolvedSearchValue = searchValue ?? searchQuery;
  const handleSearchChange = (event) => {
    if (onSearchChange) {
      onSearchChange(event.target.value);
      return;
    }
    setSearchQuery(event.target.value);
  };
  const menuRef = useRef(null);

  const displayName =
    user?.fullName?.trim() || authUser?.fullName?.trim() || "Student";
  const avatarUrl = user?.imageUrl || authUser?.profilePic || "/avatar.png";

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--wa-panel-border)] bg-[var(--wa-panel)]">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2 rounded-full bg-[var(--wa-search-bg)] px-4 py-2 w-full max-w-[520px]">
            <Search className="w-[16px] h-[16px] text-[var(--wa-icon)]" />
            <input
              value={resolvedSearchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-[var(--wa-text-primary)] outline-none placeholder:text-[var(--wa-text-secondary)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          <Link
            to="/settings"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full pl-1 pr-2 py-1 hover:bg-[var(--wa-panel-hover)] transition-colors"
              aria-label="User menu"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <ChevronDown className="w-[14px] h-[14px] text-[var(--wa-icon)]" />
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 mt-2 w-[210px] rounded-md py-2 z-50 bg-[var(--wa-dropdown-bg)]"
                style={{ boxShadow: "var(--wa-dropdown-shadow)" }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-2.5 text-[14px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleThemeMode();
                  }}
                >
                  <span>
                    {themeMode === "dark"
                      ? "Switch to light"
                      : "Switch to dark"}
                  </span>
                  {themeMode === "dark" ? (
                    <Sun className="w-[16px] h-[16px]" />
                  ) : (
                    <Moon className="w-[16px] h-[16px]" />
                  )}
                </button>
                <button
                  className="w-full text-left px-5 py-2.5 text-[14px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut({ redirectUrl: "/login" });
                    clearAuth();
                  }}
                >
                  Log out ({displayName.split(" ")[0]})
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopAppBar;
