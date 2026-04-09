import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div
        className="size-20 rounded-full border border-[var(--panel-border)] bg-[var(--panel-soft)] flex items-center justify-center mb-6"
        style={{ boxShadow: "var(--clay-shadow-raised)" }}
      >
        <MessageCircleIcon className="size-10 text-brand-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Select a conversation
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        Choose a contact from the sidebar to start chatting or continue a
        previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
