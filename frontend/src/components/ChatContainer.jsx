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

function ChatContainer() {
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
      if (!map.has(user._id)) {
        map.set(user._id, user);
      }
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

    setContextMenu({
      message: msg,
      x: event.clientX,
      y: event.clientY,
    });
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
      mode === "voice"
        ? "/messages/translate/voice"
        : "/messages/translate/text";

    setReceiverTranslations((prev) => ({
      ...prev,
      [msg._id]: {
        ...prev[msg._id],
        isLoading: true,
      },
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
        [msg._id]: {
          ...prev[msg._id],
          isLoading: false,
        },
      }));
      toast.error(
        error.response?.data?.message || "Failed to translate message",
      );
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
      <ChatHeader />
      <div className="chat-theme-canvas flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-5">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-1.5">
            {messages.map((msg) =>
              (() => {
                const receiverTranslation = receiverTranslations[msg._id];

                return (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === authUser._id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      onContextMenu={(event) =>
                        handleOpenContextMenu(event, msg)
                      }
                      className={`relative w-fit max-w-[72%] rounded-2xl px-2.5 py-1.5 ${
                        msg.senderId === authUser._id
                          ? "bg-[var(--bubble-self-bg)] text-[var(--bubble-self-fg)]"
                          : "bg-[var(--bubble-peer-bg)] text-[var(--bubble-peer-fg)]"
                      }`}
                      style={{
                        boxShadow:
                          msg.senderId === authUser._id
                            ? "var(--bubble-self-shadow)"
                            : "var(--clay-shadow-raised)",
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      {msg.image && !msg.isDeleted && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-md h-32 w-full object-cover"
                        />
                      )}

                      {msg.audioUrl && !msg.isDeleted ? (
                        <div className={`${msg.image ? "mt-1" : ""}`}>
                          <audio
                            controls
                            src={msg.audioUrl}
                            className="h-9 max-w-full"
                          />

                          {msg.senderId !== authUser._id ? (
                            <button
                              type="button"
                              onClick={() =>
                                setAiToolsMessageId((current) =>
                                  current === msg._id ? null : msg._id,
                                )
                              }
                              className="mt-1 inline-flex items-center gap-1 rounded-md border border-[var(--panel-border)] px-2 py-1 text-[11px] text-slate-700 hover:bg-white/70 dark:text-zinc-200 dark:hover:bg-black/20"
                            >
                              <Bot className="h-3 w-3" /> AI services
                            </button>
                          ) : null}

                          {aiToolsMessageId === msg._id ? (
                            <div className="mt-2 rounded-md border border-[var(--panel-border)] bg-[var(--clay-surface)]/70 p-2">
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] font-medium text-slate-700 dark:text-zinc-200">
                                  AI services
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setAiToolsMessageId(null)}
                                  className="rounded p-1 text-slate-500 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-black/20"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <label className="text-[11px] text-slate-600 dark:text-zinc-300">
                                  Target
                                </label>
                                <select
                                  value={receiverTargetLanguage}
                                  onChange={(event) =>
                                    setReceiverTargetLanguage(
                                      event.target.value,
                                    )
                                  }
                                  className="rounded-md border border-[var(--panel-border)] bg-transparent px-2 py-1 text-[11px] text-slate-700 focus:outline-none dark:text-zinc-200"
                                >
                                  {TARGET_LANGUAGE_OPTIONS.map((lang) => (
                                    <option key={lang.value} value={lang.value}>
                                      {lang.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTranslateIncomingAudio(msg, "text")
                                  }
                                  disabled={Boolean(
                                    receiverTranslation?.isLoading,
                                  )}
                                  className="inline-flex items-center gap-1 rounded-md border border-[var(--panel-border)] px-2 py-1 text-[11px] text-slate-700 hover:bg-white/70 disabled:opacity-60 dark:text-zinc-200 dark:hover:bg-black/20"
                                >
                                  <FileText className="h-3 w-3" /> Text service
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTranslateIncomingAudio(msg, "voice")
                                  }
                                  disabled={Boolean(
                                    receiverTranslation?.isLoading,
                                  )}
                                  className="inline-flex items-center gap-1 rounded-md border border-[var(--panel-border)] px-2 py-1 text-[11px] text-slate-700 hover:bg-white/70 disabled:opacity-60 dark:text-zinc-200 dark:hover:bg-black/20"
                                >
                                  <Volume2 className="h-3 w-3" /> Voice service
                                </button>
                              </div>

                              {receiverTranslation?.isLoading ? (
                                <p className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                                  Translating...
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {msg.isDeleted ? (
                        <p className="text-xs italic text-slate-500">
                          This message was deleted
                        </p>
                      ) : null}

                      {msg.text && !msg.isDeleted && (
                        <p
                          className={`${msg.image ? "mt-1" : ""} text-[13px] leading-[1.2] whitespace-pre-wrap break-words`}
                        >
                          {msg.text}

                          <span className="ml-1 inline-flex items-center gap-0.5 align-bottom text-[9px] leading-none text-slate-500 tabular-nums">
                            {formatMessageTime(msg.createdAt)}
                            {msg.senderId === authUser._id ? (
                              msg.isRead ? (
                                <CheckCheck
                                  className="h-2.5 w-2.5 text-sky-500"
                                  strokeWidth={2.2}
                                />
                              ) : (
                                <Check
                                  className="h-2.5 w-2.5 text-slate-500"
                                  strokeWidth={2.2}
                                />
                              )
                            ) : null}
                          </span>
                        </p>
                      )}

                      {(receiverTranslation?.translatedText ||
                        msg.translation?.translatedText) &&
                      !msg.isDeleted ? (
                        <div className="mt-1 rounded-md bg-white/50 px-2 py-1 text-[11px] text-slate-700 dark:bg-black/20 dark:text-zinc-200">
                          {receiverTranslation?.translatedText ||
                            msg.translation?.translatedText}
                        </div>
                      ) : null}

                      {(receiverTranslation?.translatedAudio ||
                        msg.translation?.translatedAudioUrl) &&
                      !msg.isDeleted ? (
                        <div className="mt-1">
                          <audio
                            controls
                            src={
                              receiverTranslation?.translatedAudio ||
                              msg.translation?.translatedAudioUrl
                            }
                            className="h-9 max-w-full"
                          />
                        </div>
                      ) : null}

                      {(!msg.text &&
                        (msg.image || msg.audioUrl) &&
                        !msg.isDeleted) ||
                      msg.isDeleted ? (
                        <div className="mt-0.5 flex justify-end">
                          <span className="inline-flex items-center gap-0.5 text-[9px] leading-none text-slate-500 tabular-nums">
                            {formatMessageTime(msg.createdAt)}
                            {msg.senderId === authUser._id ? (
                              msg.isRead ? (
                                <CheckCheck
                                  className="h-2.5 w-2.5 text-sky-500"
                                  strokeWidth={2.2}
                                />
                              ) : (
                                <Check
                                  className="h-2.5 w-2.5 text-slate-500"
                                  strokeWidth={2.2}
                                />
                              )
                            ) : null}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })(),
            )}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      {contextMenu ? (
        <div
          className="fixed z-40 min-w-40 rounded-xl border border-[var(--floating-border)] bg-[var(--floating-bg)]/95 p-1 shadow-lg backdrop-blur-xl"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleReply(contextMenu.message)}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-slate-700 dark:text-zinc-200 hover:bg-white/70 dark:hover:bg-black/20"
          >
            <Reply className="h-3.5 w-3.5" /> Reply
          </button>

          <button
            type="button"
            onClick={() => handleForward(contextMenu.message)}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-slate-700 dark:text-zinc-200 hover:bg-white/70 dark:hover:bg-black/20"
          >
            <Forward className="h-3.5 w-3.5" /> Forward
          </button>

          <button
            type="button"
            disabled={contextMenu.message.senderId !== authUser._id}
            onClick={() => handleDelete(contextMenu.message._id)}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ) : null}

      {forwardingMessage ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--floating-border)] bg-[var(--floating-bg)]/95 p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Forward message
              </h3>
              <button
                type="button"
                onClick={() => setForwardingMessage(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-white/70 dark:text-zinc-400 dark:hover:bg-black/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {forwardTargets.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  No chats available to forward.
                </p>
              ) : (
                forwardTargets.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleForwardToUser(user._id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-[var(--floating-border)] px-3 py-2 text-left hover:bg-white/70 dark:hover:bg-black/20"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="truncate text-sm text-slate-800 dark:text-zinc-200">
                      {user.fullName}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ChatContainer;
