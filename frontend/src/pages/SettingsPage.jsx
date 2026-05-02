import AppShell from "../components/AppShell";
import { useThemeStore } from "../store/useThemeStore";

function SettingsPage() {
  const { themeMode, toggleThemeMode } = useThemeStore();

  return (
    <AppShell title="Settings" searchPlaceholder="Search settings...">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
            Settings
          </h2>
          <p className="text-sm text-[var(--wa-text-secondary)]">
            Manage your appearance and notification preferences.
          </p>

          <div className="mt-6 rounded-xl border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-5">
            <h3 className="text-sm font-semibold text-[var(--wa-text-primary)]">
              Appearance
            </h3>
            <p className="mt-2 text-xs text-[var(--wa-text-secondary)]">
              Toggle between light and dark themes.
            </p>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="mt-4 rounded-lg border border-[var(--wa-panel-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text-primary)]"
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
