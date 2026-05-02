import { useEffect, useState, useRef } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useParams } from "react-router-dom";
import ClassShell from "../components/ClassShell";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";

function GroupChatPage() {
  const { groupId } = useParams();
  const { 
    groupById, fetchGroup, messagesByGroup, fetchGroupMessages, sendGroupMessage,
    subscribeToGroupMessages, unsubscribeFromGroupMessages 
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const group = groupById[groupId] || {};
  const messages = messagesByGroup[groupId] || [];
  
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroup(groupId);
    fetchGroupMessages(groupId);
    subscribeToGroupMessages(groupId);

    return () => unsubscribeFromGroupMessages(groupId);
  }, [fetchGroup, fetchGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages, groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() && !imagePreview) return;
    if (isSendingMsg) return;
    
    setIsSendingMsg(true);
    const payload = {
      text: message.trim(),
      image: imagePreview,
    };
    
    // clear UI optimistically
    setMessage("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      await sendGroupMessage(groupId, payload);
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <ClassShell
      groupId={groupId}
      searchPlaceholder="Search resources, peers, or groups..."
    >
      <div className="h-full flex flex-col">
        <div className="border-b border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-6 py-4">
          <div className="text-xs text-[var(--wa-text-secondary)]">
            Class Chat
          </div>
          <h2 className="text-xl font-semibold text-[var(--wa-text-primary)]">
            {group.title || "Group"}
          </h2>
          <p className="text-xs text-[var(--wa-text-secondary)]">
            {group.subtitle || ""}
            {group.membersCount != null
              ? ` - ${group.membersCount} Members`
              : ""}
          </p>
        </div>

        <div className="wa-chat-bg flex-1 overflow-y-auto overscroll-contain px-[5%] md:px-[7%] lg:px-[10%] py-4 relative">
          <div className="relative z-10 space-y-[2px]">
            {messages.map((item, idx) => {
              const isSelf = item.senderId?._id === authUser?._id;
              const author = isSelf ? "You" : item.senderId?.fullName || "Student";
              const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // Determine if this message should show a tail
              const prevMsg = messages[idx - 1];
              const showTail =
                !prevMsg ||
                prevMsg.senderId?._id !== item.senderId?._id ||
                (new Date(item.createdAt) - new Date(prevMsg.createdAt)) > 60000;

              return (
                <div
                  key={item._id}
                  className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      relative w-fit max-w-[65%] min-w-[80px] px-[9px] pt-[6px] pb-[8px]
                      ${isSelf
                        ? showTail ? "wa-bubble-outgoing ml-16" : "wa-bubble-no-tail wa-bubble-outgoing ml-16"
                        : showTail ? "wa-bubble-incoming mr-16" : "wa-bubble-no-tail wa-bubble-incoming mr-16"
                      }
                    `}
                  >
                    {!isSelf && showTail && (
                      <div className="text-[12.5px] font-semibold text-[var(--wa-green)] mb-0.5 leading-tight">
                        {author}
                      </div>
                    )}
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt="attachment" 
                        className="rounded-md max-h-[280px] w-full object-cover mb-1" 
                      />
                    )}
                    {item.text && (
                      <p className={`${item.image ? "mt-1" : ""} text-[14.2px] leading-[19px] whitespace-pre-wrap break-words`}>
                        {item.text}
                        <span className="ml-2 inline-flex items-center gap-[3px] align-bottom text-[11px] leading-none tabular-nums float-right mt-[5px] pl-3">
                          <span className="opacity-55">{time}</span>
                        </span>
                      </p>
                    )}
                    {!item.text && item.image && (
                      <div className="mt-1 flex justify-end">
                        <span className="inline-flex items-center gap-[3px] text-[11px] leading-none tabular-nums">
                          <span className="opacity-55">{time}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-[var(--wa-panel-border)] bg-[var(--wa-panel)] px-6 py-4">
          {imagePreview && (
            <div className="mb-3 flex items-center gap-2">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover border border-[var(--wa-panel-border)]"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-3 rounded-2xl border border-[var(--wa-panel-border)] bg-[var(--wa-search-bg)] px-3 py-2 min-h-[44px]">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="text-[var(--wa-icon)] hover:text-[var(--wa-text-primary)] transition-colors mb-1.5 ml-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message to the class..."
              className="flex-1 bg-transparent text-sm text-[var(--wa-text-primary)] outline-none resize-none overflow-y-auto max-h-[100px] py-1.5"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() && !imagePreview}
              className="inline-flex items-center justify-center rounded-full bg-[var(--wa-green)] p-2 text-white hover:bg-[var(--wa-green-deep)] disabled:opacity-50 transition-colors mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </ClassShell>
  );
}

export default GroupChatPage;
