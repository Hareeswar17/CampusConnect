import { NavLink } from "react-router-dom";
import {
  Bell,
  LayoutGrid,
  HelpCircle,
  Menu,
  Moon,
  Sun,
  MessageSquare,
  Search,
  UserPlus,
  Users,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const navItems = [
  { to: "/chat", label: "Chats", icon: MessageSquare },
  { to: "/groups", label: "Groups", icon: LayoutGrid },
  { to: "/find-friends", label: "Find Friends", icon: Search },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/requests", label: "Requests", icon: UserPlus, badge: "requests" },
];

function SideNavBar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { clearAuth, authUser } = useAuthStore();
  const { incomingRequests } = useChatStore();
  const { themeMode, toggleThemeMode } = useThemeStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const requestCount = incomingRequests.length;
  const displayName =
    user?.fullName?.trim() || authUser?.fullName?.trim() || "Student";
  const displayInitial = displayName.charAt(0).toUpperCase() || "S";

  return (
    <aside
      className={[
        "hidden md:flex flex-col border-r border-[var(--wa-panel-border)] bg-[var(--wa-panel)] wa-transition-panel",
        isCollapsed ? "w-20" : "w-64 lg:w-72",
      ].join(" ")}
    >
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--wa-green)] text-white flex items-center justify-center font-semibold">
            {displayInitial}
          </div>
          {isCollapsed ? null : (
            <div>
              <div className="text-[15px] font-semibold text-[var(--wa-text-primary)]">
                {displayName}
              </div>
              <div className="text-[11px] text-[var(--wa-text-secondary)]">
                Helpful Mentor
              </div>
            </div>
          )}
        </div>

        {isCollapsed ? null : (
          <button
            type="button"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--wa-green)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors"
          >
            <Plus className="w-[16px] h-[16px]" />
            New Study Session
          </button>
        )}
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badgeValue = item.badge === "requests" ? requestCount : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center" : "",
                  isActive
                    ? "bg-[var(--wa-panel-active)] text-[var(--wa-text-primary)]"
                    : "text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)]",
                ].join(" ")
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {isCollapsed ? null : (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!isCollapsed && badgeValue > 0 ? (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-[var(--wa-unread-badge)] text-white text-[11px] font-semibold flex items-center justify-center">
                  {badgeValue}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-5 pt-6">
        <div className="mt-2 space-y-1">
          <button
            type="button"
            className={[
              "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors",
              isCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className={isCollapsed ? "sr-only" : ""}>Notifications</span>
          </button>
          <button
            type="button"
            className={[
              "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors",
              isCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
            aria-label="Help"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            <span className={isCollapsed ? "sr-only" : ""}>Help & support</span>
          </button>
          <button
            type="button"
            className={[
              "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors",
              isCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
            onClick={toggleThemeMode}
          >
            {themeMode === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
            <span className={isCollapsed ? "sr-only" : ""}>
              {themeMode === "dark" ? "Switch to light" : "Switch to dark"}
            </span>
          </button>
          <button
            type="button"
            className={[
              "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
              isCollapsed ? "justify-center" : "gap-3",
            ].join(" ")}
            onClick={async () => {
              await signOut({ redirectUrl: "/login" });
              clearAuth();
            }}
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className={isCollapsed ? "sr-only" : ""}>Log out</span>
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center" : "",
                isActive
                  ? "bg-[var(--wa-panel-active)] text-[var(--wa-text-primary)]"
                  : "text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)]",
              ].join(" ")
            }
          >
            <Settings className="w-[18px] h-[18px]" />
            {isCollapsed ? null : "Settings"}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default SideNavBar;
