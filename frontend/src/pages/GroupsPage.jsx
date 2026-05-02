import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Code, Leaf, PenTool, Plus } from "lucide-react";
import AppShell from "../components/AppShell";
import { GROUPS, SUGGESTED_GROUPS } from "../data/groups";

function GroupsPage() {
  const iconMap = {
    code: Code,
    leaf: Leaf,
    pen: PenTool,
    book: BookOpen,
  };
  const accentPalette = ["var(--wa-accent-sky)", "var(--wa-accent-gray)"];
  const iconAccentMap = {
    code: "var(--wa-accent-sky)",
    leaf: "var(--wa-accent-gray)",
    pen: "var(--wa-accent-gray)",
    book: "var(--wa-accent-sky)",
  };

  return (
    <AppShell
      title="Groups"
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--wa-text-primary)]">
              My Classes
            </h2>
            <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
              Access your active study environments and collaborative boards.
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {GROUPS.map((group, index) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] overflow-hidden"
                  style={{
                    borderLeftColor:
                      accentPalette[index % accentPalette.length],
                  }}
                >
                  <div
                    className="h-28 relative"
                    style={{
                      backgroundImage: group.cover,
                      backgroundSize: "cover",
                    }}
                  >
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[var(--wa-text-secondary)]">
                      ACTIVE TERM
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-lg font-semibold text-[var(--wa-text-primary)]">
                        {group.title}
                      </div>
                      <div className="text-xs text-[var(--wa-text-secondary)]">
                        {group.members}
                      </div>
                    </div>
                    <Link
                      to={`/groups/${group.id}`}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--wa-green)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--wa-green-deep)] transition-colors"
                    >
                      Enter Class
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[var(--wa-text-primary)]">
              Suggested Groups
            </h3>
            <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
              Expand your network and find new collaborative opportunities based
              on your major.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {SUGGESTED_GROUPS.map((group) => {
                const Icon = iconMap[group.icon] || Users;
                const accentColor =
                  iconAccentMap[group.icon] || "var(--wa-accent-sky)";
                return (
                  <div
                    key={group.id}
                    className="rounded-xl border border-l-4 border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-4 py-3 flex items-center gap-3"
                    style={{ borderLeftColor: accentColor }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--wa-panel-active)] flex items-center justify-center text-[var(--wa-green)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--wa-text-primary)] truncate">
                        {group.title}
                      </div>
                      <div className="text-xs text-[var(--wa-text-secondary)]">
                        {group.members}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

export default GroupsPage;
