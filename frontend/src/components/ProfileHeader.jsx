import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const { clearAuth } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const displayName =
    user?.fullName?.trim() ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Chat User";

  const subtitle = user?.primaryEmailAddress?.emailAddress || "Online";

  return (
    <div className="h-20 px-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
      <div className="h-full flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="avatar online">
            <div className="size-11 rounded-full ring-1 ring-slate-300 dark:ring-zinc-700 overflow-hidden">
              <img
                src={user?.imageUrl || "/avatar.png"}
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-sm md:text-base leading-tight truncate">
              {isLoaded ? displayName : "Loading..."}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors duration-150"
            onClick={async () => {
              await signOut({ redirectUrl: "/login" });
              clearAuth();
            }}
            aria-label="Sign out"
          >
            <LogOutIcon className="size-4" />
          </button>

          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors duration-150"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-4" />
            ) : (
              <VolumeOffIcon className="size-4" />
            )}
          </button>

          <div className="ml-1">
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
