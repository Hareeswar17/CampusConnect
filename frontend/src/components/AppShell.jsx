import SideNavBar from "./SideNavBar";

function AppShell({ children }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--wa-page-bg)] text-[var(--wa-text-primary)]">
      <div className="flex h-[100dvh] overflow-hidden">
        <SideNavBar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default AppShell;
