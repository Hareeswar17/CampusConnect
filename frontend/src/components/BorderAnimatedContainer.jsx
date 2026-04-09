function BorderAnimatedContainer({ children, fullScreen = false }) {
  return (
    <div
      className={`w-full h-full flex overflow-hidden bg-white dark:bg-black ${
        fullScreen
          ? ""
          : "rounded-2xl border border-slate-300 shadow-sm dark:border-zinc-800"
      }`}
    >
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
