function BorderAnimatedContainer({ children, fullScreen = false }) {
  return (
    <div
      className={`w-full h-full flex overflow-hidden bg-[var(--clay-surface)] backdrop-blur-xl ${
        fullScreen ? "" : "rounded-2xl border border-[var(--clay-border)]"
      }`}
      style={{ boxShadow: fullScreen ? "none" : "var(--clay-shadow-raised)" }}
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
