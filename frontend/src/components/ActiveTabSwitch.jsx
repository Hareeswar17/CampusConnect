import { useChatStore } from "../store/useChatStore";
import { MessageSquare, Users, UserPlus } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab, incomingRequests } = useChatStore();
  const pendingCount = incomingRequests.length;

  const tabs = [
    { key: "chats", label: "Chats", icon: MessageSquare },
    { key: "contacts", label: "Contacts", icon: Users },
    { key: "requests", label: "Requests", icon: UserPlus, badge: pendingCount },
  ];

  return (
    <div className="flex bg-[var(--wa-panel)] shrink-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-[14px] text-[13px] font-medium uppercase tracking-[0.5px]
              relative select-none
              transition-colors duration-150
              ${isActive
                ? "text-[var(--wa-green)]"
                : "text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)]"
              }
            `}
          >
            <Icon className="w-[15px] h-[15px]" strokeWidth={2.2} />
            <span>{tab.label}</span>

            {(tab.badge ?? 0) > 0 ? (
              <span className="ml-0.5 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[var(--wa-unread-badge)] px-1 text-[10px] font-bold text-white leading-none">
                {tab.badge}
              </span>
            ) : null}

            {/* Active bottom bar */}
            <span
              className={`absolute bottom-0 left-[10%] right-[10%] h-[3px] rounded-t-sm transition-all duration-200 ${
                isActive ? "bg-[var(--wa-green)] scale-x-100" : "bg-transparent scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
export default ActiveTabSwitch;
