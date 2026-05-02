import { Search } from "lucide-react";
import { useState } from "react";
import AppShell from "../components/AppShell";

function FindFriendsPage() {
  const [query, setQuery] = useState("");

  return (
    <AppShell title="Find Friends">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl">
          <div className="rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-4">
            <div className="flex items-center gap-3">
              <Search className="w-[18px] h-[18px] text-[var(--wa-icon)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students or mentors"
                className="w-full bg-transparent text-sm text-[var(--wa-text-primary)] outline-none placeholder:text-[var(--wa-text-secondary)]"
              />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-6">
            <h3 className="text-base font-semibold text-[var(--wa-text-primary)]">
              No matches yet
            </h3>
            <p className="mt-2 text-sm text-[var(--wa-text-secondary)]">
              Try searching by name, class, or shared interests.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default FindFriendsPage;
