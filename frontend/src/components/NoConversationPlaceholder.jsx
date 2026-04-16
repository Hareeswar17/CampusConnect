import { Lock, MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[var(--wa-panel-header)]">
      {/* Illustration */}
      <div className="relative mb-10">
        <div className="w-[260px] h-[260px] rounded-full bg-[var(--wa-search-bg)] flex items-center justify-center">
          <MessageCircleIcon className="w-[100px] h-[100px] text-[var(--wa-text-secondary)] opacity-20" strokeWidth={1.2} />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-[-15px] rounded-full border border-[var(--wa-divider)] opacity-60" />
        <div className="absolute inset-[-30px] rounded-full border border-[var(--wa-divider)] opacity-30" />
      </div>

      <h1 className="text-[28px] font-light text-[var(--wa-text-primary)] mb-3 tracking-tight">
        CampusConnect Web
      </h1>
      <p className="text-[var(--wa-text-secondary)] text-[14px] max-w-[460px] leading-[20px] mb-10">
        Send and receive messages without keeping your phone online.
        Use CampusConnect on up to 4 linked devices and 1 phone at the same time.
      </p>
      <div className="flex items-center gap-1.5 text-[var(--wa-text-secondary)] text-[12.5px]">
        <Lock className="w-[12px] h-[12px]" />
        <span>Your personal messages are end-to-end encrypted</span>
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;
