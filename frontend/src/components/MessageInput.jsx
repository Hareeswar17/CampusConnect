import { useCallback, useEffect, useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, Mic, SendIcon, Square, XIcon } from "lucide-react";

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const estimateBase64Bytes = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const commaIndex = dataUrl.indexOf(",");
  const base64Part = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return Math.floor((base64Part.length * 3) / 4);
};

const formatRecordingTime = (elapsedMs) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [audioDataUrl, setAudioDataUrl] = useState("");
  const [audioMimeType, setAudioMimeType] = useState("");
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [recognizedText, setRecognizedText] = useState("");

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartAtRef = useRef(0);
  const recognitionRef = useRef(null);
  const discardRecordingRef = useRef(false);

  const { sendMessage, isSoundEnabled, replyingTo, clearReplyingTo } =
    useChatStore();

  const clearAudioState = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioPreviewUrl("");
    setAudioDataUrl("");
    setAudioMimeType("");
    setAudioDurationMs(0);
    setRecordingElapsedMs(0);
    setRecognizedText("");
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }

      if (finalText.trim()) {
        setRecognizedText((prev) => `${prev} ${finalText}`.trim());
      }
    };

    recognition.onerror = () => {
      // Keep recording active even when recognition isn't available/allowed.
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = useCallback((discard = false) => {
    discardRecordingRef.current = discard;
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    stopSpeechRecognition();
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in this browser");
      return;
    }

    try {
      clearAudioState();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const selectedMimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          audioChunksRef.current = [];
          return;
        }

        try {
          const blob = new Blob(audioChunksRef.current, {
            type: (selectedMimeType || recorder.mimeType || "audio/webm").split(
              ";",
            )[0],
          });
          if (!blob.size) {
            return;
          }

          const objectUrl = URL.createObjectURL(blob);
          const base64Audio = await blobToDataUrl(blob);
          const durationMs = Math.max(
            0,
            Date.now() - recordingStartAtRef.current,
          );

          setAudioPreviewUrl(objectUrl);
          setAudioDataUrl(base64Audio);
          setAudioMimeType((blob.type || "audio/webm").split(";")[0]);
          setAudioDurationMs(durationMs);
        } catch {
          toast.error("Failed to process recorded audio");
        }
      };

      recordingStartAtRef.current = Date.now();
      setRecordingElapsedMs(0);
      discardRecordingRef.current = false;
      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      startSpeechRecognition();
    } catch {
      toast.error("Unable to access microphone");
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      stopRecording(false);
      return;
    }

    await startRecording();
  };

  const handleCancelRecording = () => {
    if (!isRecording) return;
    stopRecording(true);
    clearAudioState();
  };

  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
      setRecordingElapsedMs(
        Math.max(0, Date.now() - recordingStartAtRef.current),
      );
    }, 250);

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl, stopRecording]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioDataUrl) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    const audioBytes = estimateBase64Bytes(audioDataUrl);
    if (audioBytes > 6 * 1024 * 1024) {
      toast.error("Voice message is too large. Please record a shorter clip.");
      return;
    }

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      audio: audioDataUrl,
      audioMimeType,
      audioDurationMs,
      audioTranscript: recognizedText.trim() || undefined,
    });

    setText("");
    setImagePreview(null);
    clearAudioState();
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

      {isRecording ? (
        <div className="max-w-3xl mx-auto mb-3 rounded-xl border border-red-200 bg-red-50/80 p-3 backdrop-blur-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-300">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <p className="text-sm font-medium">Recording voice message...</p>
              <span className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-red-700 dark:bg-red-900/30 dark:text-red-200">
                {formatRecordingTime(recordingElapsedMs)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stopRecording(false)}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-white/70 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30"
              >
                Stop
              </button>

              <button
                type="button"
                onClick={handleCancelRecording}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-white/70 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {audioPreviewUrl ? (
        <div className="max-w-3xl mx-auto mb-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-soft)]/90 p-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <audio controls src={audioPreviewUrl} className="h-9" />

            <button
              type="button"
              onClick={clearAudioState}
              className="rounded-lg p-1 text-slate-500 hover:bg-white/70 dark:text-zinc-300 dark:hover:bg-black/20"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

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
          type="button"
          onClick={handleMicToggle}
          className={`rounded-xl border border-[var(--panel-border)] px-4 transition-colors duration-150 ${
            isRecording
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : "text-slate-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-black/20"
          }`}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <button
          type="submit"
          disabled={
            isRecording || (!text.trim() && !imagePreview && !audioDataUrl)
          }
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
