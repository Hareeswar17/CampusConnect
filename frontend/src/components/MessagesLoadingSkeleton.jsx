function MessagesLoadingSkeleton() {
  return (
    <div className="space-y-[6px] animate-pulse">
      {[...Array(8)].map((_, i) => {
        const isSelf = i % 3 !== 0;
        const width = [55, 40, 65, 35, 50, 45, 60, 30][i];

        return (
          <div key={i} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-[7.5px] px-3 py-3 ${
                isSelf ? "bg-[var(--wa-outgoing)]" : "bg-[var(--wa-incoming)]"
              }`}
              style={{ width: `${width}%` }}
            >
              <div className="h-[12px] bg-[var(--wa-search-bg)] rounded w-full mb-[6px]" />
              <div className="h-[12px] bg-[var(--wa-search-bg)] rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default MessagesLoadingSkeleton;
