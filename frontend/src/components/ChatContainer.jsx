import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  CheckCheck,
  FileText,
  Forward,
  Reply,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const TARGET_LANGUAGE_OPTIONS = [
  { value: "en", label: "English (UK)" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "pa", label: "Punjabi" },
  { value: "ur", label: "Urdu" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

function ChatContainer({ onBack }) {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    chats,
    allContacts,
    getAllContacts,
    setReplyingTo,
    deleteMessage,
    forwardMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [aiToolsMessageId, setAiToolsMessageId] = useState(null);
  const [receiverTargetLanguage, setReceiverTargetLanguage] = useState("en");
  const [receiverTranslations, setReceiverTranslations] = useState({});

  const forwardTargets = useMemo(() => {
    const map = new Map();
    [...chats, ...allContacts].forEach((user) => {
      if (!user?._id || user._id === selectedUser?._id) return;
      if (!map.has(user._id)) map.set(user._id, user);
    });
    return Array.from(map.values());
  }, [allContacts, chats, selectedUser]);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!forwardingMessage) return;
    if (allContacts.length > 0) return;
    getAllContacts();
  }, [allContacts.length, forwardingMessage, getAllContacts]);

  const handleReply = (msg) => {
    if (msg.isDeleted) return;
    setReplyingTo(msg);
    setContextMenu(null);
  };

  const handleDelete = (msgId) => {
    deleteMessage(msgId);
    setContextMenu(null);
  };

  const handleForward = (msg) => {
    if (msg.isDeleted) return;
    setForwardingMessage(msg);
    setContextMenu(null);
  };

  const handleOpenContextMenu = (event, msg) => {
    event.preventDefault();
    setContextMenu({ message: msg, x: event.clientX, y: event.clientY });
  };

  const handleForwardToUser = async (targetUserId) => {
    if (!forwardingMessage) return;
    await forwardMessage({
      targetUserId,
      text: forwardingMessage.text,
      image: forwardingMessage.image,
    });
    setForwardingMessage(null);
  };

  const handleTranslateIncomingAudio = async (msg, mode) => {
    const sourceText =
      (msg.audioTranscript || "").trim() ||
      (msg.translation?.sourceText || "").trim() ||
      (msg.text || "").trim();
    if (!sourceText) {
      toast.error("No transcript available for this voice message");
      return;
    }

    const endpoint =
      mode === "voice" ? "/messages/translate/voice" : "/messages/translate/text";

    setReceiverTranslations((prev) => ({
      ...prev,
      [msg._id]: { ...prev[msg._id], isLoading: true },
    }));

    try {
      const res = await axiosInstance.post(endpoint, {
        text: sourceText,
        targetLanguage: receiverTargetLanguage,
      });

      setReceiverTranslations((prev) => ({
        ...prev,
        [msg._id]: {
          isLoading: false,
          translatedText: res.data?.translatedText || "",
          translatedAudio: res.data?.translatedAudio || "",
          targetLanguage: receiverTargetLanguage,
        },
      }));

      if (mode === "voice" && !res.data?.translatedAudio) {
        toast.error("Voice output is unavailable for this language right now.");
      }
      setAiToolsMessageId(null);
    } catch (error) {
      setReceiverTranslations((prev) => ({
        ...prev,
        [msg._id]: { ...prev[msg._id], isLoading: false },
      }));
      toast.error(error.response?.data?.message || "Failed to translate message");
    }
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  return (
    <>
      <ChatHeader onBack={onBack} />

      {/* ── Message area ── */}
      <div className="wa-chat-bg flex-1 overflow-y-auto overscroll-contain px-[5%] md:px-[7%] lg:px-[10%] py-4 relative">
        <div className="relative z-10">
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="space-y-[2px]">
              {messages.map((msg, idx) => {
                const receiverTranslation = receiverTranslations[msg._id];
                const isSelf = msg.senderId === authUser._id;

                // Determine if this message should show a tail
                const prevMsg = messages[idx - 1];
                const showTail =
                  !prevMsg ||
                  prevMsg.senderId !== msg.senderId ||
                  (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) > 60000;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      onContextMenu={(event) => handleOpenContextMenu(event, msg)}
                      className={`
                        relative w-fit max-w-[65%] min-w-[80px] px-[9px] pt-[6px] pb-[8px]
                        ${isSelf
                          ? showTail ? "wa-bubble-outgoing ml-16" : "wa-bubble-no-tail wa-bubble-outgoing ml-16"
                          : showTail ? "wa-bubble-incoming mr-16" : "wa-bubble-no-tail wa-bubble-incoming mr-16"
                        }
                      `}
                    >
                      {/* Image */}
                      {msg.image && !msg.isDeleted && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-md max-h-[280px] w-full object-cover mb-1"
                        />
                      )}

                      {/* Audio */}
                      {msg.audioUrl && !msg.isDeleted ? (
                        <div className={msg.image ? "mt-1" : ""}>
                          <audio controls src={msg.audioUrl} className="h-9 max-w-full" />

                          {msg.senderId !== authUser._id && (
                            <button
                              type="button"
                              onClick={() =>
                                setAiToolsMessageId((c) => (c === msg._id ? null : msg._id))
                              }
                              className="mt-1 inline-flex items-center gap-1 rounded-md border border-[var(--wa-panel-border)] px-2 py-1 text-[11px] text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] transition-colors"
                            >
                              <Bot className="h-3 w-3" /> AI tools
                            </button>
                          )}

                          {/* AI Services */}
                          {aiToolsMessageId === msg._id && (
                            <div className="mt-2 rounded-lg border border-[var(--wa-panel-border)] bg-[var(--wa-panel)] p-2.5 shadow-sm">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[11px] font-medium text-[var(--wa-text-primary)]">
                                  AI Translation
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setAiToolsMessageId(null)}
                                  className="rounded p-1 text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)]"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="mb-2 flex items-center gap-2">
                                <label className="text-[11px] text-[var(--wa-text-secondary)]">To:</label>
                                <select
                                  value={receiverTargetLanguage}
                                  onChange={(e) => setReceiverTargetLanguage(e.target.value)}
                                  className="rounded-md border border-[var(--wa-panel-border)] bg-[var(--wa-input-bg)] px-2 py-1 text-[11px] text-[var(--wa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--wa-green)]"
                                >
                                  {TARGET_LANGUAGE_OPTIONS.map((l) => (
                                    <option key={l.value} value={l.value}>{l.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleTranslateIncomingAudio(msg, "text")}
                                  disabled={!!receiverTranslation?.isLoading}
                                  className="inline-flex items-center gap-1 rounded-md bg-[var(--wa-search-bg)] px-2.5 py-1.5 text-[11px] text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] disabled:opacity-50 transition-colors"
                                >
                                  <FileText className="h-3 w-3" /> Text
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTranslateIncomingAudio(msg, "voice")}
                                  disabled={!!receiverTranslation?.isLoading}
                                  className="inline-flex items-center gap-1 rounded-md bg-[var(--wa-search-bg)] px-2.5 py-1.5 text-[11px] text-[var(--wa-text-secondary)] hover:bg-[var(--wa-panel-hover)] disabled:opacity-50 transition-colors"
                                >
                                  <Volume2 className="h-3 w-3" /> Voice
                                </button>
                              </div>

                              {receiverTranslation?.isLoading && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="w-3.5 h-3.5 border-[1.5px] border-[var(--wa-green)] border-t-transparent rounded-full animate-spin" />
                                  <span className="text-[11px] text-[var(--wa-text-secondary)]">Translating…</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Deleted */}
                      {msg.isDeleted && (
                        <p className="text-[13px] italic text-[var(--wa-text-secondary)]">
                          🚫 This message was deleted
                        </p>
                      )}

                      {/* Text */}
                      {msg.text && !msg.isDeleted && (
                        <p className={`${msg.image ? "mt-1" : ""} text-[14.2px] leading-[19px] whitespace-pre-wrap break-words`}>
                          {msg.text}
                          <span className="ml-2 inline-flex items-center gap-[3px] align-bottom text-[11px] leading-none tabular-nums float-right mt-[5px] pl-3">
                            <span className="opacity-55">{formatMessageTime(msg.createdAt)}</span>
                            {isSelf && (
                              msg.isRead ? (
                                <CheckCheck className="w-[16px] h-[16px] text-[var(--wa-read)]" strokeWidth={2.5} />
                              ) : (
                                <Check className="w-[16px] h-[16px] opacity-40" strokeWidth={2.5} />
                              )
                            )}
                          </span>
                        </p>
                      )}

                      {/* Translation result */}
                      {(receiverTranslation?.translatedText || msg.translation?.translatedText) && !msg.isDeleted && (
                        <div className="mt-1.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] px-2 py-1.5 text-[12px] leading-relaxed">
                          {receiverTranslation?.translatedText || msg.translation?.translatedText}
                        </div>
                      )}

                      {/* Translated audio */}
                      {(receiverTranslation?.translatedAudio || msg.translation?.translatedAudioUrl) && !msg.isDeleted && (
                        <div className="mt-1">
                          <audio
                            controls
                            src={receiverTranslation?.translatedAudio || msg.translation?.translatedAudioUrl}
                            className="h-9 max-w-full"
                          />
                        </div>
                      )}

                      {/* Standalone timestamp for non-text */}
                      {((!msg.text && (msg.image || msg.audioUrl) && !msg.isDeleted) || msg.isDeleted) && (
                        <div className="mt-1 flex justify-end">
                          <span className="inline-flex items-center gap-[3px] text-[11px] leading-none tabular-nums">
                            <span className="opacity-55">{formatMessageTime(msg.createdAt)}</span>
                            {isSelf && (
                              msg.isRead ? (
                                <CheckCheck className="w-[16px] h-[16px] text-[var(--wa-read)]" strokeWidth={2.5} />
                              ) : (
                                <Check className="w-[16px] h-[16px] opacity-40" strokeWidth={2.5} />
                              )
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          )}
        </div>
      </div>

      <MessageInput />

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[175px] rounded-md py-2 bg-[var(--wa-dropdown-bg)]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            boxShadow: "var(--wa-dropdown-shadow)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleReply(contextMenu.message)}
            className="flex w-full items-center gap-3 px-6 py-[9px] text-left text-[14.5px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
          >
            <Reply className="h-4 w-4 text-[var(--wa-icon)]" /> Reply
          </button>
          <button
            type="button"
            onClick={() => handleForward(contextMenu.message)}
            className="flex w-full items-center gap-3 px-6 py-[9px] text-left text-[14.5px] text-[var(--wa-text-primary)] hover:bg-[var(--wa-dropdown-hover)] transition-colors"
          >
            <Forward className="h-4 w-4 text-[var(--wa-icon)]" /> Forward
          </button>
          <button
            type="button"
            disabled={contextMenu.message.senderId !== authUser._id}
            onClick={() => handleDelete(contextMenu.message._id)}
            className="flex w-full items-center gap-3 px-6 py-[9px] text-left text-[14.5px] text-red-500 hover:bg-[var(--wa-dropdown-hover)] disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      {/* ── Forward Modal ── */}
      {forwardingMessage && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center px-4"
          style={{ background: "var(--wa-overlay)" }}
        >
          <div className="w-full max-w-[420px] rounded-md bg-[var(--wa-panel)] overflow-hidden" style={{ boxShadow: "var(--wa-dropdown-shadow)" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: "var(--wa-header)", color: "var(--wa-header-fg)" }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForwardingMessage(null)}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-[16px] font-medium">Forward message to</h3>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto overscroll-contain">
              {forwardTargets.length === 0 ? (
                <p className="p-6 text-[14px] text-[var(--wa-text-secondary)] text-center">
                  No contacts available to forward.
                </p>
              ) : (
                forwardTargets.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleForwardToUser(user._id)}
                    className="wa-chat-item flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--wa-panel-hover)] transition-colors"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="h-[42px] w-[42px] rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 border-b border-[var(--wa-divider)] pb-3">
                      <span className="text-[15px] text-[var(--wa-text-primary)] truncate block">
                        {user.fullName}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatContainer;
