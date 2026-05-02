import { useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  CalendarDays,
  Folder,
  HelpCircle,
  Home,
  LayoutList,
  MessageSquare,
  Rows,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";

function ClassSideNav({ groupId }) {
  const { groupById, fetchGroup } = useGroupStore();
  const group = groupById[groupId] || {};

  useEffect(() => {
    fetchGroup(groupId);
  }, [fetchGroup, groupId]);

  const items = [
    { to: `/groups/${groupId}`, label: "Overview", icon: Home },
    { to: `/groups/${groupId}/chat`, label: "Class Chat", icon: MessageSquare },
    { to: `/groups/${groupId}/doubts`, label: "Doubts", icon: HelpCircle },
    { to: `/groups/${groupId}/resources`, label: "Resources", icon: Folder },
    { to: `/groups/${groupId}/events`, label: "Events", icon: CalendarDays },
    { to: `/groups/${groupId}/tasks`, label: "Tasks", icon: LayoutList },
    { to: `/groups/${groupId}/projects`, label: "Projects", icon: Rows },
    { to: `/groups/${groupId}/roster`, label: "Members", icon: Users },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--wa-panel-border)] bg-[var(--wa-panel)]">
      <div className="px-5 pt-6 pb-4 space-y-3">
        <Link
          to="/groups"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--wa-text-secondary)] hover:text-[var(--wa-text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>
        <div>
          <div className="text-sm font-semibold text-[var(--wa-text-primary)]">
            {group.title || "Group"}
          </div>
          <div className="text-xs text-[var(--wa-text-secondary)]">
            {group.subtitle || ""}
          </div>
          <div className="mt-2 text-[11px] text-[var(--wa-text-secondary)]">
            {group.membersCount != null ? `${group.membersCount} Members` : ""}
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isOverview = item.to === `/groups/${groupId}`;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={isOverview}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--wa-panel-active)] text-[var(--wa-text-primary)]"
                    : "text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)]",
                ].join(" ")
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default ClassSideNav;
