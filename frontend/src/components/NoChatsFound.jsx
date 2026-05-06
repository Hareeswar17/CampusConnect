import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="relative mb-5">
        <div className="w-[72px] h-[72px] rounded-full bg-[var(--wa-search-bg)] flex items-center justify-center">
          <MessageCircleIcon className="w-9 h-9 text-[var(--wa-green)] opacity-60" />
        </div>
        <div className="absolute inset-[-8px] rounded-full border border-[var(--wa-divider)] opacity-50" />
      </div>
      <h4 className="text-[16px] text-[var(--wa-text-primary)] font-medium mb-1.5">
        No conversations yet
      </h4>
      <p className="text-[var(--wa-text-secondary)] text-[13.5px] mb-5 max-w-[250px] leading-relaxed">
        Start by adding friends from the contacts or requests tab.
      </p>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-5 py-2.5 text-[13.5px] rounded-lg bg-[var(--wa-green)] text-white font-medium hover:bg-[var(--wa-green-deep)] active:scale-[0.97] transition-all"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
