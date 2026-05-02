import { useState } from "react";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { getGroupById } from "../data/groups";

const SAMPLE_MESSAGES = [
  {
    id: "m1",
    author: "Priya S.",
    time: "10:12 AM",
    text: "Reminder: quiz review session starts at 5 PM today.",
    isSelf: false,
  },
  {
    id: "m2",
    author: "You",
    time: "10:15 AM",
    text: "Thanks! Can someone share the problem set solutions?",
    isSelf: true,
  },
  {
    id: "m3",
    author: "Leo K.",
    time: "10:18 AM",
    text: "Posting the solutions PDF in Resources now.",
    isSelf: false,
  },
];

function GroupChatPage() {
  const { groupId } = useParams();
  const group = getGroupById(groupId);
  const [message, setMessage] = useState("");

  return (
    <ClassShell groupId={groupId} searchPlaceholder="Search resources, peers, or groups...">
      <div className="h-full flex flex-col">
        <div className="border-b border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-6 py-4">
          <div className="text-xs text-[var(--wa-text-secondary)]">Class Chat</div>
          <h2 className="text-xl font-semibold text-[var(--wa-text-primary)]">
            {group.title}
          </h2>
          <p className="text-xs text-[var(--wa-text-secondary)]">
            {group.subtitle} - {group.members}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[var(--wa-page-bg)]">
          {SAMPLE_MESSAGES.map((item) => (
            <div
              key={item.id}
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                item.isSelf
                  ? "ml-auto bg-[var(--wa-green)] text-white"
                  : "bg-[var(--wa-panel)] text-[var(--wa-text-primary)]"
              }`}
            >
              <div className="text-[11px] opacity-80">
                {item.author} · {item.time}
              </div>
              <div className="mt-1">{item.text}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-6 py-4">
          <div className="flex items-center gap-3 rounded-full border border-[var(--wa-panel-border)] bg-white px-4 py-2">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message to the class..."
              className="flex-1 bg-transparent text-sm text-[var(--wa-text-primary)] outline-none"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-[var(--wa-green)] p-2 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupChatPage;
