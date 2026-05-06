import { useCallback, useEffect, useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, Mic, Paperclip, SendIcon, Smile, Square, XIcon } from "lucide-react";

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
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
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

  const { sendMessage, isSoundEnabled, replyingTo, clearReplyingTo } = useChatStore();

  const hasContent = text.trim() || imagePreview || audioDataUrl;

  const clearAudioState = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
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
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      }
      if (finalText.trim()) setRecognizedText((prev) => `${prev} ${finalText}`.trim());
    };

    recognition.onerror = () => {};
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = useCallback((discard = false) => {
    discardRecordingRef.current = discard;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
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

      const preferredMimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const selectedMimeType = preferredMimeTypes.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          audioChunksRef.current = [];
          return;
        }
        try {
          const blob = new Blob(audioChunksRef.current, {
            type: (selectedMimeType || recorder.mimeType || "audio/webm").split(";")[0],
          });
          if (!blob.size) return;
          const objectUrl = URL.createObjectURL(blob);
          const base64Audio = await blobToDataUrl(blob);
          const durationMs = Math.max(0, Date.now() - recordingStartAtRef.current);
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
    if (isRecording) { stopRecording(false); return; }
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
      setRecordingElapsedMs(Math.max(0, Date.now() - recordingStartAtRef.current));
    }, 250);
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
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
    <div className="shrink-0 bg-[var(--wa-panel-header)] border-l border-[var(--wa-panel-border)]">
      {/* Reply bar */}
      {replyingTo && (
        <div className="px-[5%] md:px-[7%] lg:px-[10%] pt-2">
          <div className="rounded-lg bg-[var(--wa-panel)] border-l-[3px] border-[var(--wa-green)] px-3 py-2 flex items-center justify-between gap-3 shadow-sm">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[var(--wa-green)]">Reply</p>
              <p className="text-[13px] text-[var(--wa-text-secondary)] truncate mt-0.5">
                {replyingTo.text || "Media message"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearReplyingTo}
              className="rounded-full p-1.5 text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors shrink-0"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-[5%] md:px-[7%] lg:px-[10%] pt-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-[var(--wa-panel-border)]" />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-[var(--wa-panel-header)] border border-[var(--wa-panel-border)] flex items-center justify-center text-[var(--wa-icon)] hover:text-red-500 transition-colors shadow-sm"
              type="button"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-[5%] md:px-[7%] lg:px-[10%] pt-2">
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
              <span className="h-[10px] w-[10px] animate-pulse rounded-full bg-red-500 shrink-0" />
              <span className="text-[13px] font-medium">Recording</span>
              <span className="rounded bg-white/80 dark:bg-red-900/30 px-2 py-0.5 text-[12px] font-semibold tabular-nums">
                {formatRecordingTime(recordingElapsedMs)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => stopRecording(false)} className="rounded-md px-2.5 py-1 text-[12px] font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Stop</button>
              <button type="button" onClick={handleCancelRecording} className="rounded-md px-2.5 py-1 text-[12px] font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Audio preview */}
      {audioPreviewUrl && (
        <div className="px-[5%] md:px-[7%] lg:px-[10%] pt-2">
          <div className="rounded-lg bg-[var(--wa-panel)] border border-[var(--wa-panel-border)] px-3 py-2 flex items-center gap-3">
            <audio controls src={audioPreviewUrl} className="h-9 flex-1" />
            <button type="button" onClick={clearAudioState} className="rounded-full p-1.5 text-[var(--wa-icon)] hover:bg-[var(--wa-panel-hover)] transition-colors">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSendMessage} className="px-2.5 py-[6px] flex items-end gap-[5px]">
        {/* Left icons */}
        <button type="button" className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-[var(--wa-icon)] hover:text-[var(--wa-icon-hover)] hover:bg-[var(--wa-panel-hover)] transition-colors shrink-0" aria-label="Emoji">
          <Smile className="w-[24px] h-[24px]" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-[42px] h-[42px] flex items-center justify-center rounded-full transition-colors shrink-0 ${
            imagePreview ? "text-[var(--wa-green)]" : "text-[var(--wa-icon)] hover:text-[var(--wa-icon-hover)] hover:bg-[var(--wa-panel-hover)]"
          }`}
          aria-label="Attach"
        >
          <Paperclip className="w-[24px] h-[24px] rotate-45" />
        </button>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

        {/* Text input */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
            }}
            className="w-full rounded-lg bg-[var(--wa-input-bg)] border border-transparent px-3 py-[9px] text-[15px] text-[var(--wa-text-primary)] placeholder:text-[var(--wa-text-secondary)] focus:outline-none focus:border-[var(--wa-panel-border)] transition-colors"
            placeholder="Type a message"
          />
        </div>

        {/* Right: Mic ↔ Send */}
        {hasContent ? (
          <button
            type="submit"
            disabled={isRecording}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-[var(--wa-green)] text-white hover:bg-[var(--wa-green-deep)] active:scale-[0.95] disabled:opacity-50 transition-all shrink-0"
            aria-label="Send"
          >
            <SendIcon className="w-[20px] h-[20px]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-[42px] h-[42px] flex items-center justify-center rounded-full transition-all shrink-0 ${
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "text-[var(--wa-icon)] hover:text-[var(--wa-icon-hover)] hover:bg-[var(--wa-panel-hover)]"
            }`}
            aria-label={isRecording ? "Stop recording" : "Voice message"}
          >
            {isRecording ? <Square className="w-[18px] h-[18px]" /> : <Mic className="w-[24px] h-[24px]" />}
          </button>
        )}
      </form>
    </div>
  );
}
export default MessageInput;
