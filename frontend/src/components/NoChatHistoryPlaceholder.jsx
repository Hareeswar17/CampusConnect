import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center mb-5">
        <MessageCircleIcon className="size-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          This is the beginning of your conversation. Send a message to start
          chatting!
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="px-4 py-2 text-xs font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150">
          Say Hello
        </button>
        <button className="px-4 py-2 text-xs font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150">
          How are you?
        </button>
        <button className="px-4 py-2 text-xs font-medium rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors duration-150">
          Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
