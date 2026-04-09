import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOutIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

function ProfileHeader({ searchQuery = "", onSearchChange = () => {} }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { authUser, clearAuth } = useAuthStore();
  const { themeMode, toggleThemeMode } = useThemeStore();

  const clerkEmail = user?.primaryEmailAddress?.emailAddress;
  const realEmail =
    clerkEmail || authUser?.email || authUser?.primaryEmail || authUser?.mail;

  const displayName =
    user?.fullName?.trim() ||
    authUser?.fullName?.trim() ||
    realEmail?.split("@")[0] ||
    "Chat User";

  const subtitle = realEmail || "Online";

  return (
    <div className="h-[72px] px-4 border-b border-[var(--clay-border)] bg-transparent">
      <div className="h-full flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3 flex-1">
          <div className="avatar online">
            <div className="size-11 rounded-full ring-1 ring-[var(--panel-border)] overflow-hidden">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-sm md:text-base leading-tight truncate">
              {displayName}
            </h3>
            <p
              className="text-slate-600 dark:text-slate-400 text-xs truncate"
              title={subtitle}
            >
              {subtitle}
            </p>
          </div>

          <label className="hidden md:flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 dark:border-[var(--panel-border)] dark:bg-[var(--panel-bg)]/80 px-3 py-2 min-w-0 flex-1 max-w-[240px]">
            <SearchIcon className="size-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search chats, contacts"
              className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-black/20 dark:hover:text-zinc-200 transition-colors duration-150"
            onClick={toggleThemeMode}
            aria-label={
              themeMode === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              themeMode === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {themeMode === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </button>

          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-black/20 dark:hover:text-zinc-200 transition-colors duration-150"
            onClick={async () => {
              await signOut({ redirectUrl: "/login" });
              clearAuth();
            }}
            aria-label="Sign out"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
