import TopAppBar from "./TopAppBar";
import ClassSideNav from "./ClassSideNav";

function ClassShell({ children, groupId, searchPlaceholder }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--wa-page-bg)] text-[var(--wa-text-primary)]">
      <TopAppBar searchPlaceholder={searchPlaceholder} />
      <div className="flex h-[calc(100dvh-64px)] overflow-hidden">
        <ClassSideNav groupId={groupId} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default ClassShell;
