import { SearchIcon, ArrowLeft } from "lucide-react";
import { useState } from "react";

function SearchBar({ searchQuery = "", onSearchChange = () => {} }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="px-2.5 py-[7px] bg-[var(--wa-panel)] shrink-0 border-b border-[var(--wa-divider)]">
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-[6px] transition-colors duration-200 ${
          isFocused
            ? "bg-[var(--wa-search-focus)] ring-1 ring-[var(--wa-green)]"
            : "bg-[var(--wa-search-bg)]"
        }`}
      >
        <div className="relative w-[18px] h-[18px] shrink-0">
          {/* Search icon → Back arrow animation on focus */}
          <SearchIcon
            className={`w-[18px] h-[18px] text-[var(--wa-icon)] absolute top-0 left-0 transition-all duration-200 ${
              isFocused ? "opacity-0 scale-75 rotate-90" : "opacity-100 scale-100 rotate-0"
            }`}
          />
          <ArrowLeft
            className={`w-[18px] h-[18px] text-[var(--wa-green)] absolute top-0 left-0 transition-all duration-200 ${
              isFocused ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90"
            }`}
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or start new chat"
          className="w-full bg-transparent outline-none text-[13.5px] text-[var(--wa-text-primary)] placeholder:text-[var(--wa-text-secondary)]"
        />
      </div>
    </div>
  );
}
export default SearchBar;
