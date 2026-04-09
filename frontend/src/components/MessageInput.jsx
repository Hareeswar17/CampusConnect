import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled, replyingTo, clearReplyingTo } =
    useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="p-4 border-t border-[var(--panel-border)] bg-[var(--panel-bg)]/95 backdrop-blur-xl"
      style={{ boxShadow: "var(--clay-shadow-raised)" }}
    >
      {replyingTo ? (
        <div className="max-w-3xl mx-auto mb-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-soft)]/90 p-2 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
              Reply mode
            </p>

            <button
              type="button"
              onClick={clearReplyingTo}
              className="rounded-md p-1 text-slate-500 hover:bg-white/70 dark:text-zinc-400 dark:hover:bg-black/20"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-[var(--panel-border)]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--panel-soft)] flex items-center justify-center text-slate-700 dark:text-zinc-200 hover:bg-white/70 dark:hover:bg-black/20 transition-colors duration-150"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-4"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 rounded-xl border border-[var(--panel-border)] bg-[var(--clay-surface)]/90 py-2 px-4 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 backdrop-blur-sm"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border border-[var(--panel-border)] px-4 text-slate-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-black/20 transition-colors duration-150 ${
            imagePreview ? "text-brand-500 dark:text-brand-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="text-white rounded-xl px-4 py-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, var(--neon-accent) 0%, var(--neon-accent-2) 100%)",
            boxShadow: "var(--neon-glow)",
          }}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
