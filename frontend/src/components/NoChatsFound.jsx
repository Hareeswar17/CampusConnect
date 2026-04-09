import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-brand-500" />
      </div>
      <div>
        <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-1">
          No conversations yet
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-sm px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
