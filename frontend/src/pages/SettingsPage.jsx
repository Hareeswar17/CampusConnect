import AppShell from "../components/AppShell";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

function SettingsPage() {
  const { themeMode, toggleThemeMode } = useThemeStore();
  const { authUser, setRole, isSettingRole } = useAuthStore();
  const [showTeacherVerify, setShowTeacherVerify] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleVerifyTeacher = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter the invite code.");
      return;
    }
    setError("");
    const result = await setRole("teacher", inviteCode.trim());
    if (result.success) {
      setShowTeacherVerify(false);
      setInviteCode("");
    } else {
      setError(result.message);
    }
  };

  return (
    <AppShell title="Settings" searchPlaceholder="Search settings...">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
              Settings
            </h2>
            <p className="text-sm text-[var(--wa-text-secondary)]">
              Manage your appearance and account preferences.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5">
            <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
              Role & Permissions
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--wa-text-primary)]">
                  Current Role
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    authUser?.role === "teacher" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}>
                    {authUser?.role === "teacher" ? <GraduationCap className="w-3.5 h-3.5" /> : null}
                    {authUser?.role === "teacher" ? "Teacher / Instructor" : "Student"}
                  </span>
                </div>
              </div>
              
              {authUser?.role !== "teacher" && !showTeacherVerify && (
                <button
                  type="button"
                  onClick={() => setShowTeacherVerify(true)}
                  className="rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                >
                  Verify as Teacher
                </button>
              )}
            </div>

            {showTeacherVerify && (
              <div className="mt-6 rounded-lg border border-[var(--wa-panel-border)] p-4 bg-[var(--wa-search-bg)]">
                <h4 className="text-sm font-semibold text-[var(--wa-text-primary)]">
                  Teacher Verification
                </h4>
                <p className="mt-1 text-xs text-[var(--wa-text-secondary)]">
                  Enter the invite code provided by your institution to upgrade your account.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter invite code..."
                    className="flex-1 w-full rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-3 py-2 text-sm text-[var(--wa-text-primary)] outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowTeacherVerify(false)}
                      className="flex-1 sm:flex-none rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyTeacher}
                      disabled={isSettingRole || !inviteCode.trim()}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {isSettingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Verify
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5">
            <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
              Appearance
            </h3>
            <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
              Toggle between light and dark themes.
            </p>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="mt-4 rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)] hover:bg-[var(--wa-panel-hover)] transition-colors"
            >
              Switch to {themeMode === "dark" ? "Light" : "Dark"} Mode
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default SettingsPage;
