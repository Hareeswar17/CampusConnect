import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, incomingRequests } = useChatStore();
  const pendingCount = incomingRequests.length;

  return (
    <div className="m-3 flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          activeTab === "chats"
            ? "bg-brand-500 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          activeTab === "contacts"
            ? "bg-brand-500 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        Contacts
      </button>

      <button
        onClick={() => setActiveTab("requests")}
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          activeTab === "requests"
            ? "bg-brand-500 text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          Requests
          {pendingCount > 0 ? (
            <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {pendingCount}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
