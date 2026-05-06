function UsersLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center gap-3 px-3 py-3">
          <div className="w-[49px] h-[49px] rounded-full bg-[var(--wa-search-bg)] shrink-0" />
          <div className="flex-1 border-b border-[var(--wa-divider)] py-2 space-y-2">
            <div className="h-3.5 bg-[var(--wa-search-bg)] rounded w-3/5" />
            <div className="h-3 bg-[var(--wa-search-bg)] rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
