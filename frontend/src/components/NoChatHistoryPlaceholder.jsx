import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="relative mb-5">
        <div className="w-[80px] h-[80px] rounded-full bg-[var(--wa-search-bg)] flex items-center justify-center">
          <MessageCircleIcon className="w-10 h-10 text-[var(--wa-green)] opacity-60" />
        </div>
        <div className="absolute inset-[-8px] rounded-full border border-[var(--wa-divider)] opacity-50" />
      </div>
      <h3 className="text-[17px] font-normal text-[var(--wa-text-primary)] mb-2">
        Start your conversation with <span className="font-medium">{name}</span>
      </h3>
      <p className="text-[var(--wa-text-secondary)] text-[13.5px] mb-7 max-w-[320px] leading-relaxed">
        Messages are end-to-end encrypted. Send a message to start chatting!
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {["👋 Say Hello", "How are you?", "Let's meet up!"].map((text) => (
          <button
            key={text}
            className="px-4 py-[7px] text-[13px] font-medium rounded-full border border-[var(--wa-green)]/40 text-[var(--wa-green)] hover:bg-[var(--wa-green)] hover:text-white active:scale-[0.97] transition-all"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
